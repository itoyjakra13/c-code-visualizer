import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { ExecutionStep, Variable, StackFrame, HeapBlock } from "./types";

// Class to manage a running GDB session and synchronize commands using print-sentinel
class GdbSession {
  private gdbProcess: any;
  private stdoutBuffer: string = "";
  private pendingResolve: ((output: string) => void) | null = null;
  private isKilled: boolean = false;

  constructor(binaryPath: string) {
    this.gdbProcess = spawn("gdb", ["-q", "-nw", "-nh", binaryPath]);
    
    this.gdbProcess.stdout?.on("data", (data: any) => {
      this.stdoutBuffer += data.toString();
      this.checkSentinel();
    });

    this.gdbProcess.stderr?.on("data", (data: any) => {
      // Direct stderr logs can be useful for diagnostics
    });
  }

  private checkSentinel() {
    if (this.pendingResolve) {
      const sentinel = "\n--SENTINEL--\n";
      const index = this.stdoutBuffer.indexOf(sentinel);
      if (index !== -1) {
        const output = this.stdoutBuffer.substring(0, index);
        this.stdoutBuffer = this.stdoutBuffer.substring(index + sentinel.length);
        const resolve = this.pendingResolve;
        this.pendingResolve = null;
        resolve(output);
      }
    }
  }

  public runCommand(cmd: string): Promise<string> {
    if (this.isKilled) return Promise.resolve("");
    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      this.gdbProcess.stdin?.write(`${cmd}\nprintf "\\n--SENTINEL--\\n"\\n`);
    });
  }

  public kill() {
    if (this.isKilled) return;
    this.isKilled = true;
    this.gdbProcess.kill();
  }
}

// Function to run GCC compilation and GDB tracing on the backend
export async function compileAndTraceC(code: string): Promise<{ steps: ExecutionStep[]; errors: string[] }> {
  const steps: ExecutionStep[] = [];
  const errors: string[] = [];

  const tempId = Math.random().toString(36).substring(2, 10);
  const sourcePath = `/tmp/user_code_${tempId}.c`;
  const binaryPath = `/tmp/user_code_${tempId}`;

  try {
    // 1. Write user C code to a temporary file
    fs.writeFileSync(sourcePath, code);

    // 2. STAGE 1: Compilation Phase Validation
    const compileResult = await new Promise<{ code: number | null; stderr: string }>((resolve) => {
      const gcc = spawn("gcc", ["-Wall", "-g", sourcePath, "-o", binaryPath]);
      let stderr = "";
      gcc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      gcc.on("close", (code) => {
        resolve({ code, stderr });
      });
    });

    if (compileResult.code !== 0) {
      // Compile failed! Parse stderr to extract line numbers, columns, and message details
      const lines = compileResult.stderr.split("\n");
      for (const line of lines) {
        if (line.includes(sourcePath)) {
          // Format: /tmp/user_code_xxx.c:LINE:COL: error: MESSAGE
          const match = line.match(new RegExp(`${sourcePath}:(\\d+):(\\d+):\\s+(error|warning):\\s+(.+)$`));
          if (match) {
            const lineNum = parseInt(match[1], 10);
            const colNum = parseInt(match[2], 10);
            const severity = match[3];
            const msg = match[4];
            errors.push(`Line ${lineNum}, Col ${colNum} [${severity}]: ${msg}`);
          } else {
            // General compiler warnings/errors
            errors.push(line.replace(sourcePath, "code.c"));
          }
        } else if (line.trim() && !line.includes("In function") && !line.includes("In member function")) {
          errors.push(line.trim());
        }
      }

      // Cleanup source file
      try { fs.unlinkSync(sourcePath); } catch (e) {}
      return { steps, errors };
    }

    // 3. STAGE 2 & 3: Run compiled binary step-by-step using GDB
    const gdb = new GdbSession(binaryPath);

    // Set breakpoints at main, malloc, and free
    await gdb.runCommand("break main");
    await gdb.runCommand("break malloc");
    await gdb.runCommand("break free");

    // Start program execution
    let output = await gdb.runCommand("run");

    let currentStepNum = 0;
    const maxSteps = 1000; // STAGE 3: Infinite loop protection
    let currentConsole = "";
    const heapTracked: HeapBlock[] = [];
    let isTerminated = false;
    let crashSignal: string | null = null;
    let crashAddress: string | null = null;
    let crashedLine: number | null = null;

    while (currentStepNum < maxSteps) {
      // Check if program hit a breakpoint or completed
      if (output.includes("exited normally") || output.includes("exited with code") || output.includes("The program is not running")) {
        isTerminated = true;
        break;
      }

      // Check for Runtime Crash (Stage 2: Signals and Exceptions)
      const crashMatch = output.match(/Program received signal (SIGSEGV|SIGFPE|SIGABRT|SIGILL|SIGBUS),\s*([^.]+)\./i);
      if (crashMatch) {
        crashSignal = crashMatch[1];
        const crashExplanation = crashMatch[2];
        
        // Find target address for crashes if any
        const addrMatch = output.match(/0x[0-9a-fA-F]+/);
        crashAddress = addrMatch ? addrMatch[0] : null;

        // Try to get line of crash
        const frameOutput = await gdb.runCommand("frame");
        const lineMatch = frameOutput.match(/at\s+[^:]+:(\d+)/);
        crashedLine = lineMatch ? parseInt(lineMatch[1], 10) : (steps.length > 0 ? steps[steps.length - 1].line : 1);

        // Record final fatal crash step and break
        const lastStep = steps[steps.length - 1] || {
          line: crashedLine || 1,
          explanation: `Program crashed due to signal ${crashSignal} (${crashExplanation}).`,
          variables: [],
          stack: [],
          heap: [],
          console: currentConsole,
          highlights: { line: crashedLine || 1 }
        };

        steps.push({
          line: crashedLine || lastStep.line,
          explanation: `🛑 FATAL RUNTIME ERROR (${crashSignal}): ${crashExplanation}.${
            crashAddress ? ` Illegal memory access at address ${crashAddress}.` : ""
          } This typically happens due to dereferencing a NULL or uninitialized pointer, array out-of-bounds, or division by zero.`,
          variables: lastStep.variables,
          stack: lastStep.stack,
          heap: lastStep.heap,
          console: currentConsole + `\n[Process terminated by ${crashSignal}]\n`,
          highlights: { line: crashedLine || lastStep.line },
          expressionSteps: [`Fatal Exception: ${crashSignal}`]
        });

        break;
      }

      // Check if paused inside malloc/free breakpoints
      if (output.includes("Breakpoint") && output.includes("malloc")) {
        // We are at malloc entry!
        // Read size parameter. In x86_64, the first parameter is in $rdi
        const rdiOutput = await gdb.runCommand("print $rdi");
        const sizeMatch = rdiOutput.match(/=\s*(\d+)/);
        const allocSize = sizeMatch ? parseInt(sizeMatch[1], 10) : 8;

        // Step out of malloc to get return pointer
        const finishOutput = await gdb.runCommand("finish");
        const retMatch = finishOutput.match(/Value returned is \$[0-9]+\s*=\s*(void\s*\*|char\s*\*|int\s*\*|double\s*\*|struct\s+\w+\s*\*|0x[0-9a-fA-F]+)?\s*(0x[0-9a-fA-F]+)/);
        
        if (retMatch) {
          const rawAddr = retMatch[2];
          const address = parseInt(rawAddr, 16);
          if (address > 0) {
            heapTracked.push({
              id: `hb_${rawAddr}`,
              address,
              size: allocSize,
              type: "heap block",
              value: Array(Math.ceil(allocSize / 4)).fill("?"),
              isFree: false
            });
          }
        }

        // Advance to our source file line
        output = await gdb.runCommand("step");
        continue;
      }

      if (output.includes("Breakpoint") && output.includes("free")) {
        // We are at free entry! Get address to free from first argument ($rdi)
        const rdiOutput = await gdb.runCommand("print $rdi");
        const addrMatch = rdiOutput.match(/=\s*(0x[0-9a-fA-F]+)/);
        if (addrMatch) {
          const rawAddr = addrMatch[1];
          const address = parseInt(rawAddr, 16);
          const block = heapTracked.find(h => h.address === address);
          if (block) {
            if (block.isFree) {
              block.doubleFreeError = true;
            } else {
              block.isFree = true;
            }
          } else if (address !== 0) {
            // Freeing invalid address
            heapTracked.push({
              id: `hb_invalid_${rawAddr}`,
              address,
              size: 0,
              type: "invalid",
              value: [],
              isFree: true,
              invalidFreeError: true
            });
          }
        }

        // Finish free and step back to source file
        await gdb.runCommand("finish");
        output = await gdb.runCommand("step");
        continue;
      }

      // Check current position in user_code
      const lineInfo = await gdb.runCommand("info line");
      const userCodeMatch = lineInfo.match(/Line\s+(\d+)\s+of\s+"([^"]+)"/);

      if (userCodeMatch) {
        const lineNum = parseInt(userCodeMatch[1], 10);
        const fileName = userCodeMatch[2];

        // Ensure we are in the main C source, not standard headers
        if (fileName.includes(sourcePath)) {
          // Pause at this line. Retrieve variables and stacks
          const variables: Variable[] = [];
          const stack: StackFrame[] = [];

          // 1. Gather locals
          const localsOutput = await gdb.runCommand("info locals");
          const argsOutput = await gdb.runCommand("info args");

          const parseVars = async (rawText: string, scope: string) => {
            const varLines = rawText.split("\n");
            for (const vLine of varLines) {
              const eqMatch = vLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
              if (eqMatch) {
                const name = eqMatch[1];
                let rawVal = eqMatch[2].trim();

                // Get type
                const whatisOutput = await gdb.runCommand(`whatis ${name}`);
                const typeMatch = whatisOutput.match(/type\s*=\s*(.+)$/);
                const type = typeMatch ? typeMatch[1].trim() : "int";

                // Get address
                const addrOutput = await gdb.runCommand(`print &${name}`);
                const hexAddrMatch = addrOutput.match(/(0x[0-9a-fA-F]+)/);
                const address = hexAddrMatch ? parseInt(hexAddrMatch[1], 16) : 0;

                let isPointer = type.includes("*");
                let pointsTo: number | undefined;

                if (isPointer) {
                  const ptrAddrMatch = rawVal.match(/(0x[0-9a-fA-F]+)/);
                  if (ptrAddrMatch) {
                    pointsTo = parseInt(ptrAddrMatch[1], 16);
                  }
                }

                // If value is a structure
                let isStruct = type.startsWith("struct ");
                let structFields: Variable[] = [];

                if (isStruct && rawVal.startsWith("{")) {
                  // e.g. {x = 10, y = 20}
                  const fieldsText = rawVal.substring(1, rawVal.length - 1);
                  const fieldMatches = fieldsText.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^,]+)/g);
                  let fieldIdx = 0;
                  for (const fMatch of fieldMatches) {
                    structFields.push({
                      id: `v_field_${name}_${fMatch[1]}_${currentStepNum}`,
                      name: fMatch[1],
                      type: "int",
                      value: fMatch[2].trim(),
                      address: address + fieldIdx * 4,
                      scope
                    });
                    fieldIdx++;
                  }
                }

                variables.push({
                  id: `v_${name}_${scope}_${currentStepNum}`,
                  name,
                  type,
                  value: rawVal,
                  address,
                  scope,
                  isPointer,
                  pointsTo,
                  isStruct,
                  structFields: structFields.length > 0 ? structFields : undefined
                });
              }
            }
          };

          await parseVars(localsOutput, "main");
          await parseVars(argsOutput, "main");

          // 2. Format stack
          stack.push({
            id: `sf_main_${currentStepNum}`,
            functionName: "main",
            parameters: [],
            localVariables: [...variables]
          });

          // Check if variable values point to stack variables or heap blocks
          for (const v of variables) {
            if (v.isPointer && v.pointsTo) {
              const targetVar = variables.find(t => t.address === v.pointsTo);
              if (targetVar) {
                // Points to local variable
              } else {
                // Check if points to heap block
                const hb = heapTracked.find(h => h.address <= v.pointsTo! && v.pointsTo! < h.address + h.size);
                if (hb) {
                  // Points to heap block
                }
              }
            }
          }

          // Build explanation based on line and actions
          const codeLines = code.split("\n");
          const originalLine = codeLines[lineNum - 1]?.trim() || "";
          let explanation = `Executing line ${lineNum}: \`${originalLine}\`.`;

          if (originalLine.includes("printf")) {
            // Find recent printed output in gdb console
            explanation = `printf() prints formatted message to the standard console output.`;
          } else if (originalLine.includes("malloc")) {
            explanation = `Dynamically allocates memory on the Heap segment using malloc().`;
          } else if (originalLine.includes("free")) {
            explanation = `Deallocates heap memory segment to prevent any memory leaks.`;
          } else if (originalLine.includes("=") && !originalLine.includes("==")) {
            explanation = `Assigns/updates variable state: \`${originalLine}\`.`;
          } else if (originalLine.includes("if")) {
            explanation = `Evaluates condition for branch path: \`${originalLine}\`.`;
          } else if (originalLine.includes("for") || originalLine.includes("while")) {
            explanation = `Loop header evaluated: \`${originalLine}\`.`;
          }

          // Gather print output if any
          // GDB redirects trace output if we run normally, but we can capture console stdout!
          // Wait, how do we get printf output of the program?
          // Since the program runs inside GDB, any printf outputs to standard output.
          // By default, GDB directs program output directly to terminal or GDB tty.
          // In GDB, we can redirect inferior output to a temporary file!
          // Yes! We can redirect: "run > /tmp/user_out"
          // Or we can query the output by reading /tmp/user_out!
          // Let's implement that!
          // If we redirect run, wait, if we redirect, does it work line-by-line?
          // Yes! Since standard output is buffered or written on \n, we can read the file!
          // But to be even safer, we can redirect output to `/tmp/user_output_${tempId}.txt` using GDB:
          // `run > /tmp/user_output_${tempId}.txt`
          // Wait, is it simpler? Let's check.
          // If the output file exists, we can read it to populate `currentConsole`.
          const outFilePath = `/tmp/user_output_${tempId}.txt`;
          if (fs.existsSync(outFilePath)) {
            currentConsole = fs.readFileSync(outFilePath, "utf8");
          }

          steps.push({
            line: lineNum,
            explanation,
            variables,
            stack,
            heap: heapTracked.map(h => ({ ...h, value: [...h.value] })),
            console: currentConsole || "Simulation running...",
            highlights: {
              line: lineNum,
              variables: variables.map(v => v.name)
            },
            expressionSteps: [`Execute: ${originalLine}`]
          });
        }
      }

      // Step forward
      output = await gdb.runCommand("step");
      currentStepNum++;
    }

    if (currentStepNum >= maxSteps && !isTerminated) {
      // STAGE 3 warning banner addition
      steps.push({
        line: steps.length > 0 ? steps[steps.length - 1].line : 1,
        explanation: "⚠️ Infinite Loop Protection: Program exceeded 1,000 steps. Execution truncated to prevent browser freeze. Check for infinite loops or unbounded recursion.",
        variables: steps.length > 0 ? steps[steps.length - 1].variables : [],
        stack: steps.length > 0 ? steps[steps.length - 1].stack : [],
        heap: steps.length > 0 ? steps[steps.length - 1].heap : [],
        console: currentConsole + "\n[Execution truncated: Exceeded 1,000 steps]\n",
        highlights: { line: steps.length > 0 ? steps[steps.length - 1].line : 1 },
        expressionSteps: ["Step limit exceeded"]
      });
    }

    // Terminate GDB
    gdb.kill();

  } catch (err: any) {
    console.error("GDB Executor Error:", err);
    errors.push(`Simulator error: ${err.message || err}`);
  } finally {
    // Clean up temporary files
    try { fs.unlinkSync(sourcePath); } catch (e) {}
    try { fs.unlinkSync(binaryPath); } catch (e) {}
    try { fs.unlinkSync(`/tmp/user_output_${tempId}.txt`); } catch (e) {}
  }

  // Fallback if no steps were recorded but no compilation errors occurred
  if (steps.length === 0 && errors.length === 0) {
    steps.push({
      line: 1,
      explanation: "No steps recorded. Program might be empty or exited immediately.",
      variables: [],
      stack: [],
      heap: [],
      console: "Program started and ended instantly.",
      highlights: { line: 1 }
    });
  }

  return { steps, errors };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExecutionStep, Variable, StackFrame, HeapBlock } from "./types";

// Helper to strip comments
function cleanCode(code: string): string[] {
  return code.split("\n").map(line => {
    // Strip single line comments
    let cleaned = line.split("//")[0];
    return cleaned.trim();
  });
}

// Simple AST-like simulator for custom simple C code
export function parseAndSimulateC(code: string): { steps: ExecutionStep[]; errors: string[] } {
  const steps: ExecutionStep[] = [];
  const errors: string[] = [];
  const lines = code.split("\n");
  const cleanedLines = cleanCode(code);

  // States
  let currentConsole = "";
  const variables: Variable[] = [];
  const stack: StackFrame[] = [{ id: "main_frame", functionName: "main", parameters: [], localVariables: [] }];
  const heap: HeapBlock[] = [];
  let nextStackAddress = 0x1000;
  let nextHeapAddress = 0x3000;

  // Let's identify variable declarations or updates
  // int x = 5;
  // float y = 10.5;
  // char c = 'h';
  // int* p = &x;
  // *p = 20;
  // printf("...", x);
  // malloc(...)

  // We will loop line by line to build an execution timeline.
  // To simulate loops or standard execution flow:
  // For standard user entries, a sequential walk is extremely clear,
  // and we can parse basic constructs!
  
  let i = 0;
  let limit = 100; // loop safety limits
  let loopCount = 0;

  while (i < lines.length && loopCount < limit) {
    loopCount++;
    const lineText = cleanedLines[i];
    const originalLine = lines[i].trim();
    const lineNum = i + 1; // 1-indexed for frontend display

    // Skip empty or purely syntax lines like brackets/headers
    if (!lineText || lineText === "{" || lineText === "}" || lineText.startsWith("#include") || lineText.startsWith("int main")) {
      i++;
      continue;
    }

    // Prepare steps
    let hasStateChange = false;
    let explanation = "";
    const changedVarNames: string[] = [];
    const changedAddresses: number[] = [];
    const expressionSteps: string[] = [];

    // Check 1: Pointer Dereference Write, e.g. *ptr = 50; or *ptr = val;
    const derefMatch = lineText.match(/^\*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+);$/);
    if (derefMatch) {
      const ptrName = derefMatch[1];
      const rValueExpr = derefMatch[2].trim();

      // Find pointer
      const ptrVar = variables.find(v => v.name === ptrName && v.isPointer);
      if (ptrVar && ptrVar.pointsTo) {
        const targetAddress = ptrVar.pointsTo;
        // Evaluate rValueExpr
        let resolvedVal = rValueExpr;
        // is rValueExpr a variable?
        const sourceVar = variables.find(v => v.name === rValueExpr);
        if (sourceVar) {
          resolvedVal = sourceVar.value;
        }

        // Find what it points to: could be a stack variable or heap cell
        const targetStackVar = variables.find(v => v.address === targetAddress);
        if (targetStackVar) {
          targetStackVar.value = resolvedVal;
          targetStackVar.isUpdated = true;
          changedVarNames.push(targetStackVar.name);
          changedAddresses.push(targetAddress);
          explanation = `Dereferenced pointer '${ptrName}' pointing to address 0x${targetAddress.toString(16)}. Updated the value stored there to ${resolvedVal}.`;
          expressionSteps.push(`*${ptrName} -> target address: 0x${targetAddress.toString(16)}`, `*0x${targetAddress.toString(16)} = ${resolvedVal}`);
          hasStateChange = true;
        } else {
          // Check heap block
          const targetHeapBlock = heap.find(hb => hb.address <= targetAddress && targetAddress < hb.address + hb.size);
          if (targetHeapBlock && !targetHeapBlock.isFree) {
            const cellIndex = Math.floor((targetAddress - targetHeapBlock.address) / 4);
            if (cellIndex >= 0 && cellIndex < targetHeapBlock.value.length) {
              targetHeapBlock.value[cellIndex] = resolvedVal;
              explanation = `Dereferenced pointer '${ptrName}' targeting Heap address 0x${targetAddress.toString(16)}. Stored value ${resolvedVal} inside the dynamically allocated block.`;
              expressionSteps.push(`*${ptrName} -> target address 0x${targetAddress.toString(16)}`, `Heap cell[${cellIndex}] = ${resolvedVal}`);
              hasStateChange = true;
            }
          }
        }
      } else {
        errors.push(`Line ${lineNum}: Pointer '${ptrName}' is uninitialized or invalid.`);
      }
    }

    // Check 2: Variable declaration, e.g. int x = 10; float y = 5.5; char c = 'A'; struct Point p1;
    // Or pointer declaration: int* ptr = &x;
    const declMatch = lineText.match(/^(int|float|double|char|struct\s+[a-zA-Z_][a-zA-Z0-9_]*)\s+(\*?)([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*=\s*(.+))?;$/);
    if (declMatch && !hasStateChange) {
      const type = declMatch[1];
      const isStarred = declMatch[2] === "*";
      const name = declMatch[3];
      const initializer = declMatch[4] ? declMatch[4].trim() : undefined;

      const varAddress = nextStackAddress;
      nextStackAddress += 4; // increment simulated stack address

      let value = "?";
      let pointsTo: number | undefined;
      let isPointer = isStarred;

      if (initializer) {
        // Is it a reference? e.g. &val
        if (initializer.startsWith("&")) {
          const targetName = initializer.substring(1).trim();
          const targetVar = variables.find(v => v.name === targetName);
          if (targetVar) {
            value = `0x${targetVar.address.toString(16)}`;
            pointsTo = targetVar.address;
            isPointer = true;
            explanation = `Created a pointer variable '${name}' pointing to the address of '${targetName}' (0x${targetVar.address.toString(16)}).`;
            expressionSteps.push(`&${targetName} -> 0x${targetVar.address.toString(16)}`, `${name} = 0x${targetVar.address.toString(16)}`);
          } else {
            value = "0x0";
            explanation = `Created a pointer variable '${name}' but the reference target '${targetName}' was not found.`;
          }
        } 
        // Is it a malloc? e.g. malloc(sizeof(int)) or malloc(8)
        else if (initializer.includes("malloc")) {
          const heapAddr = nextHeapAddress;
          nextHeapAddress += 16; // increment heap allocation block space

          let size = 4;
          if (initializer.includes("sizeof")) {
            size = 8; // assume array or larger block size
          }

          const newBlock: HeapBlock = {
            id: `hb_${heapAddr}`,
            address: heapAddr,
            size,
            type: "malloc block",
            value: ["?"],
            isFree: false
          };
          heap.push(newBlock);

          value = `0x${heapAddr.toString(16)}`;
          pointsTo = heapAddr;
          isPointer = true;
          explanation = `malloc() allocated ${size} bytes on the dynamic Heap at address 0x${heapAddr.toString(16)}. Pointer '${name}' stores this address.`;
          expressionSteps.push(`malloc() -> Heap block at 0x${heapAddr.toString(16)}`, `${name} = 0x${heapAddr.toString(16)}`);
        }
        // Standard constant or arithmetic initializer
        else {
          value = initializer;
          // check if initializer references another variable, e.g. x + 5
          const words = initializer.split(/[\s+\-*/%()]+/);
          let resolvedExpr = initializer;
          words.forEach(w => {
            const matchedVar = variables.find(v => v.name === w.trim());
            if (matchedVar) {
              resolvedExpr = resolvedExpr.replace(w.trim(), matchedVar.value);
            }
          });

          // simple evaluation
          try {
            // strip safety for browser-based expression eval
            const cleanedExpr = resolvedExpr.replace(/[^0-9. +\-*/()]/g, "");
            if (cleanedExpr) {
              const evaled = Function(`"use strict"; return (${cleanedExpr})`)();
              value = String(evaled);
              expressionSteps.push(`Evaluate expression: ${initializer} -> ${resolvedExpr} -> ${value}`);
            }
          } catch (e) {
            value = initializer;
          }

          explanation = `Created local variable '${name}' of type '${type}' and set its value to ${value}.`;
        }
      } else {
        explanation = `Declared variable '${name}' of type '${type}' with an uninitialized state.`;
      }

      const newVar: Variable = {
        id: `v_${name}_${lineNum}`,
        name,
        type: type + (isStarred ? "*" : ""),
        value,
        address: varAddress,
        scope: "main",
        isPointer,
        pointsTo
      };

      variables.push(newVar);
      changedVarNames.push(name);
      changedAddresses.push(varAddress);
      hasStateChange = true;
    }

    // Check 3: Variable reassignment, e.g. x = 20; or x = x + 5;
    const assignMatch = lineText.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+);$/);
    if (assignMatch && !hasStateChange) {
      const name = assignMatch[1];
      const rValueExpr = assignMatch[2].trim();

      const existingVar = variables.find(v => v.name === name);
      if (existingVar) {
        let value = rValueExpr;
        let pointsTo: number | undefined;

        if (rValueExpr.startsWith("&")) {
          const targetName = rValueExpr.substring(1).trim();
          const targetVar = variables.find(v => v.name === targetName);
          if (targetVar) {
            value = `0x${targetVar.address.toString(16)}`;
            pointsTo = targetVar.address;
            existingVar.isPointer = true;
            existingVar.pointsTo = pointsTo;
            explanation = `Assigned address of '${targetName}' to pointer '${name}'.`;
            expressionSteps.push(`&${targetName} -> 0x${targetVar.address.toString(16)}`, `${name} = 0x${targetVar.address.toString(16)}`);
          }
        } else {
          // Resolve algebraic expression variables
          const words = rValueExpr.split(/[\s+\-*/%()]+/);
          let resolvedExpr = rValueExpr;
          words.forEach(w => {
            const matchedVar = variables.find(v => v.name === w.trim());
            if (matchedVar) {
              resolvedExpr = resolvedExpr.replace(w.trim(), matchedVar.value);
            }
          });

          try {
            const cleanedExpr = resolvedExpr.replace(/[^0-9. +\-*/()]/g, "");
            if (cleanedExpr) {
              const evaled = Function(`"use strict"; return (${cleanedExpr})`)();
              value = String(evaled);
              expressionSteps.push(`Evaluate: ${rValueExpr} -> ${resolvedExpr} -> ${value}`);
            }
          } catch (e) {
            value = rValueExpr;
          }

          explanation = `Updated variable '${name}' to value ${value}.`;
        }

        existingVar.value = value;
        existingVar.isUpdated = true;
        changedVarNames.push(name);
        changedAddresses.push(existingVar.address);
        hasStateChange = true;
      }
    }

    // Check 4: printf, e.g. printf("Hello %d\n", x);
    const printfMatch = lineText.match(/^printf\s*\((.+)\);$/);
    if (printfMatch && !hasStateChange) {
      const argsText = printfMatch[1];
      const parts = argsText.split(",");
      const formatString = parts[0].trim().replace(/^"|"$/g, ""); // strip quotes
      
      let printed = formatString;
      
      // Basic format specifier matching
      for (let k = 1; k < parts.length; k++) {
        const argName = parts[k].trim();
        const argVar = variables.find(v => v.name === argName);
        if (argVar) {
          printed = printed.replace(/%[dfp]/, argVar.value);
        } else {
          printed = printed.replace(/%[dfp]/, argName);
        }
      }

      // handle newlines
      printed = printed.replace(/\\n/g, "\n");
      currentConsole += printed;
      
      explanation = `printf() outputs '${printed.trim()}' to the console.`;
      expressionSteps.push(`printf(${argsText}) -> outputted text`);
      hasStateChange = true;
    }

    // Check 5: free(ptr)
    const freeMatch = lineText.match(/^free\s*\(([a-zA-Z_][a-zA-Z0-9_]*)\);$/);
    if (freeMatch && !hasStateChange) {
      const ptrName = freeMatch[1];
      const ptrVar = variables.find(v => v.name === ptrName);
      if (ptrVar && ptrVar.pointsTo) {
        const addressToFree = ptrVar.pointsTo;
        const block = heap.find(hb => hb.address === addressToFree);
        
        if (block) {
          if (block.isFree) {
            block.doubleFreeError = true;
            explanation = `⚠️ DOUBLE FREE ERROR: You are trying to free address 0x${addressToFree.toString(16)} which has already been freed! This causes memory corruption.`;
            errors.push(`Double free of address 0x${addressToFree.toString(16)} detected.`);
          } else {
            block.isFree = true;
            explanation = `Successfully deallocated Heap memory block at address 0x${addressToFree.toString(16)} using free().`;
            ptrVar.value = `${ptrVar.value} (Dangling)`;
          }
        } else {
          explanation = `⚠️ INVALID FREE ERROR: Trying to free address 0x${addressToFree.toString(16)} which was not allocated on the Heap.`;
          errors.push(`Invalid free of address 0x${addressToFree.toString(16)}.`);
        }
      } else {
        explanation = `⚠️ INVALID FREE ERROR: '${ptrName}' is not a valid allocated Heap pointer.`;
      }
      hasStateChange = true;
    }

    // Build the execution step snapshot
    if (hasStateChange) {
      // Clone arrays of variables and stack frames to avoid mutations across steps
      const varsClone = variables.map(v => ({ ...v }));
      const heapClone = heap.map(h => ({ ...h, value: [...h.value] }));
      const stackClone: StackFrame[] = [{
        id: "main_frame",
        functionName: "main",
        parameters: [],
        localVariables: varsClone
      }];

      steps.push({
        line: lineNum,
        explanation: explanation || `Executing: ${originalLine}`,
        variables: varsClone,
        stack: stackClone,
        heap: heapClone,
        console: currentConsole,
        highlights: {
          line: lineNum,
          variables: changedVarNames,
          memoryAddresses: changedAddresses
        },
        expressionSteps: expressionSteps.length > 0 ? expressionSteps : [`Execute: ${originalLine}`]
      });

      // Clear update indicators for next steps
      variables.forEach(v => { v.isUpdated = false; });
    }

    i++;
  }

  // Final memory leak check
  const activeLeaks = heap.filter(b => !b.isFree);
  if (activeLeaks.length > 0 && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    activeLeaks.forEach(l => { l.hasLeak = true; });
    lastStep.explanation += `\n⚠️ MEMORY LEAK WARNING: Program ended but dynamic memory block at 0x${activeLeaks[0].address.toString(16)} was never freed. You should call free() to avoid leaks!`;
  }

  // Fallback step
  if (steps.length === 0) {
    steps.push({
      line: 1,
      explanation: "Empty program or entry point starting.",
      variables: [],
      stack: [{ id: "main_frame", functionName: "main", parameters: [], localVariables: [] }],
      heap: [],
      console: currentConsole || "Simulation started.\n",
      highlights: { line: 1 },
      expressionSteps: ["Initial program load"]
    });
  }

  return { steps, errors };
}

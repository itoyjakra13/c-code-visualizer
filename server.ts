import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { parseAndSimulateC } from "./src/interpreter.ts";
import { compileAndTraceC } from "./src/gdb_executor.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes

// Route 0: Interactive C compilation and step-by-step tracing
app.post("/api/simulate", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    // Check if gcc and gdb are installed in the container
    let hasGdb = false;
    try {
      execSync("which gcc && which gdb", { stdio: "ignore" });
      hasGdb = true;
    } catch (e) {
      // GCC/GDB not fully installed yet or not available
    }

    if (hasGdb) {
      console.log("Running real GDB-based trace...");
      const result = await compileAndTraceC(code);
      res.json(result);
    } else {
      console.log("GCC/GDB not ready. Falling back to lightweight C interpreter simulator...");
      const result = parseAndSimulateC(code);
      res.json(result);
    }
  } catch (error: any) {
    console.error("API Simulate Error:", error);
    res.status(500).json({ error: error.message || "Failed to simulate C code execution." });
  }
});

// Route 1: Get AI code explanations for beginner mode
app.post("/api/explain", async (req, res) => {
  try {
    const { code, line, context } = req.body;
    if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    const client = getGeminiClient();
    
    let prompt = `You are an expert friendly C programming teacher. Help a absolute beginner understand this C code.
Code:
\`\`\`c
${code}
\`\`\`
`;

    if (line !== undefined) {
      prompt += `Specifically, explain what happens on line ${line} in plain, gentle English. Keep the response to 2-3 sentences. Do not use overly technical jargon. Explain variables, types, or actions clearly.`;
    } else if (context === "general") {
      prompt += `Provide a high-level conceptual explanation of how this entire C program runs, what algorithm it uses, and what its main structures (loops, variables, pointers, functions) do. Keep it highly educational, with bullet points for key concepts.`;
    } else {
      prompt += `Explain the variables and scope of this code simply.`;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an encouraging, professional, and clear C language tutor who explains technical concepts in terms a 10-year-old could easily grasp. Avoid dense vocabulary. Use simple bullet points if explaining multiple items."
      }
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Gemini Explain Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate AI explanation.",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// Route 2: Get AI compiler error/bug suggestions
app.post("/api/debug", async (req, res) => {
  try {
    const { code, errorMsg } = req.body;
    if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    const client = getGeminiClient();

    let prompt = `You are a friendly compiler assistant. A beginner is writing the following C code and might have compile or logical errors.
Code:
\`\`\`c
${code}
\`\`\`
`;

    if (errorMsg) {
      prompt += `The simulator or compiler reported this error: "${errorMsg}".`;
    }

    prompt += `
Analyze the code for standard syntax errors (like missing semicolons, mismatching braces, wrong pointer dereferences, uninitialized variables, format specifier mismatches in printf, or dynamic memory leaks).
Provide:
1. A beginner-friendly translation of the error or bug.
2. An elegant explanation of WHY it is wrong.
3. A clear suggestion or code fix.
Keep your response structured in neat JSON format with keys:
"hasErrors": boolean,
"errorSummary": string (brief summary),
"explanation": string (friendly explanation),
"line": number (line of error, 1-indexed, or null if general),
"suggestion": string (how to fix)
Return ONLY the raw JSON block without markdown formatting or code blocks.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an automated debugger assistant for learning C. You must only output a valid JSON object matching the requested schema. Do not wrap it in markdown codeblocks."
      }
    });

    try {
      const parsed = JSON.parse(response.text.trim());
      res.json(parsed);
    } catch (parseErr) {
      res.json({
        hasErrors: true,
        errorSummary: "Syntax/Logic Issue Detected",
        explanation: response.text,
        line: null,
        suggestion: "Please review your brackets, pointers, and semi-colons."
      });
    }
  } catch (error: any) {
    console.error("Gemini Debug Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to debug code.",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`C Visualizer full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

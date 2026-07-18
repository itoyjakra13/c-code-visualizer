/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Code, HelpCircle, AlertOctagon, Sparkles, Wand2, ArrowRight } from "lucide-react";
import { CProgram } from "../types";
import { EXAMPLES } from "../examples";

interface CodeEditorProps {
  currentCode: string;
  onChangeCode: (code: string) => void;
  selectedExampleId: string;
  onSelectExample: (id: string) => void;
  currentStepLine: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  isPlaying: boolean;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  compileErrors?: string[];
  isCompiling?: boolean;
}

export default function CodeEditor({
  currentCode,
  onChangeCode,
  selectedExampleId,
  onSelectExample,
  currentStepLine,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  isPlaying,
  speed,
  onChangeSpeed,
  compileErrors = [],
  isCompiling = false
}: CodeEditorProps) {
  const [aiExplanation, setAiExplanation] = React.useState<string>("");
  
  const errorLines = React.useMemo(() => {
    const linesSet = new Set<number>();
    for (const err of compileErrors) {
      const match = err.match(/Line\s+(\d+)/i);
      if (match) {
        linesSet.add(parseInt(match[1], 10));
      }
    }
    return linesSet;
  }, [compileErrors]);
  const [loadingAi, setLoadingAi] = React.useState(false);
  const [aiDebugInfo, setAiDebugInfo] = React.useState<{ hasErrors: boolean; errorSummary: string; explanation: string; line: number | null; suggestion: string } | null>(null);

  // Ask Gemini to explain the whole program conceptually
  const handleAiExplainGeneral = async () => {
    setLoadingAi(true);
    setAiExplanation("");
    setAiDebugInfo(null);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode, context: "general" })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation(data.error || "Could not retrieve AI explanation. Check that GEMINI_API_KEY is configured.");
      }
    } catch (err) {
      setAiExplanation("Connection error. Could not reach server explanation endpoint.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Ask Gemini to audit/debug the current code
  const handleAiDebug = async () => {
    setLoadingAi(true);
    setAiExplanation("");
    setAiDebugInfo(null);
    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode })
      });
      const data = await response.json();
      setAiDebugInfo(data);
    } catch (err) {
      setAiExplanation("Connection error. Could not reach server debug endpoint.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Basic syntax coloring
  const lines = currentCode.split("\n");

  return (
    <div id="code-editor-container" className="flex flex-col h-full bento-panel rounded-xl overflow-hidden">
      
      {/* Top bar with load sample and AI Assist */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22]/90 border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-xs font-bold text-[#e6edf3] font-mono uppercase tracking-wider">C Code Workspace</span>
        </div>

        {/* Load examples dropdown */}
        <div className="flex items-center space-x-2">
          <select
            id="example-selector"
            value={selectedExampleId}
            onChange={(e) => onSelectExample(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#c9d1d9] px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#58a6ff] font-mono"
          >
            <option value="custom">-- Custom Sandbox Code --</option>
            {EXAMPLES.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Space and Line Numbers */}
      <div className="flex-1 flex overflow-hidden font-mono text-sm leading-relaxed relative">
        {/* Compiling Spinner Overlay */}
        {isCompiling && (
          <div className="absolute inset-0 bg-[#0d1117]/75 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-3 z-30">
            <div className="w-8 h-8 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#e6edf3] font-mono">Compiling & Analyzing C Code...</span>
          </div>
        )}

        {/* Line Gutter with Execution Pointers and Compile Error Badges */}
        <div className="w-12 bg-[#0d1117]/80 border-r border-[#30363d] text-right select-none flex flex-col pt-4 pr-2 space-y-0.5">
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = lineNum === currentStepLine;
            const hasError = errorLines.has(lineNum);
            return (
              <div key={idx} className="h-[21px] flex items-center justify-end space-x-1">
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-[#58a6ff] ring-2 ring-[#58a6ff]/20 animate-pulse flex-shrink-0" title="Executing Line" />
                )}
                {hasError && (
                  <span className="w-2 h-2 rounded-full bg-[#ff7b72] flex-shrink-0" title="Compile Error" />
                )}
                <span className={`text-[11px] font-mono font-medium ${
                  isCurrent ? "text-[#58a6ff]" : hasError ? "text-[#ff7b72] font-bold" : "text-[#8b949e]"
                }`}>
                  {lineNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Interactive Textarea with simple highlight line matching */}
        <div className="flex-1 relative overflow-auto pt-4 pl-3 bg-transparent">
          {/* Overlay line highlights behind textarea */}
          <div className="absolute inset-0 pointer-events-none pt-4 pl-3">
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === currentStepLine;
              const hasError = errorLines.has(lineNum);
              return (
                <div
                  key={idx}
                  className={`h-[21px] w-full ${
                    isCurrent ? "bento-line-highlight" : hasError ? "bg-red-950/20 border-l-2 border-[#ff7b72]" : ""
                  }`}
                />
              );
            })}
          </div>

          <textarea
            id="c-code-textarea"
            value={currentCode}
            onChange={(e) => onChangeCode(e.target.value)}
            className="absolute inset-0 pt-4 pl-3 bg-transparent text-[#e6edf3] font-mono text-xs leading-[21px] outline-none border-none resize-none overflow-auto focus:ring-0 w-full h-full select-text selection:bg-[#30363d]/60"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Code Control Panel */}
      <div className="bg-[#161b22]/50 border-t border-[#30363d] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5">
          <button
            id="btn-step-back"
            onClick={onStepBackward}
            className="p-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]/50 rounded-lg transition"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          {isPlaying ? (
            <button
              id="btn-pause"
              onClick={onPause}
              className="p-2 text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-play"
              onClick={onPlay}
              className="p-2 text-white bg-[#238636] hover:bg-[#2ea043] rounded-lg transition"
              title="Play Simulation"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          <button
            id="btn-step-forward"
            onClick={onStepForward}
            className="p-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]/50 rounded-lg transition"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            id="btn-reset"
            onClick={onReset}
            className="p-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]/50 rounded-lg transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment */}
        <div className="flex items-center space-x-3 text-[#c9d1d9] font-mono text-xs">
          <span className="font-semibold text-[#8b949e]">Speed:</span>
          <div className="flex bg-[#0d1117] rounded-lg p-0.5 border border-[#30363d]">
            {[0.25, 0.5, 1, 2].map((s) => (
              <button
                key={s}
                id={`btn-speed-${s}x`}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all duration-150 ${
                  speed === s ? "bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20" : "hover:text-[#e6edf3]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Assistant Card / Tab */}
      <div className="bg-[#161b22]/80 border-t border-[#30363d] px-4 py-3 space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[#c9d1d9]">
            <Sparkles className="w-4 h-4 text-[#d2a8ff] animate-pulse" />
            <span className="text-xs font-semibold font-mono">Gemini AI Tutor Companion</span>
          </div>
          <div className="flex space-x-1.5">
            <button
              id="btn-ai-explain"
              disabled={loadingAi}
              onClick={handleAiExplainGeneral}
              className="px-2.5 py-1 text-[10px] font-bold bg-[#d2a8ff]/10 text-[#d2a8ff] border border-[#d2a8ff]/20 hover:bg-[#d2a8ff]/20 rounded transition flex items-center space-x-1 disabled:opacity-40 font-mono"
            >
              <Wand2 className="w-3 h-3" />
              <span>AI Explain</span>
            </button>
            <button
              id="btn-ai-audit"
              disabled={loadingAi}
              onClick={handleAiDebug}
              className="px-2.5 py-1 text-[10px] font-bold bg-[#ff7b72]/10 text-[#ff7b72] border border-[#ff7b72]/20 hover:bg-[#ff7b72]/20 rounded transition flex items-center space-x-1 disabled:opacity-40 font-mono"
            >
              <AlertOctagon className="w-3 h-3" />
              <span>AI Debug</span>
            </button>
          </div>
        </div>

        {/* AI Answers output display */}
        {(aiExplanation || loadingAi || aiDebugInfo) && (
          <div className="bg-[#11111b] border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 max-h-36 overflow-y-auto scrollbar-thin">
            {loadingAi ? (
              <div className="flex items-center justify-center space-x-2 py-3 text-slate-500">
                <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>AI is analyzing your C code workspace...</span>
              </div>
            ) : aiExplanation ? (
              <p className="leading-relaxed whitespace-pre-wrap font-medium">{aiExplanation}</p>
            ) : aiDebugInfo ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase text-[10px]">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>{aiDebugInfo.errorSummary}</span>
                </div>
                <p className="text-slate-300 font-medium">{aiDebugInfo.explanation}</p>
                {aiDebugInfo.suggestion && (
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded flex flex-col space-y-1">
                    <span className="font-bold text-emerald-400 text-[10px] uppercase">Suggested fix:</span>
                    <p className="text-slate-400 font-mono text-[11px] leading-normal">{aiDebugInfo.suggestion}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Compiler Error Panel (Stage 1 validation outcome) */}
      {compileErrors.length > 0 && (
        <div id="compiler-error-panel" className="bg-[#1c1212] border-t border-[#ff7b72]/40 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-[#ff7b72] font-bold text-xs uppercase tracking-wider font-mono">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>Compiler Error Panel</span>
          </div>
          <div className="bg-[#0d0707] border border-[#ff7b72]/20 rounded-lg p-3 max-h-36 overflow-y-auto font-mono text-xs text-[#ff7b72] space-y-1.5 leading-relaxed scrollbar-thin">
            {compileErrors.map((err, idx) => (
              <div key={idx} className="flex items-start space-x-1.5">
                <span className="text-[#ff7b72]/60 select-none font-bold">▶</span>
                <span className="whitespace-pre-wrap">{err}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

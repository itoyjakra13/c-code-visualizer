/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Terminal, Copy, Trash2, ArrowRight } from "lucide-react";

interface ConsoleTerminalProps {
  consoleOutput: string;
  onClear: () => void;
  onInputSubmit?: (input: string) => void;
}

export default function ConsoleTerminal({ consoleOutput, onClear, onInputSubmit }: ConsoleTerminalProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onInputSubmit) {
      onInputSubmit(inputValue);
      setInputValue("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(consoleOutput);
  };

  return (
    <div id="console-terminal-wrapper" className="flex flex-col h-full bento-panel rounded-xl overflow-hidden font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22]/90 border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#58a6ff] animate-pulse" />
          <span className="text-xs font-semibold text-[#e6edf3]">Standard Console (stdout / stdin)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-copy-console"
            onClick={handleCopy}
            className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]/50 rounded transition duration-150"
            title="Copy Output"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-clear-console"
            onClick={onClear}
            className="p-1 text-[#8b949e] hover:text-[#ff7b72] hover:bg-[#30363d]/50 rounded transition duration-150"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div id="console-body" className="flex-1 p-4 overflow-y-auto text-sm text-[#c9d1d9] space-y-1 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent">
        {consoleOutput ? (
          <pre className="whitespace-pre-wrap leading-relaxed font-mono font-medium">{consoleOutput}</pre>
        ) : (
          <div className="text-[#8b949e] italic text-xs flex flex-col justify-center items-center h-full space-y-1">
            <span>Terminal ready. Run a simulation to display printf output.</span>
          </div>
        )}
      </div>

      {/* Input Line (For simulated scanf) */}
      {onInputSubmit && (
        <div className="flex items-center px-4 py-2 bg-[#0d1117] border-t border-[#30363d]">
          <ArrowRight className="w-3.5 h-3.5 text-[#8b949e] mr-2" />
          <span className="text-[#8b949e] text-xs mr-2 select-none">$ scanf:</span>
          <input
            id="terminal-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type value and press Enter..."
            className="flex-1 bg-transparent text-[#e6edf3] border-none outline-none focus:ring-0 text-sm font-mono placeholder:text-[#30363d]"
          />
        </div>
      )}
    </div>
  );
}

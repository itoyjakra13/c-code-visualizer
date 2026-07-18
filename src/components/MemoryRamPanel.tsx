/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cpu, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { Variable, HeapBlock } from "../types";

interface MemoryRamPanelProps {
  variables: Variable[];
  heap: HeapBlock[];
  highlightedAddresses: number[];
}

export default function MemoryRamPanel({ variables, heap, highlightedAddresses }: MemoryRamPanelProps) {
  return (
    <div id="memory-ram-panel-wrapper" className="flex flex-col h-full bento-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22]/90 border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#58a6ff]" />
          <h3 className="text-xs font-bold text-[#e6edf3] uppercase tracking-wider font-mono">RAM Memory Visualizer</h3>
        </div>
        <div className="flex space-x-2">
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#238636]/10 text-[#2ea043] text-[10px] font-semibold border border-[#238636]/20">
            Stack: 0x1000
          </span>
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#58a6ff]/10 text-[#58a6ff] text-[10px] font-semibold border border-[#58a6ff]/20">
            Heap: 0x3000
          </span>
        </div>
      </div>

      {/* Memory Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#30363d]">
        {/* Stack Memory Region */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#58a6ff] font-mono border-b border-[#30363d]/40 pb-1">
            Stack Segment (Local Scopes)
          </div>
          <div className="space-y-1.5">
            {variables.length > 0 ? (
              variables.map((v) => {
                const isHighlighted = highlightedAddresses.includes(v.address);
                return (
                  <div
                    key={v.id}
                    id={`ram-stack-${v.address}`}
                    className={`flex items-center justify-between p-2.5 rounded-lg border font-mono transition-all duration-150 ${
                      isHighlighted
                        ? "bg-[#238636]/15 border-[#2ea043] shadow-md shadow-[#2ea043]/5 animate-pulse"
                        : "bg-[#161b22]/60 border-[#30363d]/60 hover:border-[#30363d]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {/* Address column */}
                      <span className="text-xs text-[#8b949e] font-semibold bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]/50">
                        0x{v.address.toString(16).toUpperCase()}
                      </span>
                      {/* Name & Type */}
                      <div className="flex flex-col">
                        <span className="text-xs text-[#e6edf3] font-bold">{v.name}</span>
                        <span className="text-[10px] text-[#ff7b72] font-medium">{v.type}</span>
                      </div>
                    </div>

                    {/* Value Column */}
                    <div className="text-right">
                      {v.isPointer ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-[#d2a8ff] font-bold flex items-center space-x-1">
                            <span>ptr ➔</span>
                            <span>{v.value}</span>
                          </span>
                          <span className="text-[9px] text-[#8b949e]">points to Stack</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#79c0ff] font-semibold">{v.value}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-[#8b949e] italic py-2 text-center">
                Stack is currently clean (no local variables).
              </div>
            )}
          </div>
        </div>

        {/* Heap Segment */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#d2a8ff] font-mono border-b border-[#30363d]/40 pb-1">
            Heap Segment (Dynamic allocations)
          </div>
          <div className="space-y-2">
            {heap.length > 0 ? (
              heap.map((block) => {
                const isHighlighted = highlightedAddresses.includes(block.address);
                return (
                  <div
                    key={block.id}
                    id={`ram-heap-${block.address}`}
                    className={`p-3 rounded-lg border font-mono transition-all duration-150 relative overflow-hidden ${
                      block.isFree
                        ? "bg-[#0d1117]/30 border-[#30363d]/40 opacity-50"
                        : block.doubleFreeError || block.invalidFreeError
                        ? "bg-[#ff7b72]/10 border-[#ff7b72]"
                        : block.hasLeak
                        ? "bg-amber-500/10 border-amber-500"
                        : isHighlighted
                        ? "bg-[#58a6ff]/15 border-[#58a6ff] shadow-md shadow-[#58a6ff]/5 animate-pulse"
                        : "bg-[#161b22]/60 border-[#30363d]/60"
                    }`}
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#8b949e] font-semibold bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]/50">
                          0x{block.address.toString(16).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#58a6ff] font-bold uppercase">
                          {block.type} ({block.size}B)
                        </span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          block.isFree
                            ? "bg-[#0d1117] text-[#8b949e] border border-[#30363d]/50"
                            : block.doubleFreeError
                            ? "bg-[#ff7b72] text-[#0d1117]"
                            : block.hasLeak
                            ? "bg-amber-500 text-[#0d1117]"
                            : "bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30"
                        }`}
                      >
                        {block.isFree
                          ? "FREED"
                          : block.doubleFreeError
                          ? "DOUBLE FREE"
                          : block.hasLeak
                          ? "LEAKING"
                          : "ALLOCATED"}
                      </span>
                    </div>

                    {/* Block Values Cells */}
                    {!block.isFree && (
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        {block.value.map((cellVal, idx) => {
                          const cellAddr = block.address + idx * 4;
                          return (
                            <div
                              key={idx}
                              className="bg-[#0d1117] border border-[#30363d]/60 p-1.5 rounded flex flex-col items-center justify-center"
                              title={`Address: 0x${cellAddr.toString(16).toUpperCase()}`}
                            >
                              <span className="text-[9px] text-[#8b949e]">+{idx * 4}B</span>
                              <span className="text-xs font-bold text-[#e6edf3]">{cellVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Leaks or Errors Indicators */}
                    {block.hasLeak && !block.isFree && (
                      <div className="flex items-center space-x-1.5 text-[10px] text-amber-400 mt-2 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Memory leak: Block was never freed before program exited!</span>
                      </div>
                    )}
                    {block.doubleFreeError && (
                      <div className="flex items-center space-x-1.5 text-[10px] text-rose-400 mt-2 bg-rose-500/10 p-1.5 rounded border border-[#ff7b72]/20">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Undefined Behavior: Multiple calls to free() on same block.</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 italic py-2 text-center">
                Heap is currently clean. Use malloc() or calloc() to allocate memory dynamically.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

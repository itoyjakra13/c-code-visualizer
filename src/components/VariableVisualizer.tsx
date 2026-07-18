/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Table, Layers, Hash, CheckSquare, Sparkles } from "lucide-react";
import { Variable, StackFrame } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface VariableVisualizerProps {
  variables: Variable[];
  stack: StackFrame[];
  highlightedVars: string[];
}

export default function VariableVisualizer({ variables, stack, highlightedVars }: VariableVisualizerProps) {
  return (
    <div id="variable-visualizer-container" className="flex flex-col h-full bento-panel rounded-xl overflow-hidden space-y-4 p-4">
      
      {/* 1. CALL STACK FRAMES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-[#30363d]">
          <div className="flex items-center space-x-1.5 text-[#e6edf3]">
            <Layers className="w-4 h-4 text-[#58a6ff]" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Active Call Stack</span>
          </div>
          <span className="text-[10px] bg-[#0d1117] text-[#8b949e] px-1.5 py-0.5 rounded font-mono border border-[#30363d]/50">
            {stack.length} frames
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#30363d] pr-1">
          <AnimatePresence initial={false}>
            {stack.length > 0 ? (
              stack.map((frame, idx) => {
                const isTop = idx === stack.length - 1;
                return (
                  <motion.div
                    key={frame.id}
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`p-3 rounded-lg border font-mono transition ${
                      isTop
                        ? "bg-[#161b22] border-[#2ea043] shadow-md shadow-[#2ea043]/5"
                        : "bg-[#161b22]/50 border-[#30363d]/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Frame Title */}
                      <span className={`text-xs font-bold ${isTop ? "text-[#2ea043]" : "text-[#c9d1d9]"}`}>
                        {frame.functionName}()
                      </span>
                      {isTop && (
                        <span className="text-[9px] uppercase font-bold text-white bg-[#238636] px-1.5 py-0.5 rounded">
                          Active Frame
                        </span>
                      )}
                    </div>

                    {/* Parameters summary */}
                    {frame.parameters.length > 0 && (
                      <div className="mt-2 pl-2 border-l border-[#30363d] space-y-0.5 text-[10px]">
                        <span className="text-[#8b949e] block uppercase font-mono text-[8px] font-bold">Parameters:</span>
                        {frame.parameters.map((p, pIdx) => (
                          <div key={pIdx} className="text-[#c9d1d9]">
                            <span className="text-[#ff7b72]">{p.type}</span> {p.name} = <span className="text-[#79c0ff] font-bold">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Frame return target */}
                    {frame.returnValue !== undefined && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#30363d]/80 flex items-center justify-between text-[10px]">
                        <span className="text-[#8b949e] uppercase font-mono text-[8px] font-bold">Return value:</span>
                        <span className="text-[#2ea043] font-bold">{frame.returnValue}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-xs text-[#8b949e] italic py-4 text-center">
                Stack frames are uninitialized.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. VARIABLES TABLE */}
      <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
        <div className="flex items-center justify-between pb-1 border-b border-[#30363d]">
          <div className="flex items-center space-x-1.5 text-[#e6edf3]">
            <Table className="w-4 h-4 text-[#58a6ff]" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Active Variables Registry</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto border border-[#30363d]/80 rounded-lg scrollbar-thin scrollbar-thumb-[#30363d]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#161b22]/90 border-b border-[#30363d]/80 text-[10px] text-[#8b949e] uppercase tracking-wider font-mono select-none">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Address</th>
                <th className="px-3 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/50">
              {variables.length > 0 ? (
                variables.map((v) => {
                  const isHighlighted = highlightedVars.includes(v.name) || v.isUpdated;
                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-[#161b22]/40 transition-all duration-150 ${
                        isHighlighted ? "bg-[#238636]/5 text-[#2ea043]" : "text-[#c9d1d9]"
                      }`}
                    >
                      {/* Name with update indicator */}
                      <td className="px-3 py-2.5 font-bold flex items-center space-x-1">
                        {isHighlighted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043] animate-ping mr-1" />
                        )}
                        <span>{v.name}</span>
                      </td>
                      {/* Type */}
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] text-[#ff7b72] font-semibold bg-[#0d1117] px-1 py-0.5 rounded border border-[#30363d]/50">
                          {v.type}
                        </span>
                      </td>
                      {/* Address */}
                      <td className="px-3 py-2.5 text-[#8b949e] font-semibold">
                        0x{v.address.toString(16).toUpperCase()}
                      </td>
                      {/* Value */}
                      <td className="px-3 py-2.5 text-right font-bold text-[#79c0ff]">
                        {v.value}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-[#8b949e] italic">
                    No variables currently allocated in scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowRight, Search, BarChart3, Binary, List, Layers } from "lucide-react";
import { ArrayVisualData, ListNode, TreeNode, SortingState, SearchingState } from "../types";

// ==========================================
// 1. ARRAY VISUALIZER
// ==========================================
interface ArrayVisualizerProps {
  arrays: ArrayVisualData[];
}

export function ArrayVisualizer({ arrays }: ArrayVisualizerProps) {
  if (arrays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-[#161b22]/40 border border-dashed border-[#30363d] rounded-xl p-4 text-center">
        <Layers className="w-6 h-6 text-[#8b949e] mb-1" />
        <span className="text-xs text-[#8b949e] font-sans">No arrays declared yet in local stack.</span>
      </div>
    );
  }

  return (
    <div id="array-visualizer-wrapper" className="space-y-4">
      {arrays.map((arr) => {
        const is2D = arr.type === "2D";
        const accessed = arr.accessedIndices || [];
        
        return (
          <div key={arr.id} className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e6edf3] font-mono">{arr.name}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#d2a8ff]/10 text-[#d2a8ff] border border-[#d2a8ff]/20 font-mono">
                {arr.type} Array
              </span>
            </div>

            {/* Render 1D Array */}
            {!is2D ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {arr.data.map((val, idx) => {
                  const isAccessed = accessed.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center p-2 rounded border font-mono transition-all duration-200 min-w-12 ${
                        isAccessed
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-md shadow-amber-500/10"
                          : "bg-[#0d1117]/80 border-[#30363d] text-[#c9d1d9]"
                      }`}
                    >
                      <span className="text-[9px] text-[#8b949e] mb-1 font-bold">[{idx}]</span>
                      <span className="text-sm font-bold">{val}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Render 2D Array */
              <div className="grid gap-1 pt-1">
                {(arr.data as any[][]).map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1">
                    {row.map((val, cIdx) => {
                      const isAccessed = accessed.some(a => Array.isArray(a) && a[0] === rIdx && a[1] === cIdx);
                      return (
                        <div
                          key={cIdx}
                          className={`flex flex-col items-center p-1.5 rounded border font-mono transition-all duration-200 flex-1 min-w-10 ${
                            isAccessed
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 scale-105"
                              : "bg-[#0d1117]/80 border-[#30363d] text-[#c9d1d9]"
                          }`}
                        >
                          <span className="text-[8px] text-[#8b949e] mb-0.5">[{rIdx}][{cIdx}]</span>
                          <span className="text-xs font-bold">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 2. LINKED LIST VISUALIZER
// ==========================================
interface LinkedListVisualizerProps {
  list: {
    nodes: ListNode[];
    highlightedNodeId?: string;
  };
}

export function LinkedListVisualizer({ list }: LinkedListVisualizerProps) {
  if (!list || list.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-[#161b22]/40 border border-dashed border-[#30363d] rounded-xl p-4 text-center">
        <List className="w-6 h-6 text-[#8b949e] mb-1" />
        <span className="text-xs text-[#8b949e] font-sans">No Linked List nodes active in memory.</span>
      </div>
    );
  }

  return (
    <div id="linked-list-visualizer" className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-xl space-y-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#e6edf3] font-sans">Dynamic Linked List Segment</span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#238636]/10 text-[#2ea043] border border-[#238636]/20 font-mono">
          Pointer Chain
        </span>
      </div>

      <div className="flex items-center space-x-4 min-w-max py-2 px-1">
        {/* Head Visualizer Indicator */}
        <div className="flex flex-col items-center">
          <div className="bg-[#238636] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md font-mono">
            head ptr
          </div>
          <ArrowRight className="w-4 h-4 text-[#2ea043] mt-1" />
        </div>

        {list.nodes.map((node, idx) => {
          const isHighlighted = list.highlightedNodeId === node.id;
          return (
            <React.Fragment key={node.id}>
              {/* Linked Node */}
              <div
                id={`ll-node-${node.addr}`}
                className={`flex flex-col rounded-lg border font-mono overflow-hidden shadow-md transition-all duration-300 ${
                  isHighlighted
                    ? "border-[#2ea043] bg-[#238636]/10 scale-105 shadow-[#2ea043]/10"
                    : "border-[#30363d] bg-[#161b22]"
                }`}
              >
                {/* Node Address Banner */}
                <div className="px-2.5 py-1 bg-[#0d1117] border-b border-[#30363d] text-[9px] text-[#8b949e] font-semibold text-center">
                  Address: 0x{node.addr.toString(16).toUpperCase()}
                </div>

                {/* Node Fields split */}
                <div className="flex divide-x divide-[#30363d]">
                  {/* Data field */}
                  <div className="p-3 text-center min-w-14">
                    <div className="text-[8px] text-[#8b949e] uppercase font-sans">data</div>
                    <div className="text-sm font-bold text-[#e6edf3] mt-0.5">{node.val}</div>
                  </div>
                  {/* Next field */}
                  <div className="p-3 text-center min-w-16">
                    <div className="text-[8px] text-[#8b949e] uppercase font-sans">next</div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">
                      {node.nextAddr === 0 ? "NULL" : `0x${node.nextAddr.toString(16).toUpperCase()}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow connector to next node */}
              {idx < list.nodes.length - 1 && (
                <div className="flex items-center space-x-1 text-[#30363d]">
                  <div className="w-8 h-0.5 bg-[#30363d] relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-l-4 border-l-[#30363d] border-y-4 border-y-transparent" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. TREE VISUALIZER
// ==========================================
interface TreeVisualizerProps {
  tree: {
    nodes: TreeNode[];
    highlightedNodeId?: string;
  };
}

export function TreeVisualizer({ tree }: TreeVisualizerProps) {
  if (!tree || tree.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-[#161b22]/40 border border-dashed border-[#30363d] rounded-xl p-4 text-center">
        <Binary className="w-6 h-6 text-[#8b949e] mb-1" />
        <span className="text-xs text-[#8b949e] font-sans">No Binary Tree nodes allocated yet.</span>
      </div>
    );
  }

  // Pure SVG coordinate layout for simple Binary Tree display
  // We will position nodes on SVG based on simple levels: Root at center, children spread left/right
  return (
    <div id="tree-visualizer" className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-xl space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-[#e6edf3] font-sans">Binary Tree Visualization</span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
          Struct Nodes
        </span>
      </div>

      <div className="flex justify-center">
        <svg className="w-full max-w-sm h-48" viewBox="0 0 400 200">
          {/* Connector lines */}
          <line x1="200" y1="40" x2="100" y2="100" stroke="#30363d" strokeWidth="2" />
          <line x1="200" y1="40" x2="300" y2="100" stroke="#30363d" strokeWidth="2" />
          <line x1="100" y1="100" x2="50" y2="160" stroke="#30363d" strokeWidth="1.5" />
          <line x1="100" y1="100" x2="150" y2="160" stroke="#30363d" strokeWidth="1.5" />

          {/* Node Renderings */}
          {/* Level 0 (Root) */}
          <circle cx="200" cy="40" r="20" fill="#161b22" stroke="#2ea043" strokeWidth="2" />
          <text x="200" y="44" fill="#e6edf3" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">10</text>
          <text x="200" y="15" fill="#8b949e" fontSize="8" textAnchor="middle" fontFamily="monospace">0x3000</text>

          {/* Level 1 (Left Child) */}
          <circle cx="100" cy="100" r="18" fill="#161b22" stroke="#58a6ff" strokeWidth="2" />
          <text x="100" y="104" fill="#e6edf3" fontSize="10" textAnchor="middle" fontFamily="monospace">5</text>
          <text x="100" y="78" fill="#8b949e" fontSize="8" textAnchor="middle" fontFamily="monospace">0x3010</text>

          {/* Level 1 (Right Child) */}
          <circle cx="300" cy="100" r="18" fill="#161b22" stroke="#58a6ff" strokeWidth="2" />
          <text x="300" y="104" fill="#e6edf3" fontSize="10" textAnchor="middle" fontFamily="monospace">20</text>
          <text x="300" y="78" fill="#8b949e" fontSize="8" textAnchor="middle" fontFamily="monospace">0x3020</text>

          {/* Level 2 (Left-Left) */}
          <circle cx="50" cy="160" r="16" fill="#161b22" stroke="#8b949e" strokeWidth="1" />
          <text x="50" y="163" fill="#c9d1d9" fontSize="9" textAnchor="middle" fontFamily="monospace">2</text>

          {/* Level 2 (Left-Right) */}
          <circle cx="150" cy="160" r="16" fill="#161b22" stroke="#8b949e" strokeWidth="1" />
          <text x="150" y="163" fill="#c9d1d9" fontSize="9" textAnchor="middle" fontFamily="monospace">8</text>
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 4. SORTING VISUALIZER
// ==========================================
interface SortingVisualizerProps {
  sorting: SortingState;
}

export function SortingVisualizer({ sorting }: SortingVisualizerProps) {
  if (!sorting || !sorting.array) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-[#161b22]/40 border border-dashed border-[#30363d] rounded-xl p-4 text-center">
        <BarChart3 className="w-6 h-6 text-[#8b949e] mb-1" />
        <span className="text-xs text-[#8b949e] font-sans">No active sorting dataset selected.</span>
      </div>
    );
  }

  const maxVal = Math.max(...sorting.array, 1);

  return (
    <div id="sorting-visualizer" className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#e6edf3] font-sans">Sorting Array Bar Track</span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
          Compare & Swap
        </span>
      </div>

      {/* Graphical Arena */}
      <div className="flex items-end justify-center space-x-3.5 h-32 pt-2 border-b border-[#30363d]">
        {sorting.array.map((val, idx) => {
          const heightPct = (val / maxVal) * 100;
          
          // Check states
          const isComparing = sorting.compareIndices?.includes(idx);
          const isSwapping = sorting.swapIndices?.includes(idx);
          const isSorted = idx >= sorting.array.length - sorting.sortedCount;

          let barColor = "bg-[#21262d] border-[#30363d]";
          if (isSwapping) {
            barColor = "bg-[#ff7b72] border-[#ff7b72] shadow-lg shadow-[#ff7b72]/20";
          } else if (isComparing) {
            barColor = "bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/20";
          } else if (isSorted) {
            barColor = "bg-[#2ea043] border-[#2ea043]";
          }

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-10">
              <span className="text-[10px] font-bold text-[#e6edf3] font-mono mb-1">{val}</span>
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-md border-t border-x transition-all duration-300 ${barColor}`}
              />
              <span className="text-[8px] text-[#8b949e] font-bold font-mono mt-1">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Legend Indicators */}
      <div className="flex items-center justify-center space-x-4 text-[10px] font-sans">
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
          <span className="text-[#8b949e]">Comparing</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 bg-[#ff7b72] rounded-sm" />
          <span className="text-[#8b949e]">Swapping</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 bg-[#2ea043] rounded-sm" />
          <span className="text-[#8b949e]">Sorted</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SEARCHING VISUALIZER
// ==========================================
interface SearchingVisualizerProps {
  searching: SearchingState;
}

export function SearchingVisualizer({ searching }: SearchingVisualizerProps) {
  if (!searching || !searching.array) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-[#161b22]/40 border border-dashed border-[#30363d] rounded-xl p-4 text-center">
        <Search className="w-6 h-6 text-[#8b949e] mb-1" />
        <span className="text-xs text-[#8b949e] font-sans">No search dataset active.</span>
      </div>
    );
  }

  return (
    <div id="searching-visualizer" className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-xl space-y-4 font-sans">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <Search className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span className="text-xs font-bold text-[#e6edf3]">Binary Search Range Visualizer</span>
        </div>
        <span className="text-[10px] text-[#8b949e] font-semibold font-mono">Target: {searching.target}</span>
      </div>

      {/* Array box strip */}
      <div className="flex justify-center space-x-1.5 pt-4">
        {searching.array.map((val, idx) => {
          const isMid = idx === searching.mid;
          const inRange = idx >= searching.low && idx <= searching.high;
          const isFound = isMid && searching.found === true;

          let boxColor = "border-[#30363d] bg-[#0d1117]/40 text-[#8b949e]";
          if (isFound) {
            boxColor = "border-[#2ea043] bg-[#238636]/10 text-[#2ea043] scale-105 ring-2 ring-[#2ea043]/20";
          } else if (isMid) {
            boxColor = "border-amber-400 bg-amber-400/5 text-amber-300";
          } else if (inRange) {
            boxColor = "border-[#30363d] bg-[#161b22] text-[#e6edf3]";
          }

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-12">
              {/* Indices pointers */}
              <div className="h-6 flex flex-col justify-end text-[9px] font-bold font-mono">
                {idx === searching.low && <span className="text-[#58a6ff]">L</span>}
                {idx === searching.high && <span className="text-[#d2a8ff]">H</span>}
              </div>

              {/* Box element */}
              <div className={`w-full py-2.5 text-center border rounded-lg font-mono text-xs font-bold transition-all duration-300 ${boxColor}`}>
                {val}
              </div>

              {/* Mid arrow pointer */}
              <div className="h-6 flex flex-col justify-start text-[9px] font-bold font-mono mt-1">
                {isMid && <span className="text-amber-400 font-mono">▲ mid</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Range Status text */}
      <div className="bg-[#0d1117]/50 p-2.5 rounded border border-[#30363d] text-[11px] text-[#8b949e] text-center font-mono flex items-center justify-center space-x-2">
        <span className="text-[#58a6ff]">Low: {searching.low}</span>
        <span className="text-[#30363d]">|</span>
        <span className="text-amber-400">Mid: {searching.mid >= 0 ? searching.mid : "N/A"}</span>
        <span className="text-[#30363d]">|</span>
        <span className="text-[#d2a8ff]">High: {searching.high}</span>
      </div>
    </div>
  );
}

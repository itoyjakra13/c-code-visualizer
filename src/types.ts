/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Variable {
  id: string;
  name: string;
  type: string;
  value: string;
  address: number; // Simulated memory address (e.g., 0x1000 - 0x1FFF)
  scope: string; // e.g. "main", "factorial", "global"
  isPointer?: boolean;
  pointsTo?: number; // Target memory address
  isUpdated?: boolean;
  isStruct?: boolean;
  structFields?: Variable[]; // For structures
}

export interface StackFrame {
  id: string;
  functionName: string;
  parameters: { name: string; type: string; value: string }[];
  localVariables: Variable[];
  returnValue?: string;
  returnAddress?: string;
}

export interface HeapBlock {
  id: string;
  address: number; // Simulated memory address (e.g., 0x3000 - 0x3FFF)
  size: number; // in bytes or elements
  type: string;
  value: string[]; // array of cell values
  isFree: boolean;
  hasLeak?: boolean;
  doubleFreeError?: boolean;
  invalidFreeError?: boolean;
}

export interface MemoryBlock {
  address: number;
  variableName?: string;
  value: string;
  type: string;
  isStack: boolean;
  isHeap: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: 'variable' | 'next_line' | 'output';
}

export interface ArrayVisualData {
  id: string;
  name: string;
  type: '1D' | '2D';
  dimensions: [number] | [number, number];
  data: any[]; // for 1D or 2D elements
  accessedIndices?: number[];
}

export interface ListNode {
  id: string;
  val: number;
  addr: number;
  nextAddr: number;
}

export interface TreeNode {
  id: string;
  val: number;
  addr: number;
  leftAddr: number;
  rightAddr: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface SortingState {
  array: number[];
  compareIndices: [number, number] | null;
  swapIndices: [number, number] | null;
  sortedCount: number;
}

export interface SearchingState {
  array: number[];
  target: number;
  low: number;
  high: number;
  mid: number;
  found: boolean | null;
}

export interface ExecutionStep {
  line: number; // 0-indexed or 1-indexed line in the editor
  explanation: string; // Plain English description for Beginner Mode
  variables: Variable[];
  stack: StackFrame[];
  heap: HeapBlock[];
  console: string; // Accumulated console output
  highlights: {
    line: number;
    prevLines?: number[];
    nextLines?: number[];
    variables?: string[]; // list of changed variables names
    memoryAddresses?: number[]; // addresses altered
  };
  expressionSteps?: string[]; // list of steps like ["c * d = 24", "b + 24 = 29", "a = 29"]
  arrayData?: ArrayVisualData[];
  listData?: {
    nodes: ListNode[];
    highlightedNodeId?: string;
  };
  treeData?: {
    nodes: TreeNode[];
    highlightedNodeId?: string;
  };
  graphData?: {
    nodes: string[];
    edges: GraphEdge[];
    visited?: string[];
  };
  sortingData?: SortingState;
  searchingData?: SearchingState;
  quiz?: QuizQuestion;
}

export interface CProgram {
  id: string;
  name: string;
  code: string;
  category: 'basic' | 'structures' | 'algorithms' | 'advanced';
}

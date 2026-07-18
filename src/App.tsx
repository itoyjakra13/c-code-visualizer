/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Cpu, BookOpen, Layers, Terminal, ToggleLeft, ToggleRight, Play, Pause, RotateCcw, SkipForward, SkipBack, Award, CheckCircle2, ChevronRight, Binary, List, HelpCircle } from "lucide-react";
import { EXAMPLES, getExampleTrace } from "./examples";
import { parseAndSimulateC } from "./interpreter";
import { ExecutionStep, Variable } from "./types";

// Component imports
import CodeEditor from "./components/CodeEditor";
import MemoryRamPanel from "./components/MemoryRamPanel";
import VariableVisualizer from "./components/VariableVisualizer";
import ConsoleTerminal from "./components/ConsoleTerminal";
import QuizCard from "./components/QuizCard";
import { ArrayVisualizer, LinkedListVisualizer, TreeVisualizer, SortingVisualizer, SearchingVisualizer } from "./components/Visualizers";

export default function App() {
  // Core states
  const [selectedExampleId, setSelectedExampleId] = React.useState<string>("hello_world");
  const [currentCode, setCurrentCode] = React.useState<string>("");
  const [steps, setSteps] = React.useState<ExecutionStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [speed, setSpeed] = React.useState<number>(1);
  const [beginnerMode, setBeginnerMode] = React.useState<boolean>(true);
  
  // Navigation visualizer tabs: "ram" | "arrays" | "lists" | "sort_search"
  const [activeTab, setActiveTab] = React.useState<string>("ram");
  
  // Quiz tracking
  const [score, setScore] = React.useState<number>(0);
  const [quizAnswered, setQuizAnswered] = React.useState<boolean>(true);

  // Core states for compilation validation
  const [isCompiling, setIsCompiling] = React.useState<boolean>(false);
  const [compileErrors, setCompileErrors] = React.useState<string[]>([]);

  // Initialize with Hello World on mount
  React.useEffect(() => {
    loadExample("hello_world");
  }, []);

  // Sync execution trace when example changes
  const loadExample = (id: string) => {
    setSelectedExampleId(id);
    const example = EXAMPLES.find((ex) => ex.id === id);
    if (example) {
      setCurrentCode(example.code);
      const traceSteps = getExampleTrace(id);
      setSteps(traceSteps);
      setCurrentStepIdx(0);
      setIsPlaying(false);
      setQuizAnswered(true);

      // Auto route tabs based on example categories
      if (id === "bubble_sort" || id === "binary_search") {
        setActiveTab("sort_search");
      } else if (id === "linked_list") {
        setActiveTab("lists");
      } else if (id === "palindrome") {
        setActiveTab("arrays");
      } else {
        setActiveTab("ram");
      }
    }
  };

  // Run Custom simulation on edit
  const handleRunSimulation = async () => {
    setIsPlaying(false);
    setIsCompiling(true);
    setCompileErrors([]);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode })
      });
      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        setCompileErrors(data.errors);
        setSteps([]);
        setCurrentStepIdx(0);
        setActiveTab("ram");
      } else if (data.steps && data.steps.length > 0) {
        setSteps(data.steps);
        setCurrentStepIdx(0);
        setQuizAnswered(true);

        // route based on code content or memory tags
        if (currentCode.includes("malloc") || currentCode.includes("free")) {
          setActiveTab("ram");
        } else if (currentCode.includes("[]")) {
          setActiveTab("arrays");
        }
      }
    } catch (err) {
      console.error("Failed to run simulation:", err);
      // Fallback to client-side local parser if server API fails completely
      const { steps: parsedSteps, errors } = parseAndSimulateC(currentCode);
      setSteps(parsedSteps);
      setCompileErrors(errors);
      setCurrentStepIdx(0);
      setQuizAnswered(true);
    } finally {
      setIsCompiling(false);
    }
  };

  // Handle auto-play intervals
  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && quizAnswered) {
      timer = setInterval(() => {
        handleNextStep();
      }, 1500 / speed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentStepIdx, speed, quizAnswered]);

  // Stepping actions
  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      const nextStep = steps[nextIdx];

      // If next step contains an unanswered quiz, pause play and lock stepping
      if (nextStep.quiz && quizAnswered) {
        setIsPlaying(false);
        setQuizAnswered(false);
      }
      
      setCurrentStepIdx(nextIdx);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setQuizAnswered(true); // reset lock when scrolling back
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setQuizAnswered(true);
  };

  const handleCorrectQuizAnswer = () => {
    setScore((prev) => prev + 10);
    setQuizAnswered(true);
  };

  // Safe accessor for current state step
  const currentStep: ExecutionStep = steps[currentStepIdx] || {
    line: 1,
    explanation: "Load a program and click run to start visualization steps.",
    variables: [],
    stack: [],
    heap: [],
    console: "",
    highlights: { line: 1 }
  };

  return (
    <div id="c-visualizer-root" className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden font-sans">
      
      {/* 1. TOP NAVBAR */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#161b22] border-b border-[#30363d] shadow-md z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#238636] rounded-xl text-white font-bold shadow-lg shadow-[#238636]/10">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-[#58a6ff] via-[#d2a8ff] to-[#ff7b72] bg-clip-text text-transparent">
              C Visualizer
            </h1>
            <p className="text-[10px] text-[#8b949e] font-medium font-mono">Interactive execution sandbox & C interpreter tutor</p>
          </div>
        </div>

        {/* Global Controls & Score */}
        <div className="flex items-center space-x-6">
          {/* Beginner Mode Toggle */}
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center space-x-1.5 text-xs text-[#8b949e]">
              <BookOpen className="w-3.5 h-3.5 text-[#2ea043]" />
              <span className="font-semibold">Beginner Explanations</span>
            </span>
            <button
              id="btn-beginner-toggle"
              onClick={() => setBeginnerMode(!beginnerMode)}
              className="text-[#8b949e] hover:text-[#e6edf3] transition"
              title="Toggle beginner plain English breakdowns"
            >
              {beginnerMode ? (
                <ToggleRight className="w-8 h-8 text-[#2ea043]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-[#30363d]" />
              )}
            </button>
          </div>

          {/* Quiz Score Box */}
          <div className="flex items-center space-x-2 bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded-lg shadow-inner">
            <Award className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b949e]">XP:</span>
            <span className="text-xs font-mono font-extrabold text-amber-300">{score}</span>
          </div>

          {/* Run custom button */}
          <button
            id="btn-compile-simulate"
            onClick={handleRunSimulation}
            className="px-4 py-1.5 bento-btn-primary font-bold text-xs rounded-lg transition duration-200 flex items-center space-x-1 border border-white/10 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visualize Code</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN TRIPLE PANELS */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* PANEL A: LEFT SIDEBAR (CODE EDITOR) */}
        <div className="w-[32%] flex flex-col border-r border-[#30363d] bg-[#161b22]/40 p-4 space-y-4">
          <CodeEditor
            currentCode={currentCode}
            onChangeCode={setCurrentCode}
            selectedExampleId={selectedExampleId}
            onSelectExample={loadExample}
            currentStepLine={currentStep.line}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onStepForward={handleNextStep}
            onStepBackward={handlePrevStep}
            onReset={handleReset}
            isPlaying={isPlaying}
            speed={speed}
            onChangeSpeed={setSpeed}
            compileErrors={compileErrors}
            isCompiling={isCompiling}
          />
        </div>

        {/* PANEL B: CENTER AREA (VISUALIZATION ARENAS & TABS) */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden bg-[#0d1117]">
          
          {/* Visualizer tab switcher */}
          <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
            <div className="flex space-x-1 bg-[#161b22]/90 border border-[#30363d] rounded-lg p-0.5 shadow-inner">
              <button
                id="tab-ram"
                onClick={() => setActiveTab("ram")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === "ram" ? "bg-[#0d1117] text-[#58a6ff] border border-[#30363d] shadow-sm" : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Memory (RAM)</span>
              </button>
              <button
                id="tab-arrays"
                onClick={() => setActiveTab("arrays")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === "arrays" ? "bg-[#0d1117] text-[#d2a8ff] border border-[#30363d] shadow-sm" : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Arrays & Strings</span>
              </button>
              <button
                id="tab-lists"
                onClick={() => setActiveTab("lists")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === "lists" ? "bg-[#0d1117] text-[#2ea043] border border-[#30363d] shadow-sm" : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Linked Lists / Trees</span>
              </button>
              <button
                id="tab-sort-search"
                onClick={() => setActiveTab("sort_search")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === "sort_search" ? "bg-[#0d1117] text-[#79c0ff] border border-[#30363d] shadow-sm" : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                <Binary className="w-3.5 h-3.5" />
                <span>Sorting / Searching</span>
              </button>
            </div>

            {/* Step status count */}
            <span className="text-[10px] text-[#8b949e] font-mono font-bold tracking-wider uppercase">
              Step {currentStepIdx + 1} of {steps.length || 1}
            </span>
          </div>

          {/* Active Tab Viewport Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Expression sub-step display */}
            {currentStep.expressionSteps && currentStep.expressionSteps.length > 0 && (
              <div className="bg-[#161b22]/70 border border-[#30363d] rounded-xl p-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b949e] font-mono">Expression Evaluation Step</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 font-mono text-xs text-[#c9d1d9]">
                  {currentStep.expressionSteps.map((exp, expIdx) => (
                    <React.Fragment key={expIdx}>
                      <span className="bg-[#0d1117] px-2 py-1 rounded border border-[#30363d] font-semibold text-[#e6edf3]">
                        {exp}
                      </span>
                      {expIdx < (currentStep.expressionSteps?.length || 0) - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#30363d]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz active pop-in */}
            {currentStep.quiz && !quizAnswered && (
              <QuizCard quiz={currentStep.quiz} onCorrectAnswer={handleCorrectQuizAnswer} />
            )}

            {/* TAB CONTENT: RAM Segment */}
            {activeTab === "ram" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                <MemoryRamPanel
                  variables={currentStep.variables}
                  heap={currentStep.heap}
                  highlightedAddresses={currentStep.highlights.memoryAddresses || []}
                />
                
                {/* Dynamic Heap Allocated Blocks visual */}
                <div className="bg-[#161b22]/40 border border-[#30363d] rounded-xl p-4 flex flex-col space-y-3 justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#e6edf3] uppercase tracking-widest border-b border-[#30363d] pb-1 font-mono">
                      Active Heap allocation map
                    </h3>
                    <p className="text-[11px] text-[#8b949e] mt-2 font-sans leading-relaxed">
                      Memory allocated dynamically in C via malloc() resides on the Heap. The Heap segment allows blocks to be sized, dereferenced, and freed. Double frees or memory leaks are marked in yellow/rose indicators here.
                    </p>
                  </div>

                  <div className="border border-[#30363d]/80 bg-[#0d1117]/40 rounded-lg p-4 h-48 overflow-y-auto flex flex-col justify-center items-center">
                    {currentStep.heap.length > 0 ? (
                      <div className="space-y-3 w-full">
                        {currentStep.heap.map((b) => (
                          <div key={b.id} className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg flex items-center justify-between font-mono text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse" />
                              <span className="font-bold text-[#e6edf3]">0x{b.address.toString(16).toUpperCase()}</span>
                            </div>
                            <span className="text-[#8b949e]">{b.type} [{b.size} bytes]</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#8b949e] font-medium italic">No dynamic blocks allocated.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Arrays & Strings */}
            {activeTab === "arrays" && (
              <div className="space-y-4">
                <ArrayVisualizer arrays={currentStep.arrayData || []} />
                
                {/* String Character block visualizer overlay */}
                {selectedExampleId === "palindrome" && (
                  <div className="p-4 bg-[#161b22]/70 border border-[#30363d] rounded-xl space-y-2">
                    <span className="text-xs font-bold text-[#e6edf3] font-mono block mb-1">String character-by-character layout in memory</span>
                    <div className="flex space-x-1 pt-1 font-mono">
                      {["r", "a", "d", "a", "r", "\\0"].map((char, charIdx) => (
                        <div
                          key={charIdx}
                          className={`flex flex-col items-center p-2 rounded border min-w-12 text-center ${
                            char === "\\0"
                              ? "bg-[#ff7b72]/10 border-[#ff7b72]/20 text-[#ff7b72]"
                              : "bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                          }`}
                        >
                          <span className="text-[8px] text-[#8b949e] mb-0.5">str[{charIdx}]</span>
                          <span className="text-xs font-bold">{char}</span>
                          <span className="text-[8px] text-[#30363d] mt-0.5 font-bold">0x{(0x1000 + charIdx).toString(16).toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#8b949e] leading-relaxed font-sans pt-1">
                      In C, strings are 1D character arrays terminated by a null character <code className="text-[#ff7b72] font-bold">\0</code>. The null terminator occupies 1 byte of memory and marks the end of string traversal.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Linked Lists & Trees */}
            {activeTab === "lists" && (
              <div className="space-y-4">
                <LinkedListVisualizer list={currentStep.listData || { nodes: [] }} />
                <TreeVisualizer tree={currentStep.treeData || { nodes: [] }} />
              </div>
            )}

            {/* TAB CONTENT: Sorting & Searching */}
            {activeTab === "sort_search" && (
              <div className="space-y-4">
                <SortingVisualizer sorting={currentStep.sortingData || { array: [], compareIndices: null, swapIndices: null, sortedCount: 0 }} />
                <SearchingVisualizer searching={currentStep.searchingData || { array: [], target: 0, low: 0, high: 0, mid: -1, found: null }} />
              </div>
            )}

          </div>
        </div>

        {/* PANEL C: RIGHT SIDEBAR (VARIABLES & CALL STACK) */}
        <div className="w-[28%] flex flex-col border-l border-[#30363d] bg-[#161b22]/40 p-4 space-y-4">
          <VariableVisualizer
            variables={currentStep.variables}
            stack={currentStep.stack}
            highlightedVars={currentStep.highlights.variables || []}
          />
        </div>

      </main>

      {/* 3. BOTTOM PANEL: TERMINAL & BEGINNER EXPLAINER */}
      <footer className="h-[20%] bg-[#161b22] border-t border-[#30363d] flex overflow-hidden z-10 shadow-lg shadow-black/20">
        
        {/* Left Side: Beginner Line Translation Mode */}
        <div className="w-[50%] p-4 border-r border-[#30363d] overflow-y-auto flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 border-b border-[#30363d] pb-1 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#2ea043]" />
            <span className="text-xs font-bold text-[#e6edf3] font-mono uppercase tracking-wider">Teacher Line Translation</span>
          </div>

          <div id="beginner-translation-box" className="flex-1 flex flex-col justify-center">
            {beginnerMode ? (
              <p className="text-xs text-[#c9d1d9] leading-relaxed font-sans font-medium">
                {currentStep.explanation}
              </p>
            ) : (
              <span className="text-xs text-[#8b949e] italic font-sans text-center">
                Beginner explanations disabled. Toggle above to enable plain English breakdowns.
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Terminal stdout / stdin */}
        <div className="w-[50%]">
          <ConsoleTerminal
            consoleOutput={currentStep.console}
            onClear={() => {}}
          />
        </div>

      </footer>

    </div>
  );
}

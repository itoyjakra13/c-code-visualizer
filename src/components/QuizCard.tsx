/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { HelpCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { QuizQuestion } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface QuizCardProps {
  quiz: QuizQuestion;
  onCorrectAnswer: () => void;
}

export default function QuizCard({ quiz, onCorrectAnswer }: QuizCardProps) {
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);

  // Reset quiz states when question changes
  React.useEffect(() => {
    setSelectedIdx(null);
    setSubmitted(false);
    setIsCorrect(false);
  }, [quiz]);

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    const correct = selectedIdx === quiz.correctIndex;
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) {
      onCorrectAnswer();
    }
  };

  return (
    <div id="quiz-card-wrapper" className="bento-panel rounded-xl p-5 shadow-lg space-y-4 border border-[#2ea043]/30">
      {/* Quiz Header */}
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-[#2ea043]/10 rounded-lg text-[#2ea043]">
          <HelpCircle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#2ea043] font-mono">Active Quiz Checkpoint</div>
          <h3 className="text-sm font-semibold text-[#e6edf3] mt-0.5">{quiz.question}</h3>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {quiz.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          let optionStyle = "border-[#30363d] bg-[#161b22]/50 text-[#c9d1d9] hover:border-[#8b949e]/50 hover:bg-[#161b22]";

          if (submitted) {
            if (idx === quiz.correctIndex) {
              optionStyle = "border-[#2ea043] bg-[#238636]/10 text-[#2ea043]";
            } else if (isSelected) {
              optionStyle = "border-[#ff7b72] bg-[#ff7b72]/10 text-[#ff7b72]";
            } else {
              optionStyle = "border-[#30363d]/50 bg-[#0d1117]/20 text-[#8b949e] opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "border-[#2ea043]/60 bg-[#238636]/5 text-[#2ea043]";
          }

          return (
            <button
              key={idx}
              id={`quiz-option-${idx}`}
              disabled={submitted}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-xs font-medium font-sans flex items-center justify-between transition-all duration-150 ${optionStyle}`}
            >
              <span>{option}</span>
              {submitted && idx === quiz.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-[#2ea043] flex-shrink-0" />
              )}
              {submitted && isSelected && idx !== quiz.correctIndex && (
                <AlertCircle className="w-4 h-4 text-[#ff7b72] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / Feedback */}
      <AnimatePresence mode="wait">
        {!submitted ? (
          <div className="flex justify-end pt-2">
            <button
              id="btn-quiz-submit"
              disabled={selectedIdx === null}
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono flex items-center space-x-1.5 transition ${
                selectedIdx !== null
                  ? "bg-[#238636] hover:bg-[#2ea043] text-white shadow-md shadow-[#238636]/10 border border-[#2ea043]/20"
                  : "bg-[#161b22] text-[#8b949e] border border-[#30363d] cursor-not-allowed"
              }`}
            >
              <span>Submit Answer</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-lg border text-xs leading-relaxed font-sans ${
              isCorrect 
                ? "bg-[#238636]/10 border-[#2ea043]/30 text-[#2ea043]" 
                : "bg-[#ff7b72]/10 border-[#ff7b72]/30 text-[#ff7b72]"
            }`}
          >
            <div className="font-bold flex items-center space-x-1 mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2ea043]" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-[#ff7b72]" />
                  <span>Incorrect</span>
                </>
              )}
            </div>
            <p className="text-[#c9d1d9] font-medium">{quiz.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

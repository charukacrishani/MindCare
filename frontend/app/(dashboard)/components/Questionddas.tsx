"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";
import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────────────────

export interface Question {
  id: number;
  text: string;
  options: string[];
}

export const OPTIONS = [
  "Did not apply to me at all",
  "Applied to me to some degree, or some of the time",
  "Applied to me to a considerable degree or a good part of time",
  "Applied to me very much or most of the time",
];

export const QUESTIONS: Question[] = [
  { id: 1,  text: "I found it hard to wind down" },
  { id: 2,  text: "I was aware of dryness of my mouth" },
  { id: 3,  text: "I couldn't seem to experience any positive feeling at all" },
  { id: 4,  text: "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)" },
  { id: 5,  text: "I found it difficult to work up the initiative to do things" },
  { id: 6,  text: "I tended to over-react to situations" },
  { id: 7,  text: "I experienced trembling (e.g. in the hands)" },
  { id: 8,  text: "I felt that I was using a lot of nervous energy" },
  { id: 9,  text: "I was worried about situations in which I might panic and make a fool of myself" },
  { id: 10, text: "I felt that I had nothing to look forward to" },
  { id: 11, text: "I found myself getting agitated" },
  { id: 12, text: "I found it difficult to relax" },
  { id: 13, text: "I felt down-hearted and blue" },
  { id: 14, text: "I was intolerant of anything that kept me from getting on with what I was doing" },
  { id: 15, text: "I felt I was close to panic" },
  { id: 16, text: "I was unable to become enthusiastic about anything" },
  { id: 17, text: "I felt I wasn't worth much as a person" },
  { id: 18, text: "I felt that I was rather touchy" },
  { id: 19, text: "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)" },
  { id: 20, text: "I felt scared without any good reason" },
  { id: 21, text: "I felt that life was meaningless" },
].map((q) => ({ ...q, options: OPTIONS }));

// ─── Progress Bar ─────────────────────────────────────────────────────────────
// `answered` = number of questions that have a saved answer (increases on select)
// `current`  = current question index (for the x / total label)

export function ProgressBar({
  answered,
  current,
  total,
}: {
  answered: number;
  current: number;
  total: number;
}) {
  const percentage = Math.min((answered / total) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="w-full max-w-3xl flex flex-col gap-2 mt-8"
    >
      <div className="flex justify-between text-sm text-gray-400">
        <span>progress</span>
        <span>{current} / {total}</span>
      </div>
      <div className="w-full h-2 bg-[#E9C4F5] rounded-full overflow-hidden">
        <motion.div
          key={answered}
          initial={{ width: `${Math.min(((answered - 1) / total) * 100, 0)}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-[#980194] rounded-full"
        />
      </div>
      <p className="text-sm text-gray-400 text-center mt-1">
        Please answer all questions based on how you have been feeling over the past week.
      </p>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

export function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full max-w-3xl mt-8"
    >
      <p className="text-lg font-bold text-gray-900 mb-6">
        {question.id}. {question.text}
      </p>

      <RadioGroup
        value={selected ?? ""}
        onValueChange={onSelect}
        className="pl-4 gap-5"
      >
        {question.options.map((option) => (
          <RadioGroupItem key={option} value={option} label={option} />
        ))}
      </RadioGroup>
    </motion.div>
  );
}

// ─── Navigation Buttons ───────────────────────────────────────────────────────

export function NavigationButtons({
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onPrev,
  onNext,
}: {
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.4 }}
      className="w-full max-w-3xl flex justify-between mt-10 mb-8"
    >
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentQuestion === 1}
        className="flex items-center gap-2 rounded-full border-gray-300 text-gray-600 hover:border-[#980194] hover:text-[#980194] disabled:border-gray-200 disabled:text-gray-300"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <Button
        onClick={onNext}
        disabled={!selectedAnswer}
        className="flex items-center gap-2 rounded-full bg-[#980194] text-white hover:bg-[#7a0178] disabled:bg-gray-200 disabled:text-gray-400"
      >
        {currentQuestion === totalQuestions ? "Submit" : "Next"}
        {currentQuestion !== totalQuestions && <ChevronRight className="w-4 h-4" />}
      </Button>
    </motion.div>
  );
}

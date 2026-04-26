"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { guid } from "@/lib/generateguid";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: number;
}

interface Question {
  id: number;
  text: string;
  options: { id: number; ans: string }[];
}

const OPTIONS = [
  { id: 0, ans: "Did not apply to me at all" },
  { id: 1, ans: "Applied to me to some degree, or some of the time" },
  { id: 2, ans: "Applied to me to a considerable degree or a good part of time" },
  { id: 3, ans: "Applied to me very much or most of the time" },
];

const QUESTIONS: Question[] = [
  { id: 1, text: "I found it hard to wind down" },
  { id: 2, text: "I was aware of dryness of my mouth" },
  { id: 3, text: "I couldn't seem to experience any positive feeling at all" },
  { id: 4, text: "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)" },
  { id: 5, text: "I found it difficult to work up the initiative to do things" },
  { id: 6, text: "I tended to over-react to situations" },
  { id: 7, text: "I experienced trembling (e.g. in the hands)" },
  { id: 8, text: "I felt that I was using a lot of nervous energy" },
  { id: 9, text: "I was worried about situations in which I might panic and make a fool of myself" },
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



// Progress Bar Component
function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = Math.min((current / total) * 100, 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="w-full max-w-10xl flex flex-col gap-6 mt-8"
    >
      <div className="flex justify-between text-sm text-gray-400">
        <span>progress</span>
        <span>{current} / {total}</span>
      </div>
      <div className="w-full h-2 bg-[#E9C4F5] rounded-full overflow-hidden">
        <motion.div
          key={current}
          initial={{ width: `${Math.min(((current - 1) / total) * 100, 100)}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-[#980194] rounded-full"
        />
      </div>
      <p className="text-sm text-gray-400 text-center mt-1">
        Please answer all questions based on how you have been feeling over the past week.
      </p>
    </motion.div>
  );
}

// Question Component
function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: number | null;
  onSelect: (option: number) => void;
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
      <div className="flex flex-col gap-5 pl-4">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="flex items-center gap-5 text-left group"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isSelected
                  ? "border-[#980194] bg-[#980194]"
                  : "border-gray-300 group-hover:border-[#980194]"
                  }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 rounded-full bg-white"
                  />
                )}
              </div>
              <span
                className={`text-base transition-colors duration-200 ${isSelected
                  ? "text-[#980194] font-semibold"
                  : "text-gray-700 group-hover:text-gray-900"
                  }`}
              >
                {option.ans}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Page() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isChatDone, setIsChatDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalQuestions = QUESTIONS.length;
  const [response, setResponse] = useState<{ id: number, depression_score: number, anxiety_score: number, stress_score: number }>();

  const activeQuestion = QUESTIONS[currentQuestion - 1];
  const selectedAnswer = answers[currentQuestion] !== undefined ? answers[currentQuestion] : null;
  console.log(selectedAnswer)

  const submitQuestionnaire = async (finalAnswers: Record<number, number>) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setIsChatDone(true);
    const message = await apiClient.post<{ id: number, depression_score: number, anxiety_score: number, stress_score: number }>(
      '/questionnaire/submit',
      finalAnswers
    );
    if (message) {
      setResponse(message.data);
    }
    setIsSubmitting(false);
  };

  const handleSelect = (option: number) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion]: option,
    };

    setAnswers(updatedAnswers);

    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      void submitQuestionnaire(updatedAnswers);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      console.log(answers)
      await submitQuestionnaire(answers);

    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col flex-1"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #e8b4f0 0%, #f5eef8 40%, #faf6f0 70%)",
      }}
    >
      <div className="h-full flex-1 flex flex-col items-center px-4 overflow-y-auto">
        <div className="w-full max-w-3xl flex flex-col items-center">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl text-center font-bold tracking-tight text-gray-900 mt-12"
          >
            Your <span className="text-[#980194]">Mental Wellbeing</span>
            <br />
            Starts Here.
          </motion.h1>

          <ProgressBar current={currentQuestion} total={totalQuestions} />

          <AnimatePresence mode="wait">
            {!isChatDone && activeQuestion && (
              <QuestionCard
                key={activeQuestion.id}
                question={activeQuestion}
                selected={selectedAnswer}
                onSelect={handleSelect}
              />
            )}
            {isChatDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center"
              >
                <p className="text-lg text-[#980194] font-semibold mb-4">
                  Thank you for completing the questionnaire!
                </p>

                {/* <div className="flex justify-center gap-4 text-sm font-medium">
                  <span className="px-4 py-2 rounded-lg bg-red-50 text-red-600">
                    Depression: {response?.depression_score}
                  </span>

                  <span className="px-4 py-2 rounded-lg bg-yellow-50 text-yellow-600">
                    Anxiety: {response?.anxiety_score}
                  </span>

                  <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600">
                    Stress: {response?.stress_score}
                  </span>
                </div> */}
                <div className="mt-8 flex justify-center gap-6">
                  <button
                    onClick={() => router.replace("/")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${currentQuestion === 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:border-[#980194] hover:text-[#980194]"
                      }`}
                  >
                    Proceed
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prev / Next Buttons */}
          {!isChatDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="w-full max-w-3xl flex justify-between mt-10 mb-8"
            >
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 1}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${currentQuestion === 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:border-[#980194] hover:text-[#980194]"
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={selectedAnswer == null}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedAnswer != null
                  ? "bg-[#980194] text-white hover:bg-[#7a0178]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {currentQuestion === totalQuestions ? "Submit" : "Next"}
                {currentQuestion !== totalQuestions && <ChevronRight className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
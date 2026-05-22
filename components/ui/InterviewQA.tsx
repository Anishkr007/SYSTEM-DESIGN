"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InterviewQuestion } from "@/types";
import NeonBadge from "./NeonBadge";
import CodeBlock from "./CodeBlock";

interface InterviewQAProps {
  questions: InterviewQuestion[];
}

export default function InterviewQA({ questions }: InterviewQAProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const isOpen = openId === q.id;
        const difficultyVariant = 
          q.difficulty === "Easy" ? "success" : 
          q.difficulty === "Medium" ? "warning" : "danger";

        return (
          <div 
            key={q.id} 
            className={`border rounded-xl transition-colors duration-200 overflow-hidden ${
              isOpen ? "bg-white/5 border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-transparent border-white/10 hover:border-white/20"
            }`}
          >
            <button
              onClick={() => toggleOpen(q.id)}
              className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <NeonBadge variant={difficultyVariant}>{q.difficulty}</NeonBadge>
                <span className="font-medium text-white group-hover:text-primary transition-colors">{q.question}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 pt-2 text-zinc-300 leading-relaxed border-t border-white/5">
                    <p className="mb-4">{q.answer}</p>
                    {q.codeExample && (
                      <CodeBlock code={q.codeExample} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

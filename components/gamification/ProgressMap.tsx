"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { motion } from "framer-motion";
import { topics } from "@/data/topics";
import { topicsV2 } from "@/data/topics-v2";
import Link from "next/link";
import { useEffect, useState } from "react";

const allTopics = [...topics, ...topicsV2];

export default function ProgressMap() {
  const { completedTopics } = useGamificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = allTopics.length;
  const completed = completedTopics.length;
  const percentage = Math.round((completed / total) * 100) || 0;

  return (
    <div className="w-full h-[600px] bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
      
      {/* Background Grid */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-10">
        <defs>
          <pattern id="progress-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#progress-grid)" />
      </svg>

      {/* Center Percentage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
        <span className="text-[20rem] font-bold text-white">{percentage}%</span>
      </div>

      {/* Topics Graph Layout (Simplified circular layout) */}
      <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center z-10">
        {allTopics.map((topic, i) => {
          const isCompleted = completedTopics.includes(topic.id);
          
          // Simple circular distribution for visual flair
          const angle = (i / total) * 2 * Math.PI;
          const radius = 200 + (i % 2 === 0 ? 50 : 0);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <Link key={topic.id} href={`/topics/${topic.slug}`}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                style={{ x, y }}
                className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
                  isCompleted 
                    ? "bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                    : "bg-white/5 border-white/10 hover:border-primary hover:bg-primary/10"
                }`}
                title={topic.title}
              >
                <span className="text-2xl">{topic.emoji}</span>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-black text-[10px] font-bold border-2 border-[#0a0a0f]">
                    ✓
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
      
      <div className="absolute bottom-6 left-6 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          <span className="text-sm text-zinc-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30"></div>
          <span className="text-sm text-zinc-400">Not Started</span>
        </div>
      </div>
    </div>
  );
}

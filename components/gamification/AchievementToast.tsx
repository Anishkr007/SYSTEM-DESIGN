"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/types";

export default function AchievementToast() {
  const { unlockedAchievements } = useGamificationStore();
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [displayedIds, setDisplayedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Detect new achievements
    const newAchs = unlockedAchievements.filter(ach => !displayedIds.has(ach.id));
    
    if (newAchs.length > 0) {
      setQueue(prev => [...prev, ...newAchs]);
      setDisplayedIds(prev => {
        const next = new Set(prev);
        newAchs.forEach(a => next.add(a.id));
        return next;
      });
    }
  }, [unlockedAchievements, displayedIds]);

  // Handle taking the first off the queue and showing it for 4s
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
      
      const timer = setTimeout(() => {
        setCurrent(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [current, queue]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-[#0f0f16] border border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] rounded-xl p-4 flex items-start gap-4 max-w-sm pointer-events-auto"
          >
            <div className="text-4xl bg-primary/20 p-2 rounded-lg border border-primary/30">
              {current.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">Achievement Unlocked!</span>
              <span className="text-white font-bold text-lg leading-tight mb-1">{current.title}</span>
              <span className="text-zinc-400 text-sm leading-snug mb-2">{current.description}</span>
              <span className="text-green-400 font-mono text-xs font-bold px-2 py-0.5 bg-green-500/10 rounded w-fit">
                +{current.xpAward} XP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

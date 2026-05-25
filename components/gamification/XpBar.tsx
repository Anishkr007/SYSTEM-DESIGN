"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function XpBar() {
  const { xp, level } = useGamificationStore();
  const [mounted, setMounted] = useState(false);
  const [prevXp, setPrevXp] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    setMounted(true);
    setPrevXp(xp);
  }, [xp]);

  useEffect(() => {
    if (mounted && xp > prevXp) {
      setXpGained(xp - prevXp);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      setPrevXp(xp);
      return () => clearTimeout(timer);
    }
  }, [xp, mounted, prevXp]);

  if (!mounted) return null;

  const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000, 10000];
  const currentLevelThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const progressPercent = Math.min(
    100,
    Math.max(0, ((xp - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100)
  );

  return (
    <div className="relative flex items-center gap-3">
      {/* Level Badge */}
      <div className="bg-primary/20 border border-primary/50 text-primary-200 font-bold px-2 py-0.5 rounded text-sm shadow-[0_0_10px_rgba(99,102,241,0.3)]">
        L{level}
      </div>

      {/* Bar and XP */}
      <div className="flex flex-col gap-1 w-32">
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-medium">
          <span>{xp} XP</span>
          <span>{nextLevelThreshold}</span>
        </div>
        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          />
        </div>
      </div>

      {/* Floating XP Gain Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="absolute -top-6 right-0 text-green-400 font-bold text-sm drop-shadow-[0_0_5px_rgba(74,222,128,0.8)] pointer-events-none"
          >
            +{xpGained} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

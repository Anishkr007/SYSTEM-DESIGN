"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StreakCounter() {
  const { streak, incrementStreak } = useGamificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mount, trigger increment logic to update daily streak
    incrementStreak();
  }, [incrementStreak]);

  if (!mounted || streak === 0) return null;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.2)]"
      title={`${streak} day learning streak!`}
    >
      <motion.span 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] text-sm"
      >
        🔥
      </motion.span>
      <span className="text-orange-400 font-bold text-sm">{streak}</span>
    </motion.div>
  );
}

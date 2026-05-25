import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Achievement } from "@/types";
import { achievements } from "@/data/achievements";

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastVisit: string;
  completedTopics: string[];
  unlockedAchievements: Achievement[];
  totalInterviewsCompleted: number;
  totalQuestionsAnswered: number;
  
  // Actions
  addXp: (amount: number, reason?: string) => void;
  incrementStreak: () => void;
  markTopicCompleted: (topicId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  recordInterview: (score: number) => void;
  recordQuestionAnswered: () => void;
}

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000];

export const useGamificationStore = create<GamificationState>()(
  persist(
    immer((set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastVisit: "",
      completedTopics: [],
      unlockedAchievements: [],
      totalInterviewsCompleted: 0,
      totalQuestionsAnswered: 0,

      addXp: (amount, reason) => {
        set((state) => {
          state.xp += amount;
          // Calculate level
          let newLevel = 1;
          for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (state.xp >= LEVEL_THRESHOLDS[i]) {
              newLevel = i + 1;
            }
          }
          if (newLevel > state.level) {
            state.level = newLevel;
            // Optionally trigger an achievement for reaching level 5
            if (newLevel === 5) {
              const ach = achievements.find(a => a.id === "system-architect");
              if (ach && !state.unlockedAchievements.some(a => a.id === ach.id)) {
                state.unlockedAchievements.push({ ...ach, unlockedAt: new Date().toISOString() });
              }
            }
          }
        });
      },

      incrementStreak: () => {
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastVisit === today) return; // Already visited today
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (state.lastVisit === yesterday.toDateString()) {
            state.streak += 1;
          } else {
            state.streak = 1;
          }
          state.lastVisit = today;

          if (state.streak === 7) {
            const ach = achievements.find(a => a.id === "streak-warrior");
            if (ach && !state.unlockedAchievements.some(a => a.id === ach.id)) {
              state.unlockedAchievements.push({ ...ach, unlockedAt: new Date().toISOString() });
            }
          }
        });
      },

      markTopicCompleted: (topicId: string) => {
        set((state) => {
          if (!state.completedTopics.includes(topicId)) {
            state.completedTopics.push(topicId);
          }
        });
      },

      unlockAchievement: (achievementId: string) => {
        const ach = achievements.find(a => a.id === achievementId);
        if (!ach) return;
        
        set((state) => {
          if (!state.unlockedAchievements.some(a => a.id === achievementId)) {
            state.unlockedAchievements.push({ ...ach, unlockedAt: new Date().toISOString() });
            state.xp += ach.xpAward; // Automatically award XP for achievement
          }
        });
      },

      recordInterview: (score: number) => {
        set((state) => {
          state.totalInterviewsCompleted += 1;
          if (state.totalInterviewsCompleted >= 3) {
            const ach = achievements.find(a => a.id === "interview-ready");
            if (ach && !state.unlockedAchievements.some(a => a.id === ach.id)) {
              state.unlockedAchievements.push({ ...ach, unlockedAt: new Date().toISOString() });
            }
          }
        });
      },

      recordQuestionAnswered: () => {
        set((state) => {
          state.totalQuestionsAnswered += 1;
        });
      }
    })),
    {
      name: "system-design-gamification",
    }
  )
);

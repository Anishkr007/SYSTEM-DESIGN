import { create } from "zustand";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiState {
  isChatbotOpen: boolean;
  toggleChatbot: () => void;
  chatHistory: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearHistory: () => void;
  
  // Explainer Panel State
  isExplainerOpen: boolean;
  explainerTopic: string | null;
  explainerContext: string | null;
  openExplainer: (topic: string, context: string) => void;
  closeExplainer: () => void;
}

export const useAiStore = create<AiState>((set) => ({
  isChatbotOpen: false,
  toggleChatbot: () => set((state) => ({ isChatbotOpen: !state.isChatbotOpen })),
  
  chatHistory: [{ role: "assistant", content: "Hi! I'm ANISH, your AI system design tutor. How can I help you today?" }],
  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearHistory: () => set({ chatHistory: [{ role: "assistant", content: "Hi! I'm ANISH, your AI system design tutor. How can I help you today?" }] }),

  isExplainerOpen: false,
  explainerTopic: null,
  explainerContext: null,
  openExplainer: (topic, context) => set({ isExplainerOpen: true, explainerTopic: topic, explainerContext: context }),
  closeExplainer: () => set({ isExplainerOpen: false, explainerTopic: null, explainerContext: null }),
}));

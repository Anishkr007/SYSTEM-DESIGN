"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiStore } from "@/store/useAiStore";
import { Sparkles, X, Copy, Check } from "lucide-react";
import { useGamificationStore } from "@/store/useGamificationStore";

export default function AiExplainerButton({ topicTitle, currentContext }: { topicTitle: string, currentContext: string }) {
  const { isExplainerOpen, openExplainer, closeExplainer } = useAiStore();
  const [explanation, setExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addXp } = useGamificationStore();

  const handleOpen = async () => {
    openExplainer(topicTitle, currentContext);
    setExplanation("");
    setIsGenerating(true);
    addXp(10, "Used AI Explainer");

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle, context: currentContext })
      });

      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setExplanation((prev) => prev + chunk);
      }
    } catch {
      setExplanation("Failed to generate explanation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary-300 hover:bg-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] font-medium text-sm"
      >
        <Sparkles size={16} />
        Explain with AI
      </button>

      <AnimatePresence>
        {isExplainerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-[450px] bg-[#0a0a0f]/95 backdrop-blur-2xl border-l border-primary/30 shadow-[-10px_0_30px_rgba(99,102,241,0.1)] z-50 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-2 text-primary-200 font-bold">
                <Sparkles size={18} />
                AI Explainer
              </div>
              <button onClick={closeExplainer} className="text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {explanation}
              {isGenerating && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
                />
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
              <button
                onClick={copyToClipboard}
                disabled={isGenerating || !explanation}
                className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy output"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

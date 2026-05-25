"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiStore } from "@/store/useAiStore";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { marked } from "marked";

export default function AiChatbot() {
  const { isChatbotOpen, toggleChatbot, chatHistory, addMessage } = useAiStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { unlockAchievement } = useGamificationStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // Check for achievement
    if (chatHistory.filter(m => m.role === 'user').length === 4) {
      unlockAchievement("curious-mind");
    }

    addMessage({ role: "user", content: text });
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatHistory, { role: "user", content: text }] })
      });

      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantMsg = "";
      addMessage({ role: "assistant", content: "" }); // Placeholder

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMsg += chunk;
        
        // Update the last message
        useAiStore.setState((state) => {
          const newHistory = [...state.chatHistory];
          newHistory[newHistory.length - 1] = { role: "assistant", content: assistantMsg };
          return { chatHistory: newHistory };
        });
      }
    } catch {
      addMessage({ role: "assistant", content: "Sorry, I encountered an error connecting to my neural net." });
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = ["Explain Kafka", "When to use NoSQL?", "What is CAP?"];

  return (
    <>
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-[#0a0a0f] border border-cyan-500/30 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="bg-cyan-900/40 border-b border-cyan-500/20 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Sparkles size={18} /> ANISH AI
              </div>
              <button onClick={toggleChatbot} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-cyan-600 text-white rounded-tr-sm' 
                        : 'bg-white/10 text-zinc-200 border border-white/10 rounded-tl-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
                  />
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {chatHistory.length < 3 && (
              <div className="px-4 py-2 flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-white/10 bg-black/40">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a system design question..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="bg-cyan-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-cyan-500 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

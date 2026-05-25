"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { topics } from "@/data/topics";
import { topicsV2 } from "@/data/topics-v2";
import { useGamificationStore } from "@/store/useGamificationStore";
import { Brain, CheckCircle, AlertTriangle } from "lucide-react";

const allTopics = [...topics, ...topicsV2];

export default function InterviewModePanel() {
  const [topic, setTopic] = useState(allTopics[0].id);
  const [status, setStatus] = useState<"idle" | "question" | "evaluating" | "result">("idle");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{score: number, whatYouGotRight: string[], whatYouMissed: string[], modelAnswer: string} | null>(null);
  const { recordInterview, addXp } = useGamificationStore();

  const handleStart = () => {
    const topicData = allTopics.find(t => t.id === topic);
    if (!topicData || !topicData.interviewQuestions.length) return;
    
    // Pick a random question
    const q = topicData.interviewQuestions[Math.floor(Math.random() * topicData.interviewQuestions.length)];
    setCurrentQuestion(q.question);
    setStatus("question");
    setAnswer("");
  };

  const handleSubmit = async () => {
    setStatus("evaluating");
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, answer })
      });
      const data = await res.json();
      setResult(data);
      setStatus("result");
      
      // Gamification
      recordInterview(data.score);
      addXp(200, "Completed Mock Interview");
      if (data.score >= 8) {
        addXp(100, "High Score Bonus");
      }
    } catch (e) {
      console.error(e);
      setStatus("question");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-center p-8 bg-black/40 border border-white/10 rounded-3xl relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* State: Idle */}
        {status === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center z-10 w-full max-w-md">
            <Brain size={64} className="text-primary mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <h2 className="text-3xl font-bold text-white mb-2">Mock Interview</h2>
            <p className="text-zinc-400 text-center mb-8">Test your knowledge against ANISH AI in a simulated FAANG system design interview.</p>
            
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Select Topic</label>
              <select 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              >
                {allTopics.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#0a0a0f]">{t.title}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleStart}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-indigo-400 transition-colors shadow-neon-primary"
            >
              Start Interview
            </button>
          </motion.div>
        )}

        {/* State: Question / Evaluating */}
        {(status === "question" || status === "evaluating") && (
          <motion.div key="question" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full z-10">
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6">
              <div className="text-primary text-sm font-bold uppercase tracking-wider mb-2">Interviewer</div>
              <div className="text-xl text-white font-medium">{currentQuestion}</div>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={status === "evaluating"}
              placeholder="Type your detailed architectural answer here..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-lg focus:outline-none focus:border-primary disabled:opacity-50 custom-scrollbar mb-6"
            />

            <button 
              onClick={handleSubmit}
              disabled={!answer.trim() || status === "evaluating"}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-primary relative overflow-hidden"
            >
              {status === "evaluating" ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Evaluating Answer...
                </div>
              ) : "Submit Answer"}
            </button>
          </motion.div>
        )}

        {/* State: Result */}
        {status === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary/30 bg-primary/10 text-4xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-4">
                {result.score}/10
              </div>
              <h2 className="text-2xl font-bold text-white">Interview Evaluation</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-green-400 font-bold mb-4">
                  <CheckCircle size={20} /> What you got right
                </div>
                <ul className="space-y-3">
                  {result.whatYouGotRight.map((item: string, i: number) => (
                    <li key={i} className="text-zinc-300 text-sm flex gap-2"><span className="text-green-500">•</span> {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-4">
                  <AlertTriangle size={20} /> What you missed
                </div>
                <ul className="space-y-3">
                  {result.whatYouMissed.map((item: string, i: number) => (
                    <li key={i} className="text-zinc-300 text-sm flex gap-2"><span className="text-amber-500">•</span> {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Model Answer</div>
              <div className="text-zinc-300 leading-relaxed">{result.modelAnswer}</div>
            </div>

            <button 
              onClick={() => setStatus("idle")}
              className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Next Question
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

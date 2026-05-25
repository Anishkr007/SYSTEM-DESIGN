"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthFlowViz() {
  const [step, setStep] = useState(0); // 0: login, 1: auth server, 2: jwt returned, 3: access resource
  
  const handleNext = () => {
    setStep(s => (s + 1) % 4);
  };

  return (
    <div className="w-full bg-black/20 border border-white/10 rounded-2xl p-8 flex flex-col items-center min-h-[400px]">
      <div className="flex justify-between w-full max-w-3xl mb-16 relative">
        <Node id="client" label="Client App" icon="📱" active={step === 0 || step === 3} />
        <Node id="auth" label="Auth Server" icon="🔐" active={step === 1 || step === 2} />
        <Node id="api" label="Resource API" icon="🗄️" active={step === 3} />

        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ top: "35px" }}>
          {/* Client to Auth */}
          {step === 1 && (
             <motion.path 
               initial={{ pathLength: 0 }} 
               animate={{ pathLength: 1 }} 
               d="M 100 0 L 330 0" 
               stroke="#6366f1" strokeWidth="3" fill="none" 
             />
          )}
          {/* Auth to Client (Token) */}
          {step === 2 && (
             <motion.path 
               initial={{ pathLength: 0 }} 
               animate={{ pathLength: 1 }} 
               d="M 330 20 Q 215 60 100 20" 
               stroke="#06b6d4" strokeWidth="3" fill="none" strokeDasharray="5,5" 
             />
          )}
          {/* Client to API */}
          {step === 3 && (
             <motion.path 
               initial={{ pathLength: 0 }} 
               animate={{ pathLength: 1 }} 
               d="M 100 -20 Q 380 -100 660 -20" 
               stroke="#a855f7" strokeWidth="3" fill="none" 
             />
          )}
        </svg>
      </div>

      <div className="h-24 w-full max-w-xl text-center bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          {step === 0 && <motion.div key="0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-300">1. User enters username and password in the client app.</motion.div>}
          {step === 1 && <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-indigo-300 font-bold">2. Credentials sent to Auth Server for verification.</motion.div>}
          {step === 2 && <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-cyan-300 font-bold">3. Auth Server signs a JWT and returns it to the client.</motion.div>}
          {step === 3 && <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-purple-300 font-bold">4. Client sends JWT in the Authorization header to access protected resources.</motion.div>}
        </AnimatePresence>
      </div>

      <button onClick={handleNext} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-neon-primary">
        {step === 3 ? "Restart Flow" : "Next Step"}
      </button>
    </div>
  );
}

function Node({ label, icon, active }: { label: string, icon: string, active: boolean, id?: string }) {
  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${active ? "scale-110" : "scale-100 opacity-70"}`}>
      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl mb-3 border-2 transition-colors ${active ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "bg-[#0a0a0f] border-white/20"}`}>
        {icon}
      </div>
      <span className="text-white font-bold text-sm tracking-wide">{label}</span>
    </div>
  );
}

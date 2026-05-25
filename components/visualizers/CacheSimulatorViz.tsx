"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function CacheSimulatorViz() {
  const [strategy, setStrategy] = useState<"cache-aside" | "write-through" | "write-back">("cache-aside");

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
      
      <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar">
        {["cache-aside", "write-through", "write-back"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStrategy(tab as "cache-aside" | "write-through" | "write-back")}
            className={`px-6 py-3 text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
              strategy === tab ? "text-primary border-b-2 border-primary bg-primary/5" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 relative flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {strategy === "cache-aside" && <CacheAsidePanel key="cache-aside" />}
          {strategy === "write-through" && <WriteThroughPanel key="write-through" />}
          {strategy === "write-back" && <WriteBackPanel key="write-back" />}
        </AnimatePresence>
      </div>

    </div>
  );
}

function CacheAsidePanel() {
  const [phase, setPhase] = useState(0); // 0: idle, 1: req->cache, 2: miss->db, 3: db->app, 4: app->cache (write)
  
  const simulate = () => {
    if (phase !== 0) return;
    setPhase(1);
    setTimeout(() => setPhase(2), 800);
    setTimeout(() => setPhase(3), 1600);
    setTimeout(() => setPhase(4), 2400);
    setTimeout(() => setPhase(0), 3200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl relative h-64">
      <div className="text-zinc-400 font-bold mb-8 uppercase tracking-widest text-sm">Read Flow</div>
      <div className="flex justify-between w-full relative">
        <Box id="app" label="Application" icon="💻" glow={phase === 1 || phase === 3 || phase === 4} />
        <Box id="cache" label="Cache" icon="⚡" glow={phase === 1 || phase === 4} />
        <Box id="db" label="Database" icon="🗄️" glow={phase === 2 || phase === 3} />

        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ top: "35px" }}>
          {/* App to Cache */}
          <path d="M 80 0 L 290 0" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          {/* Cache to DB (App to DB bypassing cache) */}
          <path d="M 80 20 Q 300 100 580 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
          
          {phase === 1 && <circle r="4" fill="#6366f1"><animateMotion dur="0.8s" path="M 80 0 L 290 0" /></circle>}
          {phase === 2 && <circle r="4" fill="#f43f5e"><animateMotion dur="0.8s" path="M 80 20 Q 300 100 580 20" /></circle>}
          {phase === 3 && <circle r="4" fill="#10b981"><animateMotion dur="0.8s" path="M 580 20 Q 300 100 80 20" /></circle>}
          {phase === 4 && <circle r="4" fill="#10b981"><animateMotion dur="0.8s" path="M 80 0 L 290 0" /></circle>}
        </svg>
      </div>

      <button onClick={simulate} disabled={phase !== 0} className="mt-16 bg-white/10 hover:bg-white/20 text-white px-8 py-2 rounded-xl font-bold">
        {phase === 0 ? "Simulate Read (Cache Miss)" : "Simulating..."}
      </button>
    </div>
  );
}

function WriteThroughPanel() {
  const [phase, setPhase] = useState(0); 
  
  const simulate = () => {
    if (phase !== 0) return;
    setPhase(1);
    setTimeout(() => setPhase(0), 1000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl relative h-64">
      <div className="text-zinc-400 font-bold mb-8 uppercase tracking-widest text-sm">Write Flow</div>
      <div className="flex justify-between w-full relative">
        <Box id="app" label="Application" icon="💻" glow={phase === 1} />
        <Box id="cache" label="Cache" icon="⚡" glow={phase === 1} />
        <Box id="db" label="Database" icon="🗄️" glow={phase === 1} />

        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ top: "35px" }}>
          <path d="M 80 0 L 290 0" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <path d="M 370 0 L 580 0" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          
          {phase === 1 && <circle r="4" fill="#f59e0b"><animateMotion dur="0.8s" path="M 80 0 L 290 0" /></circle>}
          {phase === 1 && <circle r="4" fill="#f59e0b"><animateMotion dur="0.8s" begin="0.2s" path="M 370 0 L 580 0" /></circle>}
        </svg>
      </div>
      <div className="text-xs text-zinc-500 mt-4">Data is written to cache and DB synchronously. High latency, high consistency.</div>
      <button onClick={simulate} disabled={phase !== 0} className="mt-8 bg-white/10 hover:bg-white/20 text-white px-8 py-2 rounded-xl font-bold">Simulate Write</button>
    </div>
  );
}

function WriteBackPanel() {
  const [phase, setPhase] = useState(0); 
  
  const simulate = () => {
    if (phase !== 0) return;
    setPhase(1); // app -> cache
    setTimeout(() => setPhase(2), 800); // idle in cache
    setTimeout(() => setPhase(3), 2000); // cache -> db async
    setTimeout(() => setPhase(0), 2800);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl relative h-64">
      <div className="text-zinc-400 font-bold mb-8 uppercase tracking-widest text-sm">Write Flow</div>
      <div className="flex justify-between w-full relative">
        <Box id="app" label="Application" icon="💻" glow={phase === 1} />
        <Box id="cache" label="Cache" icon="⚡" glow={phase === 1 || phase === 2 || phase === 3} />
        <Box id="db" label="Database" icon="🗄️" glow={phase === 3} />

        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ top: "35px" }}>
          <path d="M 80 0 L 290 0" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <path d="M 370 0 L 580 0" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4,4" />
          
          {phase === 1 && <circle r="4" fill="#f59e0b"><animateMotion dur="0.8s" path="M 80 0 L 290 0" /></circle>}
          {phase === 3 && <circle r="4" fill="#f59e0b"><animateMotion dur="0.8s" path="M 370 0 L 580 0" /></circle>}
        </svg>
      </div>
      <div className="text-xs text-zinc-500 mt-4">Data is written to cache immediately. Written to DB asynchronously later. Low latency, risk of data loss.</div>
      <button onClick={simulate} disabled={phase !== 0} className="mt-8 bg-white/10 hover:bg-white/20 text-white px-8 py-2 rounded-xl font-bold">Simulate Write</button>
    </div>
  );
}

function Box({ label, icon, glow }: { label: string, icon: string, glow?: boolean, id?: string }) {
  return (
    <div className="flex flex-col items-center z-10 w-20">
      <div 
        className="w-16 h-16 bg-[#0a0a0f] border border-white/20 rounded-xl flex items-center justify-center text-2xl mb-3 transition-all duration-300"
        style={{ boxShadow: glow ? `0 0 20px rgba(99,102,241,0.5), inset 0 0 10px rgba(99,102,241,0.3)` : "none", borderColor: glow ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.2)" }}
      >
        {icon}
      </div>
      <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
}

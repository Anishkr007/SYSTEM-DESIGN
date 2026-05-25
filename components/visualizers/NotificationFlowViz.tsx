"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationFlowViz() {
  const [activeTab, setActiveTab] = useState<"delivery" | "retry" | "workers">("delivery");

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
      
      <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar">
        {["delivery", "retry", "workers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "delivery" | "retry" | "workers")}
            className={`px-6 py-3 text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === tab ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab} pipeline
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 relative">
        <AnimatePresence mode="wait">
          {activeTab === "delivery" && <DeliveryPanel key="delivery" />}
          {activeTab === "retry" && <RetryPanel key="retry" />}
          {activeTab === "workers" && <WorkersPanel key="workers" />}
        </AnimatePresence>
      </div>

    </div>
  );
}

function DeliveryPanel() {
  const [packets, setPackets] = useState<{id: number, type: "push" | "email" | "sms", status: "flowing" | "done" | "failed"}[]>([]);

  const send = (type: "push" | "email" | "sms") => {
    const id = Date.now() + Math.random();
    setPackets(p => [...p, { id, type, status: "flowing" }]);
    
    setTimeout(() => {
      setPackets(p => p.map(pkt => pkt.id === id ? { ...pkt, status: Math.random() > 0.2 ? "done" : "failed" } : pkt));
      
      setTimeout(() => {
        setPackets(p => p.filter(pkt => pkt.id !== id));
      }, 2000);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-between py-8">
      
      <div className="flex gap-4">
        <button onClick={() => send("push")} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 px-6 py-2 rounded-xl font-bold hover:bg-indigo-500/30 transition-colors">Send Push</button>
        <button onClick={() => send("sms")} className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-6 py-2 rounded-xl font-bold hover:bg-amber-500/30 transition-colors">Send SMS</button>
        <button onClick={() => send("email")} className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-6 py-2 rounded-xl font-bold hover:bg-cyan-500/30 transition-colors">Send Email</button>
      </div>

      <div className="flex items-center w-full max-w-4xl justify-between relative mt-16">
        
        {/* Track lines */}
        <div className="absolute top-1/2 -translate-y-1/2 left-[10%] right-[10%] h-1 bg-white/10 rounded-full" />
        
        <Box label="API Gateway" icon="🌐" />
        <Box label="Message Queue" icon="📨" />
        <Box label="Worker Pool" icon="⚙️" />
        <Box label="3rd Party (APNs/Twilio)" icon="📡" />

        {/* Animated Packets */}
        {packets.map(p => (
          <motion.div
            key={p.id}
            initial={{ left: "10%", scale: 1, opacity: 1 }}
            animate={{ 
              left: p.status === "flowing" ? "90%" : (p.status === "done" ? "95%" : "50%"),
              opacity: p.status === "flowing" ? 1 : 0,
              scale: p.status === "flowing" ? 1 : 2
            }}
            transition={{ duration: p.status === "flowing" ? 2.5 : 0.5, ease: "linear" }}
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full -ml-2 z-20 ${
              p.type === "push" ? "bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" :
              p.type === "sms" ? "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]" :
              "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            }`}
          >
            {p.status === "done" && <span className="absolute -top-6 -left-2 text-green-400 text-sm font-bold">✓</span>}
            {p.status === "failed" && <span className="absolute -top-6 -left-2 text-red-500 text-sm font-bold">✗</span>}
          </motion.div>
        ))}

      </div>

    </div>
  );
}

function RetryPanel() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h3 className="text-xl font-bold text-white mb-8">Exponential Backoff Ladder</h3>
      
      <div className="flex flex-col gap-4 w-full max-w-lg">
        {[
          { attempt: 1, wait: "0s", color: "bg-green-500/20 border-green-500/50" },
          { attempt: 2, wait: "1s", color: "bg-yellow-500/20 border-yellow-500/50" },
          { attempt: 3, wait: "4s", color: "bg-orange-500/20 border-orange-500/50" },
          { attempt: 4, wait: "16s", color: "bg-red-500/20 border-red-500/50" },
          { attempt: "DLQ", wait: "Dead Letter Queue", color: "bg-black border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]" }
        ].map((level, i) => (
          <div key={i} className={`p-4 rounded-xl border flex justify-between items-center w-full ${level.color}`}>
            <span className="font-bold text-white">Attempt {level.attempt}</span>
            <span className="font-mono text-zinc-400">{level.wait}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkersPanel() {
  const [rate, setRate] = useState(10);
  
  const workers = rate < 200 ? 2 : rate < 400 ? 4 : 6;

  return (
    <div className="h-full flex flex-col items-center pt-12">
      <div className="w-full max-w-md mb-16">
        <label className="flex justify-between text-zinc-400 text-sm font-bold uppercase mb-4">
          <span>Message Rate</span>
          <span className="text-cyan-400">{rate} msg/sec</span>
        </label>
        <input 
          type="range" 
          min="10" 
          max="500" 
          value={rate} 
          onChange={e => setRate(parseInt(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-2xl">
        <AnimatePresence>
          {Array.from({ length: workers }).map((_, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl border-2 transition-colors duration-300 ${
                rate > 400 ? "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" :
                rate > 200 ? "bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" :
                "bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              }`}
            >
              ⚙️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-8 text-zinc-500 font-mono text-sm">
        Auto-scaling based on queue depth threshold
      </div>
    </div>
  );
}

function Box({ label, icon }: { label: string, icon: string }) {
  return (
    <div className="flex flex-col items-center z-10 bg-[#0a0a0f] p-2 rounded-xl border border-white/10">
      <div className="w-16 h-16 flex items-center justify-center text-3xl bg-white/5 rounded-lg mb-2">
        {icon}
      </div>
      <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">{label}</span>
    </div>
  );
}

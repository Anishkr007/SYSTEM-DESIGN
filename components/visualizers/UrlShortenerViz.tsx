"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UrlShortenerViz() {
  const [activeTab, setActiveTab] = useState<"generator" | "redirect" | "hashing" | "sharding">("generator");

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
      
      {/* Sub-tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar">
        {["generator", "redirect", "hashing", "sharding"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "generator" | "redirect" | "hashing" | "sharding")}
            className={`px-6 py-3 text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === tab ? "text-primary border-b-2 border-primary bg-primary/5" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 relative">
        <AnimatePresence mode="wait">
          {activeTab === "generator" && <GeneratorPanel key="generator" />}
          {activeTab === "redirect" && <RedirectPanel key="redirect" />}
          {activeTab === "hashing" && <HashingPanel key="hashing" />}
          {activeTab === "sharding" && <ShardingPanel key="sharding" />}
        </AnimatePresence>
      </div>

    </div>
  );
}

function GeneratorPanel() {
  const [inputUrl, setInputUrl] = useState("https://example.com/very/long/article/12345");
  const [step, setStep] = useState(0); // 0: idle, 1: generating, 2: done
  const [hash, setHash] = useState("");

  const handleShorten = () => {
    if (!inputUrl) return;
    setStep(1);
    
    // Simulate generation
    setTimeout(() => {
      // Mock hash generation
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let h = "";
      for(let i=0; i<7; i++) h += chars.charAt(Math.floor(Math.random() * chars.length));
      setHash(h);
      setStep(2);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
        
        <div className="flex gap-4 w-full mb-8">
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={step === 1}
            className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button 
            onClick={handleShorten}
            disabled={step === 1}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          >
            {step === 1 ? "Hashing..." : "Shorten URL"}
          </button>
        </div>

        <div className="relative w-full h-32 flex items-center justify-center">
          {step === 1 && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full"
            />
          )}
          
          {step === 2 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="flex flex-col items-center"
            >
              <div className="text-zinc-400 text-sm mb-2 font-mono uppercase tracking-wider">Base62 Hash</div>
              <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] mb-4">
                {hash}
              </div>
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                short.ly/{hash}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

function RedirectPanel() {
  const [isHit, setIsHit] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState(0); // 0: client->lb, 1: lb->cache, 2: cache->db, 3: return

  const handleSimulate = () => {
    setIsAnimating(true);
    setPhase(0);
    setTimeout(() => setPhase(1), 500);
    setTimeout(() => {
      if (isHit) {
        setPhase(3); // return from cache
        setTimeout(() => { setIsAnimating(false); setPhase(0); }, 1000);
      } else {
        setPhase(2); // go to db
        setTimeout(() => {
          setPhase(3); // return from db
          setTimeout(() => { setIsAnimating(false); setPhase(0); }, 1000);
        }, 1000);
      }
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
      
      <div className="flex gap-4 mb-12">
        <button 
          onClick={() => setIsHit(true)} 
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isHit ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-white/5 text-zinc-400"}`}
        >
          Simulate Cache Hit (2ms)
        </button>
        <button 
          onClick={() => setIsHit(false)} 
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${!isHit ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-white/5 text-zinc-400"}`}
        >
          Simulate Cache Miss (45ms)
        </button>
      </div>

      <div className="flex items-center gap-8 relative w-full max-w-3xl justify-between">
        
        <Box id="client" label="Client" icon="💻" />
        
        <div className="flex-1 h-0.5 bg-white/10 relative">
          {isAnimating && (phase === 0 || phase === 3) && (
            <motion.div 
              initial={{ left: phase === 0 ? "0%" : "100%" }}
              animate={{ left: phase === 0 ? "100%" : "0%" }}
              transition={{ duration: 0.5 }}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${phase === 0 ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" : "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"}`}
            />
          )}
        </div>

        <Box id="cache" label="Redis Cache" icon="⚡" glow={isAnimating && phase === 1 ? (isHit ? "rgba(74,222,128,0.5)" : "rgba(239,68,68,0.5)") : "transparent"} />

        <div className="flex-1 h-0.5 bg-white/10 relative">
          {isAnimating && (phase === 2 || (phase === 3 && !isHit)) && (
            <motion.div 
              initial={{ left: phase === 2 ? "0%" : "100%" }}
              animate={{ left: phase === 2 ? "100%" : "0%" }}
              transition={{ duration: 1 }}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${phase === 2 ? "bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"}`}
            />
          )}
        </div>

        <Box id="db" label="Database" icon="🗄️" glow={isAnimating && phase === 2 ? "rgba(99,102,241,0.5)" : "transparent"} />

      </div>

      <button onClick={handleSimulate} disabled={isAnimating} className="mt-16 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-colors">
        Run Request
      </button>

    </motion.div>
  );
}

function HashingPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        <HashCard name="MD5" length="128-bit (32 chars hex)" speed="Fast" collision="Medium" output="5d41402abc4b2a76b9719d911017c592" />
        <HashCard name="SHA-256" length="256-bit (64 chars hex)" speed="Slow" collision="Very Low" output="2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae" />
        <HashCard name="Base62 Encoding" length="7 chars (custom)" speed="Fastest" collision="Low (with ID generator)" output="aB3x9kL" highlight />
      </div>
    </motion.div>
  );
}

function HashCard({ name, length, speed, collision, output, highlight }: { name: string, length: string, speed: string, collision: string, output: string, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "bg-white/5 border-white/10"} flex flex-col gap-4`}>
      <div className="flex justify-between items-center">
        <h3 className={`font-bold text-lg ${highlight ? "text-primary-300" : "text-white"}`}>{name}</h3>
        {highlight && <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold uppercase">Chosen</span>}
      </div>
      <div className="text-xs text-zinc-400 font-mono break-all bg-black/50 p-2 rounded border border-white/5">{output}</div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">Output:</span> <span className="text-white">{length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">Speed:</span> <span className="text-white">{speed}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">Collision:</span> <span className="text-white">{collision}</span>
      </div>
    </div>
  );
}

function ShardingPanel() {
  const [key, setKey] = useState("aB3x9kL");
  const [shard, setShard] = useState<number | null>(null);

  const routeKey = () => {
    // Simple mock hash mapping
    const asciiSum = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setShard(asciiSum % 3);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center pt-8">
      <div className="flex gap-4 mb-16">
        <input type="text" value={key} onChange={e => setKey(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-center font-mono" placeholder="Base62 Hash" />
        <button onClick={routeKey} className="bg-primary text-white px-4 py-2 rounded-lg font-bold">hash(key) % 3</button>
      </div>

      <div className="flex gap-12 relative">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-32 h-40 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${shard === i ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(99,102,241,0.5)] scale-110" : "bg-white/5 border-white/10"}`}>
            <span className="text-4xl mb-2">🗄️</span>
            <span className="text-white font-bold">Shard {i}</span>
          </div>
        ))}

        {shard !== null && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-16 text-primary drop-shadow-[0_0_10px_rgba(99,102,241,1)] text-2xl"
            style={{ left: `${shard * 176 + 64}px`, transform: "translateX(-50%)" }}
          >
            ↓
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function Box({ label, icon, glow }: { label: string, icon: string, glow?: string, id?: string }) {
  return (
    <div className="flex flex-col items-center z-10">
      <div 
        className="w-20 h-20 bg-[#0a0a0f] border border-white/20 rounded-xl flex items-center justify-center text-3xl mb-3 transition-all duration-300"
        style={{ boxShadow: glow !== "transparent" ? `0 0 20px ${glow}, inset 0 0 10px ${glow}` : "none" }}
      >
        {icon}
      </div>
      <span className="text-zinc-400 font-bold text-sm uppercase tracking-wider">{label}</span>
    </div>
  );
}

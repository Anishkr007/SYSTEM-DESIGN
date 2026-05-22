"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShardingViz() {
  const [strategy, setStrategy] = useState<"hash" | "range" | "geo">("hash");
  const [queries, setQueries] = useState<{ id: number; key: string; shard: number; type: string }[]>([]);
  const [queryCount, setQueryCount] = useState(0);

  const shards = {
    hash: [
      { id: 0, label: "Shard 0", filter: "hash(key) % 3 = 0" },
      { id: 1, label: "Shard 1", filter: "hash(key) % 3 = 1" },
      { id: 2, label: "Shard 2", filter: "hash(key) % 3 = 2" },
    ],
    range: [
      { id: 0, label: "Shard A-H", filter: "Names A through H" },
      { id: 1, label: "Shard I-P", filter: "Names I through P" },
      { id: 2, label: "Shard Q-Z", filter: "Names Q through Z" },
    ],
    geo: [
      { id: 0, label: "US East", filter: "Location: North America" },
      { id: 1, label: "EU Central", filter: "Location: Europe" },
      { id: 2, label: "AP South", filter: "Location: Asia Pacific" },
    ]
  };

  const currentShards = shards[strategy];

  const handleQuery = () => {
    let shardIdx = 0;
    let key = "";
    
    if (strategy === "hash") {
      const val = Math.floor(Math.random() * 1000);
      key = `user_${val}`;
      shardIdx = val % 3;
    } else if (strategy === "range") {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const char = letters[Math.floor(Math.random() * letters.length)];
      key = `name_${char}`;
      if (char <= 'H') shardIdx = 0;
      else if (char <= 'P') shardIdx = 1;
      else shardIdx = 2;
    } else {
      const locs = ["US", "UK", "IN"];
      const loc = locs[Math.floor(Math.random() * locs.length)];
      key = `req_${loc}`;
      shardIdx = locs.indexOf(loc);
    }

    const newQuery = { id: queryCount, key, shard: shardIdx, type: strategy };
    setQueryCount(prev => prev + 1);
    setQueries(prev => [...prev, newQuery]);

    setTimeout(() => {
      setQueries(prev => prev.filter(q => q.id !== newQuery.id));
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-6 bg-black/20 rounded-2xl border border-white/10">
      
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12 w-full p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
          <button 
            onClick={() => setStrategy("hash")} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${strategy === "hash" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Hash Sharding
          </button>
          <button 
            onClick={() => setStrategy("range")} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${strategy === "range" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Range Sharding
          </button>
          <button 
            onClick={() => setStrategy("geo")} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${strategy === "geo" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Geo Sharding
          </button>
        </div>
        
        <div className="w-px h-8 bg-white/20 mx-2"></div>
        
        <button 
          onClick={handleQuery} 
          className="px-6 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
        >
          <span>📨</span> Send Write Request
        </button>
      </div>

      <div className="relative w-full h-[400px] flex flex-col items-center justify-between">
        
        {/* Router / Application */}
        <div className="relative z-10 w-48 h-16 bg-white/5 border border-primary/50 rounded-xl flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)] mb-8">
          <span className="font-bold text-white text-sm">Application / Router</span>
          
          <div className="absolute -bottom-4 bg-primary/20 text-xs px-2 py-0.5 rounded border border-primary/30 text-primary-200">
            {strategy === "hash" ? "Hash Function" : strategy === "range" ? "Lookup Table" : "Geo Router"}
          </div>
        </div>

        {/* Connections and Queries (Absolute) */}
        <div className="absolute top-16 bottom-24 left-0 right-0 pointer-events-none">
          <AnimatePresence>
            {queries.map(q => {
              const shardWidth = 100 / 3;
              const targetX = `${(q.shard * shardWidth) + (shardWidth / 2)}%`;

              return (
                <motion.div
                  key={q.id}
                  initial={{ top: "0%", left: "50%", opacity: 0 }}
                  animate={{ top: "100%", left: targetX, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeIn" }}
                  className="absolute z-20 flex flex-col items-center"
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  <div className="bg-secondary/20 border border-secondary text-secondary-300 text-xs px-2 py-1 rounded shadow-[0_0_10px_rgba(6,182,212,0.5)] mb-1 font-mono">
                    {q.key}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,1)]" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Shards Row */}
        <div className="w-full flex justify-around relative z-10 mt-auto">
          <AnimatePresence mode="popLayout">
            {currentShards.map((shard) => (
              <motion.div
                key={shard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-[200px]"
              >
                <div className="w-full h-32 rounded-xl bg-black/40 border border-zinc-700 flex flex-col items-center justify-center relative backdrop-blur-md overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                  
                  {/* Cylinder stack representing DB */}
                  <div className="flex flex-col gap-0.5 mb-3 group-hover:scale-110 transition-transform">
                    <div className="w-12 h-4 rounded-[50%] bg-zinc-600 border border-zinc-500 relative z-30"></div>
                    <div className="w-12 h-4 rounded-[50%] bg-zinc-700 border-x border-b border-zinc-500 relative z-20 -mt-2"></div>
                    <div className="w-12 h-4 rounded-[50%] bg-zinc-800 border-x border-b border-zinc-500 relative z-10 -mt-2"></div>
                  </div>
                  
                  <div className="font-bold text-white text-sm relative z-10">{shard.label}</div>
                  
                  {/* Highlight border on receiving query */}
                  <AnimatePresence>
                    {queries.some(q => q.shard === shard.id) && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 border-2 border-secondary rounded-xl shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] z-20"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-3 text-xs font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                  {shard.filter}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

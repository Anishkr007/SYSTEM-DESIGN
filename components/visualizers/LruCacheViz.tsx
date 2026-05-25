"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Block {
  key: string;
  val: string;
  age: number; // for LRU visualization
}

export default function LruCacheViz() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const MAX_SIZE = 5;
  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [evicted, setEvicted] = useState<string | null>(null);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setEvicted(null);

    const existingIdx = blocks.findIndex(b => b.key === inputKey);

    if (existingIdx !== -1) {
      // Hit! Move to front (LRU)
      const hitBlock = blocks[existingIdx];
      const newBlocks = [...blocks];
      newBlocks.splice(existingIdx, 1);
      setBlocks([{ ...hitBlock, age: Date.now() }, ...newBlocks]);
    } else {
      // Miss! Insert at front
      const newBlock = { key: inputKey, val: inputValue || `val-${inputKey}`, age: Date.now() };
      
      if (blocks.length >= MAX_SIZE) {
        // Evict last (LRU)
        const toEvict = blocks[blocks.length - 1];
        setEvicted(toEvict.key);
        setBlocks([newBlock, ...blocks.slice(0, MAX_SIZE - 1)]);
      } else {
        setBlocks([newBlock, ...blocks]);
      }
    }
    setInputKey("");
    setInputValue("");
  };

  return (
    <div className="w-full bg-black/30 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
      <h3 className="text-xl font-bold text-white mb-2">LRU Cache Eviction</h3>
      <p className="text-zinc-400 text-sm mb-8">Capacity: {MAX_SIZE} items. Most recently used items stay on the left.</p>

      <form onSubmit={handleAccess} className="flex gap-2 w-full max-w-lg mb-12">
        <input 
          type="text" 
          value={inputKey} 
          onChange={e => setInputKey(e.target.value)} 
          placeholder="Key (e.g. user_1)" 
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm"
        />
        <button type="submit" className="bg-primary hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">
          Access / Insert
        </button>
      </form>

      <div className="relative w-full max-w-3xl h-32 bg-white/5 border border-dashed border-white/20 rounded-xl flex items-center p-4 gap-4 overflow-hidden">
        {blocks.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold tracking-widest uppercase">Cache Empty</div>}
        
        <AnimatePresence>
          {blocks.map((block, i) => (
            <motion.div
              layout
              key={block.key}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.8, backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`w-24 h-24 shrink-0 rounded-xl border-2 flex flex-col items-center justify-center shadow-lg ${i === 0 ? "bg-primary/20 border-primary" : "bg-white/10 border-white/20"}`}
            >
              <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Key</span>
              <span className="text-white font-mono font-bold">{block.key}</span>
              <div className="w-full h-px bg-white/10 my-2" />
              <span className="text-xs font-mono text-primary-300">{block.val}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-8 mt-4 w-full text-center">
        <AnimatePresence>
          {evicted && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm font-bold"
            >
              Evicted key: <span className="font-mono">{evicted}</span> (Least Recently Used)
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

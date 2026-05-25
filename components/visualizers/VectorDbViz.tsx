"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Plus, Network, Cpu, Activity, Layers, Terminal } from 'lucide-react';

// --- Types ---
type VectorDoc = {
  id: string;
  text: string;
  x: number;
  y: number;
  embedding: number[];
  color: string;
};

type SearchResult = {
  id: string;
  distance: number;
  similarity: number;
};

// --- Constants ---
const COLORS = ['#00f0ff', '#ff003c', '#a100ff', '#00ff66', '#fcee0a'];
const DIMENSIONS = 384;

// --- Subcomponents ---
const StatCard = ({ icon, title, value, color }: { icon: React.ReactElement, title: string, value: string | number, color: string }) => (
  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
    <div className={`p-3 bg-slate-950/80 rounded-lg border border-slate-800 ${color} shadow-[0_0_10px_currentColor] opacity-90`}>
      {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <div>
      <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">{title}</div>
      <div className="text-2xl font-bold text-slate-100 font-mono mt-0.5 tracking-tight">{value}</div>
    </div>
  </div>
);

export default function VectorDbViz() {
  // --- State ---
  const [vectors, setVectors] = useState<VectorDoc[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [hnswMode, setHnswMode] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<{ text: string, x: number, y: number } | null>(null);
  
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [embeddingAnimStr, setEmbeddingAnimStr] = useState("");
  
  const [logs, setLogs] = useState<string[]>([]);
  const [latency, setLatency] = useState(0);

  const logEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const addLog = (msg: string) => {
    const time = new Date().toISOString().split('T')[1].slice(0, -1);
    setLogs(prev => [...prev.slice(-19), `[${time}] ${msg}`]);
  };

  const generateMockEmbedding = () => {
    return Array.from({ length: 5 }, () => Number((Math.random() * 2 - 1).toFixed(3)));
  };

  // --- Effects ---
  useEffect(() => {
    addLog("Initializing Vector DB Engine...");
    addLog(`Configured for ${DIMENSIONS} dimensions.`);
    
    const initialDocs = [
      "User authentication service",
      "Stripe payment gateway",
      "WebSocket chat server",
      "React UI components",
      "Postgres DB schema"
    ];

    const loadInitial = async () => {
      for (let i = 0; i < initialDocs.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        const newVec: VectorDoc = {
          id: Math.random().toString(36).substring(2, 9),
          text: initialDocs[i],
          x: 15 + Math.random() * 70, // Keep away from strict edges
          y: 15 + Math.random() * 70,
          embedding: generateMockEmbedding(),
          color: COLORS[i % COLORS.length]
        };
        setVectors(prev => [...prev, newVec]);
        addLog(`Indexed: "${initialDocs[i]}"`);
      }
      addLog("System Ready. Waiting for queries.");
    };
    
    loadInitial();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!isEmbedding) return;
    const interval = setInterval(() => {
      const vals = Array.from({ length: 7 }, () => (Math.random() * 2 - 1).toFixed(3));
      setEmbeddingAnimStr(`[${vals.join(', ')}, ...]`);
    }, 50);
    return () => clearInterval(interval);
  }, [isEmbedding]);

  // --- Handlers ---
  const handleAddDocument = () => {
    if (!inputText.trim() || isEmbedding) return;
    const text = inputText;
    setInputText("");
    setIsEmbedding(true);
    addLog(`Creating embedding for: "${text}"...`);

    setTimeout(() => {
      const newVec: VectorDoc = {
        id: Math.random().toString(36).substring(2, 9),
        text,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        embedding: generateMockEmbedding(),
        color: COLORS[vectors.length % COLORS.length]
      };
      setVectors(prev => [...prev, newVec]);
      addLog(`Success. ID: ${newVec.id} | Vec: [${newVec.embedding[0]}, ${newVec.embedding[1]}, ...]`);
      setIsEmbedding(false);
    }, 1200);
  };

  const handleSearch = () => {
    if (!searchText.trim() || vectors.length === 0 || isSearching) return;
    setIsSearching(true);
    addLog(`Encoding query: "${searchText}"...`);
    setSearchResults([]);
    setSearchQuery(null);

    setTimeout(() => {
      const qx = 10 + Math.random() * 80;
      const qy = 10 + Math.random() * 80;
      
      setSearchQuery({ text: searchText, x: qx, y: qy });
      addLog("Executing nearest neighbor search...");
      
      const searchDelay = hnswMode ? 200 : 800; // HNSW is faster visually

      setTimeout(() => {
        // Calculate distances
        const results = vectors.map(v => {
          const dist = Math.sqrt(Math.pow(v.x - qx, 2) + Math.pow(v.y - qy, 2));
          // Fake cosine similarity based on 2D euclidean for visual consistency
          const sim = Math.max(0, 1 - (dist / 120)); 
          return { id: v.id, distance: dist, similarity: sim };
        }).sort((a, b) => b.similarity - a.similarity).slice(0, 3);

        const fakeLatencyVal = hnswMode 
          ? (1.2 + Math.random() * 2) 
          : (25.4 + vectors.length * 1.5 + Math.random() * 8);
        
        setLatency(Number(fakeLatencyVal.toFixed(2)));
        setSearchResults(results);
        addLog(`Found ${results.length} results in ${fakeLatencyVal.toFixed(2)}ms.`);
        addLog(`Top match sim: ${(results[0]?.similarity || 0).toFixed(4)}`);
        setIsSearching(false);
      }, searchDelay);

    }, 400); // Encoding delay
  };

  // --- Computed ---
  const hnswLinks = useMemo(() => {
    if (!hnswMode || vectors.length < 2) return [];
    const links: { source: VectorDoc; target: VectorDoc }[] = [];
    
    // Connect each node to its 2 closest neighbors
    for (let i = 0; i < vectors.length; i++) {
      const v1 = vectors[i];
      const dists = vectors.map((v2, j) => {
        if (i === j) return { index: j, dist: Infinity };
        return { index: j, dist: Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)) };
      }).sort((a, b) => a.dist - b.dist);
      
      links.push({ source: v1, target: vectors[dists[0].index] });
      if (vectors.length > 2) {
        links.push({ source: v1, target: vectors[dists[1].index] });
      }
    }

    // Deduplicate
    const uniqueLinks: typeof links = [];
    const seen = new Set();
    links.forEach(l => {
      const key = l.source.id < l.target.id 
        ? `${l.source.id}-${l.target.id}` 
        : `${l.target.id}-${l.source.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLinks.push(l);
      }
    });
    return uniqueLinks;
  }, [vectors, hnswMode]);


  return (
    <div className="min-h-screen bg-[#030305] text-slate-200 font-sans p-4 md:p-8 relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            Vector Database Visualizer
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Interactive visualization of high-dimensional vector embeddings, ANN search, and HNSW graph indexing.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Database />} title="Total Vectors" value={vectors.length} color="text-cyan-400" />
          <StatCard icon={<Layers />} title="Dimensions" value={DIMENSIONS} color="text-purple-400" />
          <StatCard icon={<Activity />} title="Search Latency" value={`${latency}ms`} color="text-pink-400" />
          <StatCard icon={<Cpu />} title="Index Type" value={hnswMode ? "HNSW" : "FLAT"} color="text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            
            {/* Add Document */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-4 text-cyan-400 drop-shadow-[0_0_5px_currentColor]">
                <Plus className="w-5 h-5" />
                <h3 className="font-semibold tracking-wide">Add Document</h3>
              </div>
              <div className="flex gap-2 relative z-10">
                <input 
                  type="text" 
                  className="flex-1 bg-black/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-slate-200 placeholder-slate-600 transition-colors"
                  placeholder="E.g., Machine learning..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddDocument()}
                />
                <button 
                  onClick={handleAddDocument}
                  disabled={isEmbedding || !inputText.trim()}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isEmbedding ? <Activity className="w-4 h-4 animate-spin" /> : "Embed"}
                </button>
              </div>
              
              <AnimatePresence>
                {isEmbedding && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }} 
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-black/60 rounded border border-cyan-900/50 font-mono text-[10px] sm:text-xs text-cyan-300 break-all shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]">
                      <span className="text-slate-500 mr-2">Encoder:</span>
                      {embeddingAnimStr}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Semantic Search */}
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-4 text-pink-400 drop-shadow-[0_0_5px_currentColor]">
                <Search className="w-5 h-5" />
                <h3 className="font-semibold tracking-wide">Semantic Search</h3>
              </div>
              <div className="flex gap-2 mb-5 relative z-10">
                <input 
                  type="text" 
                  className="flex-1 bg-black/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 text-slate-200 placeholder-slate-600 transition-colors"
                  placeholder="Search space..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchText.trim() || vectors.length === 0}
                  className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/50 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isSearching ? <Activity className="w-4 h-4 animate-spin" /> : "Query"}
                </button>
              </div>

              {/* HNSW Toggle */}
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-slate-800/80 relative z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Network className={`w-4 h-4 ${hnswMode ? 'text-purple-400' : 'text-slate-500'} transition-colors`} />
                  HNSW Indexing
                </div>
                <button 
                  onClick={() => setHnswMode(!hnswMode)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${hnswMode ? 'bg-purple-500/40 border-purple-400' : 'bg-slate-800 border-slate-600'} border shadow-inner`}
                >
                  <motion.div 
                    className={`w-4 h-4 rounded-full absolute top-[3px] ${hnswMode ? 'bg-white shadow-[0_0_8px_#a100ff]' : 'bg-slate-400'}`}
                    animate={{ left: hnswMode ? '26px' : '4px' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Terminal Logs */}
            <div className="flex-1 min-h-[250px] p-5 rounded-xl bg-[#050508]/90 border border-slate-800/80 flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">System Logs</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] text-emerald-400/90 pr-2 custom-scrollbar">
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={i}
                    className="leading-relaxed"
                  >
                    {log}
                  </motion.div>
                ))}
                <div ref={logEndRef} className="h-1" />
              </div>
            </div>

          </div>

          {/* Right Panel: Vector Space */}
          <div className="lg:col-span-2 bg-[#0a0a0f]/80 border border-slate-800/80 rounded-xl relative overflow-hidden backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] min-h-[500px] flex items-center justify-center">
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 overflow-visible">
              <defs>
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="neon-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* HNSW Links */}
              <AnimatePresence>
                {hnswMode && hnswLinks.map((link, i) => (
                  <motion.line 
                    key={`link-${link.source.id}-${link.target.id}`}
                    x1={link.source.x} y1={link.source.y}
                    x2={link.target.x} y2={link.target.y}
                    stroke="rgba(161, 0, 255, 0.25)"
                    strokeWidth="0.15"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.01 }}
                  />
                ))}
              </AnimatePresence>

              {/* Vector Nodes */}
              {vectors.map(v => {
                const matchIndex = searchResults.findIndex(r => r.id === v.id);
                const isMatched = matchIndex !== -1;
                const isTopMatch = matchIndex === 0;

                return (
                  <g key={v.id}>
                    <motion.circle 
                      cx={v.x} cy={v.y} 
                      r={isMatched ? (isTopMatch ? 1.5 : 1.2) : 0.6}
                      fill={isMatched ? "#ff003c" : v.color}
                      filter="url(#neon-glow)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: isSearching && !isMatched ? 0.3 : 1 }}
                      transition={{ type: "spring" }}
                    />
                    
                    {/* Background pill for text visibility */}
                    <rect 
                      x={v.x + 1.2} 
                      y={v.y - 1} 
                      width={Math.min(v.text.length * 0.8 + 1, 16)} 
                      height="2.5" 
                      fill="rgba(0,0,0,0.6)" 
                      rx="0.5"
                    />
                    <text 
                      x={v.x + 1.8} 
                      y={v.y + 0.6} 
                      fill={isMatched ? "#ff003c" : "rgba(255,255,255,0.7)"} 
                      fontSize="1.4" 
                      className="font-sans font-medium tracking-wide"
                      opacity={isSearching && !isMatched ? 0.3 : 1}
                    >
                      {v.text.length > 18 ? v.text.substring(0, 18) + '...' : v.text}
                    </text>

                    {/* Similarity Score Badge */}
                    {isMatched && (
                      <motion.g initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                         <rect x={v.x + 1.2} y={v.y + 2} width="9" height="2" fill="#ff003c" fillOpacity="0.1" rx="0.5" stroke="#ff003c" strokeWidth="0.1"/>
                         <text x={v.x + 1.8} y={v.y + 3.4} fill="#ff003c" fontSize="1.1" className="font-mono">
                           Sim: {searchResults[matchIndex].similarity.toFixed(3)}
                         </text>
                      </motion.g>
                    )}
                  </g>
                )
              })}

              {/* Search Query Pin & Rays */}
              {searchQuery && (
                <g>
                  {/* Pulse Ring */}
                  <motion.circle 
                    cx={searchQuery.x} cy={searchQuery.y} 
                    r="8"
                    fill="none"
                    stroke="#fcee0a"
                    strokeWidth="0.2"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  />
                  
                  {/* Query Node */}
                  <motion.circle 
                    cx={searchQuery.x} cy={searchQuery.y} 
                    r="1.2"
                    fill="#fcee0a"
                    filter="url(#neon-glow-strong)"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                  
                  <rect x={searchQuery.x + 2} y={searchQuery.y - 1.5} width={searchQuery.text.length * 0.9 + 4} height="3" fill="rgba(0,0,0,0.8)" rx="0.5" stroke="#fcee0a" strokeWidth="0.2"/>
                  <text x={searchQuery.x + 3} y={searchQuery.y + 0.5} fill="#fcee0a" fontSize="1.6" className="font-mono font-bold" filter="url(#neon-glow)">
                    [Q]: {searchQuery.text}
                  </text>
                  
                  {/* Distance Lines */}
                  {searchResults.map((res, i) => {
                    const target = vectors.find(v => v.id === res.id);
                    if (!target) return null;
                    return (
                      <motion.line 
                        key={`search-ray-${i}`}
                        x1={searchQuery.x} y1={searchQuery.y}
                        x2={target.x} y2={target.y}
                        stroke="#ff003c"
                        strokeWidth={i === 0 ? "0.4" : "0.2"}
                        strokeDasharray="1 1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                      />
                    )
                  })}
                </g>
              )}
            </svg>
            
            {/* Coordinates hint */}
            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-600 tracking-widest">
              X/Y LATENT SPACE PROJECTION
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollbar hide CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}} />
    </div>
  );
}

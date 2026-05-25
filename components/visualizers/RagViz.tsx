"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, FileText, Cpu, Search, Layers, 
  Terminal, FileCode2, Play, Sparkles, 
  Network, Server, BrainCircuit
} from 'lucide-react';

// --- CONFIGURATION & LAYOUT ---
const width = 1000;
const height = 550;

const nodes = {
  docs: { x: 100, y: 100, label: "Knowledge Base", icon: FileText },
  chunker: { x: 280, y: 100, label: "Document Chunker", icon: Layers },
  embedIn: { x: 460, y: 100, label: "Embedding Model", icon: Cpu },
  vdb: { x: 750, y: 220, label: "Vector Database", icon: Database },
  query: { x: 100, y: 340, label: "User Prompt", icon: Terminal },
  embedOut: { x: 280, y: 340, label: "Embedding Model", icon: Cpu },
  rerank: { x: 500, y: 340, label: "Cross-Encoder", icon: Network },
  llm: { x: 750, y: 460, label: "LLM Generator", icon: BrainCircuit },
  answer: { x: 920, y: 460, label: "Generated Answer", icon: Sparkles },
};

const PIPELINES = {
  docs_chunker: { x: [100, 280], y: [100, 100] },
  chunker_embedIn: { x: [280, 460], y: [100, 100] },
  embedIn_vdb: { x: [460, 750, 750], y: [100, 100, 220] },
  query_embedOut: { x: [100, 280], y: [340, 340] },
  embedOut_vdb: { x: [280, 370, 370, 750, 750], y: [340, 340, 240, 240, 220] },
  vdb_rerank: { x: [750, 750, 500, 500], y: [220, 280, 280, 340] },
  rerank_llm: { x: [500, 500, 750], y: [340, 460, 460] },
  vdb_llm: { x: [750, 750], y: [220, 460] },
  llm_answer: { x: [750, 920], y: [460, 460] }
};

const generatePath = (p: {x: number[], y: number[]}) => {
  let d = `M ${p.x[0]} ${p.y[0]}`;
  for (let i = 1; i < p.x.length; i++) {
    d += ` L ${p.x[i]} ${p.y[i]}`;
  }
  return d;
}

const SVG_PATHS = Object.fromEntries(
  Object.entries(PIPELINES).map(([k, v]) => [k, generatePath(v)])
);

const computeTimes = (xs: number[], ys: number[]) => {
  let totalDist = 0;
  const dists = [0];
  for(let i=1; i<xs.length; i++) {
    const d = Math.abs(xs[i]-xs[i-1]) + Math.abs(ys[i]-ys[i-1]);
    totalDist += d;
    dists.push(totalDist);
  }
  if (totalDist === 0) return xs.map(() => 0);
  return dists.map(d => d / totalDist);
}

// --- COMPONENTS ---
const PacketComponent = ({ pathId, color }: {pathId: string, color: string}) => {
  const p = PIPELINES[pathId as keyof typeof PIPELINES];
  const times = computeTimes(p.x, p.y);
  
  return (
    <motion.circle
      r={5}
      cx={0} cy={0}
      fill={color}
      initial={{ x: p.x[0], y: p.y[0], opacity: 0 }}
      animate={{ x: p.x, y: p.y, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1, ease: "linear", times }}
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    />
  );
}

export default function RagViz() {
  const [isIngesting, setIsIngesting] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [hybridSearch, setHybridSearch] = useState(false);
  const [reranking, setReranking] = useState(true);
  
  const [queryText, setQueryText] = useState("");
  const [answer, setAnswer] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  
  const [logs, setLogs] = useState<string[]>(["[System] Initialized RAG visualizer.", "[System] Ready for operations."]);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [packets, setPackets] = useState<{id: string, pathId: string, color: string}[]>([]);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    if (mounted.current) {
      setLogs(prev => [...prev, `[Config] Hybrid Search is now ${hybridSearch ? 'ON' : 'OFF'}.`]);
    }
  }, [hybridSearch]);

  useEffect(() => {
    if (mounted.current) {
      setLogs(prev => [...prev, `[Config] Cross-Encoder Re-ranking is now ${reranking ? 'ON' : 'OFF'}.`]);
    }
    mounted.current = true;
  }, [reranking]);

  const triggerAnim = (pathId: keyof typeof PIPELINES, color: string, count = 3, delayMs = 200) => {
    return new Promise<void>(resolve => {
      let completed = 0;
      for(let i=0; i<count; i++) {
         setTimeout(() => {
            const id = Math.random().toString();
            setPackets(prev => [...prev, { id, pathId, color }]);
            setTimeout(() => {
              setPackets(prev => prev.filter(p => p.id !== id));
              completed++;
              if (completed === count) resolve();
            }, 1000);
         }, i * delayMs);
      }
    });
  }

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleIngest = async () => {
    if (isIngesting || isQuerying) return;
    setIsIngesting(true);
    setLogs(prev => [...prev, "---"]);
    setLogs(prev => [...prev, "[Ingest] Reading knowledge base documents..."]);
    
    setActiveNodes(new Set(['docs']));
    await triggerAnim('docs_chunker', "#10b981");
    
    setActiveNodes(prev => new Set(prev).add('chunker'));
    setLogs(prev => [...prev, "[Ingest] Chunking documents into semantic segments (size: 512, overlap: 50)."]);
    await triggerAnim('chunker_embedIn', "#10b981");
    
    setActiveNodes(prev => new Set(prev).add('embedIn'));
    setLogs(prev => [...prev, "[Ingest] Converting chunks to dense vectors (768d)."]);
    await triggerAnim('embedIn_vdb', "#10b981");
    
    setActiveNodes(prev => new Set(prev).add('vdb'));
    setLogs(prev => [...prev, "[Ingest] Stored embeddings in Vector DB (HNSW Index).", "[Ingest] Ingestion complete."]);
    
    await sleep(1000);
    setActiveNodes(new Set());
    setIsIngesting(false);
  };

  const handleQuery = async () => {
    if (isQuerying || isIngesting || !queryText) return;
    setIsQuerying(true);
    setFinalPrompt("");
    setAnswer("");
    setLogs(prev => [...prev, "---"]);
    setLogs(prev => [...prev, `[Query] Received user prompt: "${queryText}"`]);
    
    setActiveNodes(new Set(['query']));
    await triggerAnim('query_embedOut', "#d946ef");
    
    setActiveNodes(prev => new Set(prev).add('embedOut'));
    setLogs(prev => [...prev, "[Query] Generated embedding vector for user query."]);
    await triggerAnim('embedOut_vdb', "#d946ef");
    
    setActiveNodes(prev => new Set(prev).add('vdb'));
    let context = [];
    if (hybridSearch) {
      setLogs(prev => [...prev, "[Search] Executing Hybrid Search (Alpha=0.5: Vector + BM25)."]);
      context = [
         "[Chunk 1] RAG effectively minimizes LLM hallucinations.", 
         "[Chunk 2] BM25 lexical matching improves exact keyword retrieval."
      ];
    } else {
      setLogs(prev => [...prev, "[Search] Executing Vector Search (Cosine Similarity)."]);
      context = [
         "[Chunk 1] RAG effectively minimizes LLM hallucinations.", 
         "[Chunk 2] Vector databases index data for fast approximate nearest neighbors."
      ];
    }
    
    if (reranking) {
      await triggerAnim('vdb_rerank', "#eab308");
      setActiveNodes(prev => new Set(prev).add('rerank'));
      setLogs(prev => [...prev, "[Re-rank] Cross-encoder processing top-k results..."]);
      context = [context[1], context[0]]; // Shuffled logically to show reranking action
      await triggerAnim('rerank_llm', "#eab308");
    } else {
      await triggerAnim('vdb_llm', "#d946ef");
    }
    
    setActiveNodes(prev => new Set(prev).add('llm'));
    
    const formattedPrompt = `[SYSTEM INSTRUCTION]\nAnswer the user's question using ONLY the provided context.\n\n[RETRIEVED CONTEXT]\n${context.join('\n')}\n\n[USER QUERY]\n${queryText}`;
    setFinalPrompt(formattedPrompt);
    setLogs(prev => [...prev, "[LLM] Constructing prompt and generating response..."]);
    
    await triggerAnim('llm_answer', "#06b6d4");
    setActiveNodes(prev => new Set(prev).add('answer'));
    
    setAnswer("Based on the retrieved context, RAG minimizes LLM hallucinations and relies on specific search strategies like vector search or hybrid retrieval to find relevant information.");
    setLogs(prev => [...prev, "[System] Generation successful."]);
    
    await sleep(2000);
    setActiveNodes(new Set());
    setIsQuerying(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-[#0B0F19] text-slate-200 p-6 md:p-8 font-sans selection:bg-fuchsia-500/30">
      
      {/* Header */}
      <header className="mb-8">
         <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center gap-3">
            <Database className="w-8 h-8 text-emerald-400" />
            Interactive RAG Architecture
         </h1>
         <p className="text-slate-400 mt-2">Observe real-time data flows in a Retrieval-Augmented Generation pipeline.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Ingest Control */}
           <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <h2 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
                 <FileText className="w-5 h-5" /> Data Ingestion
              </h2>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                 Simulate processing a batch of PDF documents. Watch as they are chunked, embedded, and stored into the Vector DB.
              </p>
              <button 
                onClick={handleIngest} 
                disabled={isIngesting || isQuerying}
                className="relative w-full py-3 px-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 rounded-xl border border-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-emerald-400/10 blur-xl group-hover:bg-emerald-400/20 transition-all" />
                <Database className="w-4 h-4 z-10" />
                <span className="font-medium z-10 text-sm">{isIngesting ? "Processing Documents..." : "Upload Knowledge Base"}</span>
              </button>
           </div>

           {/* Query Control */}
           <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500" />
              <h2 className="text-lg font-semibold mb-4 text-fuchsia-400 flex items-center gap-2">
                 <Search className="w-5 h-5" /> Query Pipeline
              </h2>
              
              <div className="space-y-5">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     value={queryText}
                     onChange={e => setQueryText(e.target.value)}
                     className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 text-slate-200 shadow-inner transition-all placeholder:text-slate-600"
                     placeholder="What is RAG?"
                     onKeyDown={(e) => { if (e.key === 'Enter') handleQuery() }}
                   />
                 </div>
                 
                 <div className="space-y-3">
                   <div 
                     className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F19]/50 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors group"
                     onClick={() => setHybridSearch(!hybridSearch)}
                   >
                     <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-fuchsia-300 transition-colors">Hybrid Search</div>
                        <div className="text-xs text-slate-500">Vector + BM25 keyword</div>
                     </div>
                     <div className={`w-10 h-5 rounded-full p-1 transition-colors flex items-center ${hybridSearch ? 'bg-fuchsia-500' : 'bg-slate-700'}`}>
                       <motion.div className="w-3 h-3 bg-white rounded-full shadow-md" animate={{ x: hybridSearch ? 20 : 0 }} />
                     </div>
                   </div>
                   
                   <div 
                     className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F19]/50 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors group"
                     onClick={() => setReranking(!reranking)}
                   >
                     <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-yellow-300 transition-colors">Re-ranking</div>
                        <div className="text-xs text-slate-500">Cross-encoder rerank</div>
                     </div>
                     <div className={`w-10 h-5 rounded-full p-1 transition-colors flex items-center ${reranking ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                       <motion.div className="w-3 h-3 bg-white rounded-full shadow-md" animate={{ x: reranking ? 20 : 0 }} />
                     </div>
                   </div>
                 </div>

                 <button 
                   onClick={handleQuery} 
                   disabled={isIngesting || isQuerying || !queryText}
                   className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 hover:from-fuchsia-600/40 hover:to-purple-600/40 text-fuchsia-300 rounded-xl border border-fuchsia-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-fuchsia-400/10 blur-xl group-hover:bg-fuchsia-400/20 transition-all" />
                    <Play className="w-4 h-4 z-10" />
                    <span className="font-medium z-10 text-sm">{isQuerying ? "Processing..." : "Execute Query"}</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Center & Right Panel: Diagram & Status */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           
           {/* Visual Diagram */}
           <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto shadow-2xl backdrop-blur-sm">
              <div className="relative min-w-[800px] max-w-[1000px] w-full aspect-[1000/550] mx-auto">
                 {/* SVG Lines */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${width} ${height}`}>
                    {Object.entries(SVG_PATHS).map(([key, d]) => {
                       const isRerankPath = key.includes('rerank');
                       const opacity = (!reranking && isRerankPath) ? 0.15 : 0.6;
                       const dash = (!reranking && isRerankPath) ? "2 6" : "4 4";
                       
                       return (
                         <path 
                           key={key} 
                           d={d} 
                           fill="none" 
                           stroke="#334155" 
                           strokeWidth="2"
                           strokeDasharray={dash}
                           opacity={opacity}
                           vectorEffect="non-scaling-stroke"
                           className="transition-all duration-500"
                         />
                       )
                    })}

                    {/* Packets overlay */}
                    <AnimatePresence>
                       {packets.map(p => (
                          <PacketComponent key={p.id} pathId={p.pathId} color={p.color} />
                       ))}
                    </AnimatePresence>
                 </svg>

                 {/* HTML Nodes overlay */}
                 <div className="absolute inset-0 pointer-events-none">
                    {Object.entries(nodes).map(([key, node]) => {
                       const isActive = activeNodes.has(key);
                       const isIngestNode = ['docs', 'chunker', 'embedIn'].includes(key);
                       const isQueryNode = ['query', 'embedOut', 'llm', 'answer'].includes(key);
                       const isShared = key === 'vdb';
                       const isRerank = key === 'rerank';
                       const isDisabled = isRerank && !reranking;

                       let borderColor = "border-slate-700";
                       let glowColor = "rgba(100,116,139,0.1)";
                       let iconColor = "text-slate-500";

                       if (isActive) {
                          if (isIngestNode) {
                             borderColor = "border-emerald-500";
                             glowColor = "rgba(16,185,129,0.4)";
                             iconColor = "text-emerald-400";
                          } else if (isQueryNode) {
                             borderColor = "border-fuchsia-500";
                             glowColor = "rgba(217,70,239,0.4)";
                             iconColor = "text-fuchsia-400";
                          } else if (isRerank) {
                             borderColor = "border-yellow-500";
                             glowColor = "rgba(234,179,8,0.4)";
                             iconColor = "text-yellow-400";
                          } else if (isShared) {
                             borderColor = isIngesting ? "border-emerald-500" : "border-fuchsia-500";
                             glowColor = isIngesting ? "rgba(16,185,129,0.4)" : "rgba(217,70,239,0.4)";
                             iconColor = isIngesting ? "text-emerald-400" : "text-fuchsia-400";
                          }
                       } else if (!isDisabled) {
                          iconColor = "text-slate-400";
                       }

                       return (
                         <motion.div
                           key={key}
                           className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 bg-[#0B0F19] border-2 ${borderColor} rounded-xl transition-all duration-300 z-10 ${isDisabled ? 'opacity-30 grayscale' : 'opacity-100 shadow-xl'}`}
                           style={{ 
                              left: `${(node.x / width) * 100}%`, 
                              top: `${(node.y / height) * 100}%`,
                              width: '120px',
                              height: '80px',
                              boxShadow: isActive ? `0 0 30px ${glowColor}, inset 0 0 15px ${glowColor}` : '0 4px 10px rgba(0,0,0,0.5)'
                           }}
                           animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                         >
                            <node.icon className={`w-6 h-6 mb-2 transition-colors ${iconColor}`} />
                            <span className="text-[11px] font-semibold text-slate-300 text-center px-2 leading-tight uppercase tracking-wider">{node.label}</span>
                         </motion.div>
                       )
                    })}
                 </div>
              </div>
           </div>

           {/* Metrics & Output Split */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Event Logs */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl h-64 flex flex-col backdrop-blur-sm">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                   <Server className="w-4 h-4 text-slate-400" /> Event Stream
                 </h3>
                 <div className="flex-1 bg-[#0B0F19] border border-slate-800/80 rounded-lg p-3 overflow-y-auto font-mono text-[11px] space-y-2 shadow-inner">
                    {logs.map((log, i) => (
                       <div key={i} className="flex gap-2">
                          <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                          <span className={`break-words ${log.includes("Error") ? "text-red-400" : log.includes("successful") || log.includes("[Ingest]") ? "text-emerald-400" : log.includes("[Search]") || log.includes("[Query]") ? "text-fuchsia-400" : log.includes("[Re-rank]") ? "text-yellow-400" : "text-slate-400"}`}>
                             {log}
                          </span>
                       </div>
                    ))}
                    <div ref={logsEndRef} />
                 </div>
              </div>

              {/* LLM Prompt Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl h-64 flex flex-col backdrop-blur-sm">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                   <FileCode2 className="w-4 h-4 text-slate-400" /> Constructed LLM Payload
                 </h3>
                 <div className="flex-1 bg-[#0B0F19] border border-slate-800/80 rounded-lg p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-slate-300 shadow-inner custom-scrollbar relative">
                    {!finalPrompt && !isQuerying && (
                       <span className="text-slate-600 italic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">Waiting for query execution...</span>
                    )}
                    {finalPrompt && (
                       <div className="text-cyan-200/90 leading-relaxed">
                          {finalPrompt}
                       </div>
                    )}
                    
                    {answer && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                         className="mt-6 pt-4 border-t border-slate-800"
                       >
                          <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-wide text-[10px]">
                             <Sparkles className="w-3 h-3" /> Output Payload
                          </div>
                          <div className="text-emerald-300 text-sm leading-relaxed">{answer}</div>
                       </motion.div>
                    )}
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";

type NodeData = { id: string, type: string, x: number, y: number, label: string, crashed?: boolean };
type ConnectionData = { source: string, target: string };

const TEMPLATES = {
  empty: { nodes: [], connections: [] },
  urlShortener: {
    nodes: [
      { id: "1", type: "client", x: 100, y: 200, label: "Client" },
      { id: "2", type: "cdn", x: 300, y: 100, label: "CDN" },
      { id: "3", type: "lb", x: 300, y: 300, label: "Load Balancer" },
      { id: "4", type: "server", x: 500, y: 300, label: "API Server" },
      { id: "5", type: "cache", x: 700, y: 200, label: "Redis" },
      { id: "6", type: "db", x: 700, y: 400, label: "Cassandra" },
      { id: "7", type: "queue", x: 500, y: 500, label: "Kafka" }
    ],
    connections: [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "3", target: "4" },
      { source: "4", target: "5" },
      { source: "4", target: "6" },
      { source: "4", target: "7" }
    ]
  },
  kafkaPipeline: {
    nodes: [
      { id: "1", type: "server", x: 100, y: 250, label: "Producer" },
      { id: "2", type: "queue", x: 350, y: 250, label: "Kafka Broker" },
      { id: "3", type: "server", x: 600, y: 150, label: "Consumer A" },
      { id: "4", type: "server", x: 600, y: 350, label: "Consumer B" },
      { id: "5", type: "db", x: 850, y: 150, label: "Data Warehouse" }
    ],
    connections: [
      { source: "1", target: "2" },
      { source: "2", target: "3" },
      { source: "2", target: "4" },
      { source: "3", target: "5" }
    ]
  }
};

export default function ArchPlayground() {
  const [nodes, setNodes] = useState<NodeData[]>(TEMPLATES.urlShortener.nodes);
  const [connections, setConnections] = useState<ConnectionData[]>(TEMPLATES.urlShortener.connections);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{singlePointsOfFailure: string[], securityVulnerabilities: string[], concreteOptimization: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("urlShortener");

  const nodeTypes = {
    client: { icon: "💻", color: "border-blue-500", bg: "bg-blue-500/10" },
    lb: { icon: "⚖️", color: "border-purple-500", bg: "bg-purple-500/10" },
    server: { icon: "🖥️", color: "border-green-500", bg: "bg-green-500/10" },
    db: { icon: "🗄️", color: "border-yellow-500", bg: "bg-yellow-500/10" },
    cache: { icon: "⚡", color: "border-red-500", bg: "bg-red-500/10" },
    queue: { icon: "📨", color: "border-cyan-500", bg: "bg-cyan-500/10" },
    cdn: { icon: "🌍", color: "border-indigo-500", bg: "bg-indigo-500/10" },
    auth: { icon: "🔐", color: "border-emerald-500", bg: "bg-emerald-500/10" },
    notification: { icon: "🔔", color: "border-amber-500", bg: "bg-amber-500/10" },
    analytics: { icon: "📈", color: "border-pink-500", bg: "bg-pink-500/10" },
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }, id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y } : n));
  };

  const simulateCrash = (id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, crashed: true } : n));
    setTimeout(() => {
      setNodes(currentNodes => currentNodes.map(n => n.id === id ? { ...n, crashed: false } : n));
    }, 3000);
  };

  const analyzeArchitecture = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/ai/analyze-arch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph: { nodes, connections } })
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadTemplate = (key: string) => {
    setActiveTemplate(key);
    setNodes([]); // Clear first to trigger re-animation
    setConnections([]);
    setAiAnalysis(null);
    setIsSimulating(false);
    
    setTimeout(() => {
      const t = TEMPLATES[key as keyof typeof TEMPLATES];
      setNodes(t.nodes);
      setConnections(t.connections);
    }, 100);
  };

  return (
    <div className="w-full flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-black/20">
      
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 border-b border-white/10 gap-4">
        
        <div className="flex items-center gap-4">
          <select 
            value={activeTemplate} 
            onChange={e => loadTemplate(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="empty">Custom (Empty)</option>
            <option value="urlShortener">URL Shortener</option>
            <option value="kafkaPipeline">Kafka Pipeline</option>
          </select>

          <div className="h-6 w-px bg-white/10" />

          <button 
            onClick={analyzeArchitecture}
            disabled={isAnalyzing || nodes.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm transition-all bg-primary/20 text-primary-300 border border-primary/50 hover:bg-primary/30 disabled:opacity-50"
          >
            <Sparkles size={14} />
            {isAnalyzing ? "Analyzing..." : "AI Analyze"}
          </button>
        </div>
        
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-6 py-1.5 rounded-lg font-medium transition-all text-sm ${
            isSimulating ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-primary text-white shadow-neon-primary"
          }`}
        >
          {isSimulating ? "Stop Simulation" : "Simulate Traffic"}
        </button>
      </div>

      {/* Palette (simplified for visual representation) */}
      <div className="flex gap-2 p-2 bg-black/40 border-b border-white/5 overflow-x-auto custom-scrollbar">
        {Object.entries(nodeTypes).map(([type, config]) => (
          <div key={type} className={`px-2 py-1 rounded bg-black/40 border ${config.color} text-[10px] font-medium cursor-not-allowed opacity-50 flex items-center gap-1`} title="Drag & drop coming soon">
            <span>{config.icon}</span>
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[600px] overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-background to-background">
        
        {/* Grid */}
        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* AI Analysis Overlay */}
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 w-80 bg-[#0a0a0f]/90 backdrop-blur-md border border-primary/50 rounded-xl p-4 z-30 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-primary font-bold border-b border-white/10 pb-2">
                <Sparkles size={16} /> Architecture Analysis
              </div>
              <div className="text-xs">
                <span className="text-red-400 font-bold flex gap-1 items-center"><AlertTriangle size={12}/> SPOF:</span>
                <ul className="list-disc pl-4 text-zinc-300 mt-1">{aiAnalysis.singlePointsOfFailure.map((s:string,i:number) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="text-xs">
                <span className="text-amber-400 font-bold flex gap-1 items-center"><ShieldAlert size={12}/> Security:</span>
                <ul className="list-disc pl-4 text-zinc-300 mt-1">{aiAnalysis.securityVulnerabilities.map((s:string,i:number) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-2 rounded text-xs text-primary-200 mt-2">
                <strong>Optimization:</strong> {aiAnalysis.concreteOptimization}
              </div>
              <button onClick={() => setAiAnalysis(null)} className="text-xs text-zinc-500 hover:text-white text-center mt-2">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connections */}
        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-10">
          {connections.map((conn, i) => {
            const sourceNode = nodes.find(n => n.id === conn.source);
            const targetNode = nodes.find(n => n.id === conn.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const sx = sourceNode.x + 40;
            const sy = sourceNode.y + 40;
            const tx = targetNode.x + 40;
            const ty = targetNode.y + 40;

            const isTargetCrashed = targetNode.crashed;
            const isSourceCrashed = sourceNode.crashed;
            const isFailing = isTargetCrashed || isSourceCrashed;

            return (
              <g key={`conn-${i}`}>
                <path 
                  d={`M ${sx} ${sy} L ${tx} ${ty}`} 
                  stroke={isFailing ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.2)"} 
                  strokeWidth="2" 
                  fill="none" 
                  strokeDasharray={isFailing ? "5,5" : "none"}
                />
                
                {isSimulating && !isFailing && (
                  <>
                    <circle r="4" fill="#06b6d4"><animateMotion dur="2s" repeatCount="indefinite" path={`M ${sx} ${sy} L ${tx} ${ty}`} /></circle>
                    <circle r="3" fill="#6366f1"><animateMotion dur="2s" repeatCount="indefinite" begin="1s" path={`M ${tx} ${ty} L ${sx} ${sy}`} /></circle>
                  </>
                )}
                {isSimulating && isTargetCrashed && !isSourceCrashed && (
                  // Fallback arrow animation (bounces back)
                  <circle r="4" fill="#f59e0b">
                    <animateMotion dur="2s" repeatCount="indefinite" path={`M ${sx} ${sy} L ${(sx+tx)/2} ${(sy+ty)/2} L ${sx} ${sy}`} />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, i) => {
          const config = nodeTypes[node.type as keyof typeof nodeTypes] || nodeTypes.server;
          
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: node.x, y: node.y }}
              transition={{ delay: i * 0.1, type: "spring" }}
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => handleDragEnd(e, info, node.id)}
              className={`absolute w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-20 group ${
                node.crashed 
                  ? "bg-red-500/20 border-red-500 text-red-500" 
                  : `${config.color} ${config.bg} backdrop-blur-md`
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {node.crashed ? <XCircle size={32} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)]" /> : <span className="text-3xl pointer-events-none">{config.icon}</span>}
              
              <div className="absolute -bottom-8 bg-black/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap border border-white/10 pointer-events-none">
                {node.label}
              </div>

              {/* Hover Actions */}
              <div className="absolute -top-10 hidden group-hover:flex gap-1 bg-black/80 p-1 rounded-lg border border-white/10 backdrop-blur-md">
                <button 
                  onClick={() => simulateCrash(node.id)}
                  disabled={node.crashed}
                  className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded hover:bg-red-500/40 disabled:opacity-50"
                >
                  Crash
                </button>
              </div>
            </motion.div>
          );
        })}
        
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Monitor, Server, Activity, 
  Clock, RefreshCw, Layers, Zap
} from 'lucide-react';

// --- Types ---
type PacketData = {
  id?: string;
  from: string;
  to: string;
  label: string;
  color: string;
  duration: number; // seconds
};

type NodeConfig = {
  x: number;
  y: number;
  label: string;
  icon: React.ElementType;
  color: string;
  border: string;
  shadow: string;
};

// --- Configurations ---
const nodesConfig: Record<string, NodeConfig> = {
  clientA: { x: 15, y: 30, label: 'Client A', icon: Monitor, color: 'text-cyan-400', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/20' },
  server: { x: 50, y: 30, label: 'Collab Server (OT)', icon: Server, color: 'text-emerald-400', border: 'border-emerald-500/50', shadow: 'shadow-emerald-500/20' },
  clientB: { x: 85, y: 30, label: 'Client B', icon: Monitor, color: 'text-fuchsia-400', border: 'border-fuchsia-500/50', shadow: 'shadow-fuchsia-500/20' },
  db: { x: 50, y: 75, label: 'Document DB', icon: Database, color: 'text-indigo-400', border: 'border-indigo-500/50', shadow: 'shadow-indigo-500/20' }
};

const colorMap = {
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-950/10' },
  emerald: { border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-950/10' },
  fuchsia: { border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', bg: 'bg-fuchsia-950/10' },
};

// --- Subcomponents ---
const Particles = () => {
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
          animate={{
            y: [0, -150],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const StatePanel = ({ title, doc, logs, color }: { title: string, doc: string, logs: string[], color: 'cyan' | 'emerald' | 'fuchsia' }) => {
  const theme = colorMap[color];
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const renderDoc = (docString: string) => {
    return docString.split('').map((char, i) => {
      let colorClass = "text-gray-200";
      if (char === '!') colorClass = "text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
      if (char === '?') colorClass = "text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]";
      return <span key={i} className={colorClass}>{char}</span>;
    });
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col h-72 ${theme.border} ${theme.bg}`}>
      <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme.text}`}>
        {title}
      </h3>
      
      <div className="mb-4">
        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Local State</div>
        <div className="font-mono text-lg bg-gray-950/80 px-3 py-2 rounded border border-gray-800 text-white flex items-center h-12 shadow-inner">
          {renderDoc(doc)}
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-5 bg-gray-500 ml-1 rounded-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Operation Log</div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-1.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-mono text-gray-300 bg-gray-950/60 px-2 py-1.5 rounded border border-gray-800/60 shadow-sm"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function DesignGoogleDocsViz() {
  const [latency, setLatency] = useState(1500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const [docState, setDocState] = useState({
    clientA: 'Hello',
    clientB: 'Hello',
    server: 'Hello',
    db: 'Hello'
  });

  const [logs, setLogs] = useState({
    server: [] as string[],
    clientA: [] as string[],
    clientB: [] as string[]
  });

  const [activePackets, setActivePackets] = useState<PacketData[]>([]);

  const reset = () => {
    setIsPlaying(false);
    setStep(0);
    setDocState({ clientA: 'Hello', clientB: 'Hello', server: 'Hello', db: 'Hello' });
    setLogs({ server: [], clientA: [], clientB: [] });
    setActivePackets([]);
  };

  const addPackets = (packets: Omit<PacketData, 'id'>[]) => {
    const newPackets = packets.map(p => ({ ...p, id: Math.random().toString() }));
    setActivePackets(prev => [...prev, ...newPackets]);
    
    newPackets.forEach(p => {
      setTimeout(() => {
        setActivePackets(prev => prev.filter(x => x.id !== p.id));
      }, p.duration * 1000);
    });
  };

  useEffect(() => {
    if (!isPlaying) return;
    let timer: NodeJS.Timeout;

    if (step === 1) {
      setDocState(s => ({ ...s, clientA: 'Hello!', clientB: 'Hello?' }));
      setLogs(s => ({ 
        ...s, 
        clientA: [...s.clientA, 'Local Insert: "!" at index 5'], 
        clientB: [...s.clientB, 'Local Insert: "?" at index 5'] 
      }));
      
      addPackets([
        { from: 'clientA', to: 'server', label: 'Op A: Ins(5, "!")', color: 'bg-cyan-500', duration: latency / 1000 },
        { from: 'clientB', to: 'server', label: 'Op B: Ins(5, "?")', color: 'bg-fuchsia-500', duration: (latency + 500) / 1000 }
      ]);
      
      timer = setTimeout(() => setStep(2), latency);
    } else if (step === 2) {
      setDocState(s => ({ ...s, server: 'Hello!' }));
      setLogs(s => ({ ...s, server: [...s.server, 'Recv Op A from Client A', 'Apply Op A -> "Hello!"'] }));
      
      addPackets([
        { from: 'server', to: 'clientA', label: 'ACK Op A', color: 'bg-emerald-500', duration: latency / 1000 },
        { from: 'server', to: 'clientB', label: 'Broadcast Op A', color: 'bg-cyan-500', duration: latency / 1000 },
        { from: 'server', to: 'db', label: 'Commit Rev 1', color: 'bg-indigo-500', duration: latency / 1000 }
      ]);
      
      timer = setTimeout(() => setStep(3), 500); // Wait for the delayed Op B to arrive
    } else if (step === 3) {
      setDocState(s => ({ ...s, server: 'Hello!?', db: 'Hello!' }));
      setLogs(s => ({ 
        ...s, 
        server: [
          ...s.server, 
          'Recv Op B from Client B', 
          'Conflict: Op A already applied',
          'Transform Op B against Op A',
          'Shift B idx: 5 -> 6',
          'Apply Op B(Tx) -> "Hello!?"'
        ] 
      }));
      
      addPackets([
        { from: 'server', to: 'clientB', label: 'ACK Op B', color: 'bg-emerald-500', duration: latency / 1000 },
        { from: 'server', to: 'clientA', label: 'Broadcast Op B(Tx)', color: 'bg-fuchsia-500', duration: latency / 1000 },
        { from: 'server', to: 'db', label: 'Commit Rev 2', color: 'bg-indigo-500', duration: latency / 1000 }
      ]);

      timer = setTimeout(() => setStep(4), latency);
    } else if (step === 4) {
      setDocState(s => ({ ...s, clientA: 'Hello!?', clientB: 'Hello!?' }));
      setLogs(s => ({
        ...s,
        clientA: [...s.clientA, 'Recv Broadcast Op B(Tx)', 'Apply Op B(Tx) -> "Hello!?"'],
        clientB: [
          ...s.clientB, 
          'Recv Broadcast Op A', 
          'Transform pending Op B vs Op A', 
          'Apply Op A -> "Hello!"', 
          'Re-apply pending Op B(Tx) -> "Hello!?"'
        ]
      }));
      
      timer = setTimeout(() => setStep(5), latency);
    } else if (step === 5) {
      setDocState(s => ({ ...s, db: 'Hello!?' }));
      setLogs(s => ({ ...s, server: [...s.server, 'All clients synchronized.'] }));
      setIsPlaying(false);
    }

    return () => clearTimeout(timer);
  }, [step, isPlaying, latency]);

  const renderDocText = (docString: string) => {
    return docString.split('').map((char, i) => {
      let colorClass = "text-gray-200";
      if (char === '!') colorClass = "text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
      if (char === '?') colorClass = "text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]";
      return <span key={i} className={colorClass}>{char}</span>;
    });
  };

  return (
    <div className="relative w-full min-h-[850px] bg-gray-950 p-6 rounded-2xl font-sans text-gray-200 overflow-hidden shadow-2xl border border-gray-800">
      <Particles />
      
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col h-full">
        
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-900/80 p-5 rounded-xl border border-gray-800 backdrop-blur-md mb-6 shadow-lg">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              Google Docs Architecture & OT Engine
            </h2>
            <p className="text-sm text-gray-400 mt-1">Simulate Operational Transformation resolving concurrent edits in real-time.</p>
          </div>
          
          <div className="flex items-center gap-6 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                <Clock className="w-3 h-3" /> Network Latency
              </label>
              <input 
                type="range" 
                min="500" 
                max="3000" 
                step="100"
                value={latency}
                onChange={e => setLatency(Number(e.target.value))}
                disabled={isPlaying}
                className={`w-32 accent-indigo-500 ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <div className="text-[10px] text-right text-gray-500 font-mono">{latency}ms</div>
            </div>

            <button
              onClick={() => {
                reset();
                // We use setTimeout to ensure reset state is committed before triggering next play
                setTimeout(() => {
                  setIsPlaying(true);
                  setStep(1);
                }, 50);
              }}
              disabled={isPlaying}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all text-sm ${
                isPlaying 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
              }`}
            >
              <Activity className="w-4 h-4" />
              {isPlaying ? 'Simulating...' : 'Start Simulation'}
            </button>
            
            <button
              onClick={reset}
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Explanation Banner */}
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 mb-6 backdrop-blur-sm flex gap-4 items-start shadow-inner">
          <div className="p-2 bg-blue-900/50 rounded-lg shrink-0 mt-0.5">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-1">How Operational Transformation (OT) Works</h4>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              When two clients edit concurrently, the server acts as the source of truth. Both clients immediately update their local UI (Optimistic Update).
              The Server processes <span className="text-cyan-400 font-mono font-bold bg-cyan-950/50 px-1 rounded">Op A (!)</span> first. When it receives <span className="text-fuchsia-400 font-mono font-bold bg-fuchsia-950/50 px-1 rounded">Op B (?)</span>, 
              it detects a conflict and <strong>transforms</strong> Op B's insertion index from 5 to 6 to account for Op A. 
              The consistent final state becomes <span className="font-mono text-white bg-gray-800 px-1 rounded">Hello!?</span>
            </p>
          </div>
        </div>

        {/* Network Graph Area */}
        <div className="relative w-full h-[320px] bg-gray-900/40 border border-gray-800/80 rounded-xl overflow-hidden mb-6 shadow-inner">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1="15%" y1="30%" x2="50%" y2="30%" className="stroke-gray-700/60" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="85%" y1="30%" x2="50%" y2="30%" className="stroke-gray-700/60" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="50%" y1="30%" x2="50%" y2="75%" className="stroke-gray-700/60" strokeWidth="2" strokeDasharray="6 6" />
            
            {/* Animated Pulses on Lines */}
            <motion.line x1="15%" y1="30%" x2="50%" y2="30%" className="stroke-cyan-500/20" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
            <motion.line x1="85%" y1="30%" x2="50%" y2="30%" className="stroke-fuchsia-500/20" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
          </svg>

          {/* Active Packets */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {activePackets.map(p => {
                const fromNode = nodesConfig[p.from];
                const toNode = nodesConfig[p.to];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ left: `${fromNode.x}%`, top: `${fromNode.y}%`, opacity: 0, scale: 0.5 }}
                    animate={{ left: `${toNode.x}%`, top: `${toNode.y}%`, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: p.duration, ease: "linear" }}
                    className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center z-20 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                    <div className={`w-full h-full rounded-full ${p.color} shadow-[0_0_10px_currentColor]`} />
                    <div className="absolute top-5 text-[10px] font-bold whitespace-nowrap text-white bg-gray-950/90 border border-gray-800 px-2 py-0.5 rounded shadow-lg">
                      {p.label}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Architecture Nodes */}
          {Object.entries(nodesConfig).map(([key, node]) => (
            <div
              key={key}
              className={`absolute -ml-16 -mt-10 w-32 h-20 flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/90 border backdrop-blur-md z-10 ${node.border} shadow-[0_0_20px_rgba(0,0,0,0.6)] ${node.shadow}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <node.icon className={`w-6 h-6 ${node.color} mb-1.5`} />
              <span className="text-[11px] text-gray-200 font-semibold text-center leading-tight">{node.label}</span>
            </div>
          ))}
        </div>

        {/* State Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatePanel title="Client A (Browser)" doc={docState.clientA} logs={logs.clientA} color="cyan" />
          <StatePanel title="Collab Server (OT Engine)" doc={docState.server} logs={logs.server} color="emerald" />
          <StatePanel title="Client B (Browser)" doc={docState.clientB} logs={logs.clientB} color="fuchsia" />
        </div>

        {/* DB State */}
        <div className="mt-4 flex justify-center">
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-md flex flex-col items-center w-64 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <h3 className="text-xs font-bold mb-2 text-indigo-400 flex items-center gap-2 uppercase tracking-wide">
              <Database className="w-4 h-4" /> Persistent DB State
            </h3>
            <div className="font-mono text-lg bg-gray-950/80 px-4 py-2 rounded border border-gray-800 text-white flex items-center shadow-inner">
              {renderDocText(docState.db)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

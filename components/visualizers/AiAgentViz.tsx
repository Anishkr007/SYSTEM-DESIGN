"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Icons ---
const BrainIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z" />
    <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08 2.5 2.5 0 0 1-4.91.05L12 20V4.5Z" />
  </svg>
);

const MemoryIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CalcIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <line x1="16" x2="16" y1="10" y2="10" />
    <line x1="12" x2="12" y1="10" y2="10" />
    <line x1="12" x2="12" y1="14" y2="18" />
    <line x1="8" x2="8" y1="10" y2="10" />
    <line x1="8" x2="8" y1="14" y2="18" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);


// --- Types & Data ---
type AgentState = "idle" | "thinking" | "acting" | "observing" | "finished";
type ActiveNode = "llm" | "memory" | "tool_search" | "tool_email" | "tool_calc" | null;

interface LogEntry {
  id: string;
  type: AgentState;
  message: string;
  timestamp: number;
}

const SIMULATIONS = {
  weatherEmail: [
    { state: "thinking", node: "llm", log: "I need to find the current weather in Tokyo and then send an email to John. First, I'll use the Search tool." },
    { state: "acting", node: "tool_search", log: 'Action: Search("weather in Tokyo")' },
    { state: "observing", node: "tool_search", log: "Observation: The weather in Tokyo is 72°F and sunny." },
    { state: "thinking", node: "llm", log: "Now that I have the weather, I need to email it to John. I will use the Email tool." },
    { state: "acting", node: "tool_email", log: 'Action: Email("John", "Weather in Tokyo", "It is 72°F and sunny in Tokyo.")' },
    { state: "observing", node: "tool_email", log: "Observation: Email sent successfully." },
    { state: "finished", node: "llm", log: "Final Answer: I have emailed John the current weather in Tokyo (72°F and sunny)." }
  ],
  calcSave: [
    { state: "thinking", node: "llm", log: "I need to calculate 25 * 40 and then save the result to long-term memory." },
    { state: "acting", node: "tool_calc", log: 'Action: Calculator("25 * 40")' },
    { state: "observing", node: "tool_calc", log: "Observation: The result is 1000." },
    { state: "thinking", node: "llm", log: "I have the result (1000). Now I need to save it to memory." },
    { state: "acting", node: "memory", log: 'Action: SaveToMemory("Calculation result: 1000")' },
    { state: "observing", node: "memory", log: "Observation: Successfully saved to long-term memory." },
    { state: "finished", node: "llm", log: "Final Answer: I have calculated 25 * 40 as 1000 and saved it." }
  ]
};

const NODES = {
  llm: { x: 50, y: 50, label: "LLM Core", icon: <BrainIcon /> },
  memory: { x: 50, y: 15, label: "Context Memory", icon: <MemoryIcon /> },
  tool_search: { x: 20, y: 80, label: "Search API", icon: <SearchIcon /> },
  tool_calc: { x: 50, y: 85, label: "Calculator", icon: <CalcIcon /> },
  tool_email: { x: 80, y: 80, label: "Email Client", icon: <EmailIcon /> }
};

// --- Helper Functions ---
const getLogStyle = (type: AgentState) => {
  switch (type) {
    case 'thinking': return 'bg-yellow-900/20 border-yellow-700/50 text-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.1)]';
    case 'acting': return 'bg-pink-900/20 border-pink-700/50 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.1)]';
    case 'observing': return 'bg-green-900/20 border-green-700/50 text-green-200 shadow-[0_0_10px_rgba(34,197,94,0.1)]';
    case 'finished': return 'bg-cyan-900/20 border-cyan-700/50 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.1)]';
    default: return 'bg-gray-800 border-gray-700 text-gray-300';
  }
};

const getStrokeColor = (state: AgentState) => {
  switch (state) {
    case 'acting': return 'rgba(236, 72, 153, 0.8)';
    case 'observing': return 'rgba(34, 197, 94, 0.8)';
    case 'thinking': return 'rgba(234, 179, 8, 0.8)';
    case 'finished': return 'rgba(34, 211, 238, 0.8)';
    default: return 'rgba(156, 163, 175, 0.3)';
  }
};

// --- Subcomponents ---
const BackgroundParticles = () => {
  const [mounted, setMounted] = useState(false);
  const [particles] = useState(() => Array.from({ length: 40 }).map(() => ({
    x: Math.random() * 100,
    startY: -10 - Math.random() * 100,
    endY: 110,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10
  })));

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bg-cyan-400 rounded-full"
          style={{ width: p.size, height: p.size, left: `${p.x}vw` }}
          initial={{ y: `${p.startY}vh`, opacity: 0 }}
          animate={{ y: `${p.endY}vh`, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
};

const DataPacket = ({ start, end, state }: { start: any; end: any; state: AgentState }) => {
  const isReverse = state === 'observing';
  const from = isReverse ? end : start;
  const to = isReverse ? start : end;

  return (
    <>
      <motion.circle
        r="12"
        fill={getStrokeColor(state)}
        initial={{ cx: `${from.x}%`, cy: `${from.y}%`, opacity: 0.5 }}
        animate={{ cx: `${to.x}%`, cy: `${to.y}%`, opacity: 0.5 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        r="5"
        fill="#ffffff"
        initial={{ cx: `${from.x}%`, cy: `${from.y}%` }}
        animate={{ cx: `${to.x}%`, cy: `${to.y}%` }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
};

const ConnectionLine = ({ start, end, active, state }: { start: any; end: any; active: boolean; state: AgentState }) => {
  if (!active) {
    return (
      <line
        x1={`${start.x}%`} y1={`${start.y}%`}
        x2={`${end.x}%`} y2={`${end.y}%`}
        stroke="rgba(75, 85, 99, 0.2)"
        strokeWidth="2"
      />
    );
  }

  return (
    <g>
      <line
        x1={`${start.x}%`} y1={`${start.y}%`}
        x2={`${end.x}%`} y2={`${end.y}%`}
        stroke="rgba(75, 85, 99, 0.3)"
        strokeWidth="2"
      />
      <motion.line
        x1={`${start.x}%`} y1={`${start.y}%`}
        x2={`${end.x}%`} y2={`${end.y}%`}
        stroke={getStrokeColor(state)}
        strokeWidth="3"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
      />
      {['acting', 'observing'].includes(state) && (
        <DataPacket start={start} end={end} state={state} />
      )}
    </g>
  );
};

const NodeElement = ({ node, id, active, state }: { node: any; id: string; active: boolean; state: AgentState }) => {
  const isLLM = id === 'llm';
  const size = isLLM ? 100 : 70;

  let glowColor = 'rgba(56, 189, 248, 0)';
  let borderColor = 'border-gray-700';
  let bgColor = 'bg-gray-900';

  if (active) {
    if (state === 'thinking') { glowColor = 'rgba(234, 179, 8, 0.5)'; borderColor = 'border-yellow-500'; bgColor = 'bg-yellow-900/60'; }
    else if (state === 'acting') { glowColor = 'rgba(236, 72, 153, 0.5)'; borderColor = 'border-pink-500'; bgColor = 'bg-pink-900/60'; }
    else if (state === 'observing') { glowColor = 'rgba(34, 197, 94, 0.5)'; borderColor = 'border-green-500'; bgColor = 'bg-green-900/60'; }
    else if (state === 'finished') { glowColor = 'rgba(34, 211, 238, 0.5)'; borderColor = 'border-cyan-400'; bgColor = 'bg-cyan-900/60'; }
  } else if (isLLM && state !== 'idle') {
    borderColor = 'border-cyan-800';
    bgColor = 'bg-cyan-950/40';
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <motion.div
        animate={{
          boxShadow: active ? `0 0 30px 5px ${glowColor}` : '0 0 0px 0px rgba(0,0,0,0)',
          scale: active ? 1.1 : 1
        }}
        transition={{ duration: 0.3 }}
        className={`border-2 ${borderColor} ${bgColor} flex items-center justify-center backdrop-blur-md z-10 overflow-hidden relative text-white`}
        style={{ width: size, height: size, borderRadius: isLLM ? '50%' : '1rem' }}
      >
        <span className="z-10">{node.icon}</span>
        {active && isLLM && state === 'thinking' && (
          <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-full" />
        )}
      </motion.div>
      <div className="mt-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-900/80 px-2 py-1 rounded border border-gray-800 shadow-md">
        {node.label}
      </div>
    </div>
  );
};

const AgentNetwork = ({ activeNode, agentState }: { activeNode: ActiveNode; agentState: AgentState }) => {
  return (
    <div className="relative w-full h-full min-h-[500px]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <ConnectionLine start={NODES.llm} end={NODES.memory} active={activeNode === 'memory'} state={agentState} />
        <ConnectionLine start={NODES.llm} end={NODES.tool_search} active={activeNode === 'tool_search'} state={agentState} />
        <ConnectionLine start={NODES.llm} end={NODES.tool_calc} active={activeNode === 'tool_calc'} state={agentState} />
        <ConnectionLine start={NODES.llm} end={NODES.tool_email} active={activeNode === 'tool_email'} state={agentState} />
      </svg>
      {Object.entries(NODES).map(([key, node]) => {
        const isActive = activeNode === key || (key === 'llm' && ['thinking', 'finished'].includes(agentState));
        return (
          <NodeElement key={key} node={node} id={key} active={isActive} state={agentState} />
        );
      })}
    </div>
  );
};

const CycleStep = ({ active, label, color, border }: { active: boolean; label: string; color: string; border: string }) => {
  return (
    <div className={`relative flex items-center justify-center p-3 rounded-lg border transition-all duration-500 ${active ? `${border} bg-gray-800/80 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.05)]` : 'border-gray-800/50 bg-gray-900/30 opacity-60'}`}>
      <span className={`font-bold tracking-wider text-sm uppercase ${active ? color : 'text-gray-500'}`}>
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="activeCycle"
          className={`absolute inset-0 border-2 rounded-lg ${border}`}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

// --- Main Component ---
export default function AiAgentViz() {
  const [activeSim, setActiveSim] = useState<"weatherEmail" | "calcSave" | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const currentStep = activeSim && stepIndex >= 0 && stepIndex < SIMULATIONS[activeSim].length
    ? SIMULATIONS[activeSim][stepIndex]
    : null;

  const agentState = currentStep ? currentStep.state as AgentState : "idle";
  const activeNode = currentStep ? currentStep.node as ActiveNode : null;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && activeSim && stepIndex < SIMULATIONS[activeSim].length) {
      timer = setTimeout(() => {
        const nextStep = stepIndex + 1;
        if (nextStep < SIMULATIONS[activeSim].length) {
          setStepIndex(nextStep);
          setLogs(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            type: SIMULATIONS[activeSim][nextStep].state as AgentState,
            message: SIMULATIONS[activeSim][nextStep].log,
            timestamp: Date.now()
          }]);
        } else {
          setIsPlaying(false);
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeSim, stepIndex]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleStart = (sim: "weatherEmail" | "calcSave") => {
    setActiveSim(sim);
    setStepIndex(0);
    setLogs([{
      id: Math.random().toString(36).substring(7),
      type: SIMULATIONS[sim][0].state as AgentState,
      message: SIMULATIONS[sim][0].log,
      timestamp: Date.now()
    }]);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setStepIndex(-1);
    setActiveSim(null);
    setLogs([]);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-950 text-cyan-50 font-sans p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-950 to-gray-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <BackgroundParticles />

      <div className="relative z-10 flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 tracking-wider uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          ReAct Agent Core
        </h1>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => handleStart("weatherEmail")}
            className="px-6 py-2.5 rounded-full border border-cyan-500/50 bg-cyan-900/30 hover:bg-cyan-800/50 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.15)] font-semibold text-sm tracking-wide"
          >
            TASK: Weather Query -> Email
          </button>
          <button
            onClick={() => handleStart("calcSave")}
            className="px-6 py-2.5 rounded-full border border-purple-500/50 bg-purple-900/30 hover:bg-purple-800/50 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.15)] font-semibold text-sm tracking-wide"
          >
            TASK: Calculate -> Store Memory
          </button>
          <button
            onClick={handleStop}
            className="px-6 py-2.5 rounded-full border border-red-500/50 bg-red-900/30 hover:bg-red-800/50 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.15)] font-semibold text-sm tracking-wide"
          >
            Reset System
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-8 relative z-10 w-full max-w-7xl mx-auto min-h-[600px]">
        {/* Left: Architecture Visualizer */}
        <div className="flex-1 relative border border-gray-800 rounded-3xl bg-gray-900/40 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-2xl">
          <AgentNetwork activeNode={activeNode} agentState={agentState} />
        </div>

        {/* Right: ReAct Cycle & Scratchpad */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          {/* ReAct Loop Component */}
          <div className="border border-gray-800 rounded-2xl bg-gray-900/50 backdrop-blur-md p-6 flex flex-col shadow-xl">
            <h2 className="text-cyan-500 font-bold mb-4 tracking-widest text-xs uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              ReAct Reasoning Cycle
            </h2>
            <div className="flex-1 flex flex-col justify-between relative">
              <CycleStep active={agentState === 'thinking'} label="Thought" color="text-yellow-400" border="border-yellow-500/50" />
              <div className="flex justify-center my-1"><span className="text-gray-600 text-xs">↓</span></div>
              <CycleStep active={agentState === 'acting'} label="Action" color="text-pink-400" border="border-pink-500/50" />
              <div className="flex justify-center my-1"><span className="text-gray-600 text-xs">↓</span></div>
              <CycleStep active={agentState === 'observing'} label="Observation" color="text-green-400" border="border-green-500/50" />
              <div className="flex justify-center my-1"><span className="text-gray-600 text-xs">↓</span></div>
              <CycleStep active={agentState === 'finished'} label="Final Answer" color="text-cyan-400" border="border-cyan-500/50" />
            </div>
          </div>

          {/* Agent Scratchpad */}
          <div className="border border-gray-800 rounded-2xl bg-gray-900/60 backdrop-blur-md p-6 flex flex-col flex-1 overflow-hidden shadow-xl min-h-[300px]">
            <h2 className="text-cyan-500 font-bold mb-4 tracking-widest text-xs uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Agent Scratchpad
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              <AnimatePresence>
                {logs.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 text-sm italic mt-4 text-center">
                    Awaiting instructions...
                  </motion.div>
                )}
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={`p-3.5 rounded-xl border text-sm font-mono leading-relaxed backdrop-blur-sm ${getLogStyle(log.type)}`}
                  >
                    <span className="opacity-40 mr-2 text-xs">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                    {log.message}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

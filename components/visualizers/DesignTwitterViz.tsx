"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Config ---

type NodeType =
  | "client"
  | "lb"
  | "writeApi"
  | "readApi"
  | "tweetDb"
  | "userDb"
  | "timelineCache"
  | "searchIndex";

interface NodePosition {
  x: number;
  y: number;
  label: string;
  type: NodeType;
  color: string;
  icon: string;
}

interface PacketData {
  id: string;
  flowId: string;
  flowType: keyof typeof FLOWS;
  stepIndex: number;
  source: NodeType;
  target: NodeType;
  color: string;
  label?: string;
}

interface Metrics {
  cacheHits: number;
  cacheMisses: number;
  totalTweets: number;
  celebTweets: number;
  timelineLoads: number;
  writeLatency: number;
  readLatency: number;
}

const CANVAS_WIDTH = 850;
const CANVAS_HEIGHT = 600;

const NODES: Record<NodeType, NodePosition> = {
  client: { x: 80, y: 300, label: "Clients", type: "client", color: "#3b82f6", icon: "📱" },
  lb: { x: 220, y: 300, label: "Load Balancer", type: "lb", color: "#8b5cf6", icon: "⚖️" },
  writeApi: { x: 420, y: 150, label: "Write API", type: "writeApi", color: "#ec4899", icon: "✍️" },
  readApi: { x: 420, y: 450, label: "Read API", type: "readApi", color: "#10b981", icon: "📖" },
  searchIndex: { x: 720, y: 80, label: "Search Index", type: "searchIndex", color: "#f59e0b", icon: "🔍" },
  tweetDb: { x: 720, y: 220, label: "Tweet DB", type: "tweetDb", color: "#ef4444", icon: "🗄️" },
  userDb: { x: 720, y: 360, label: "User DB", type: "userDb", color: "#f97316", icon: "👥" },
  timelineCache: { x: 720, y: 520, label: "Timeline Cache", type: "timelineCache", color: "#06b6d4", icon: "⚡" },
};

const EDGES = [
  { source: "client", target: "lb" },
  { source: "lb", target: "writeApi" },
  { source: "lb", target: "readApi" },
  { source: "writeApi", target: "tweetDb" },
  { source: "writeApi", target: "userDb" },
  { source: "writeApi", target: "timelineCache" },
  { source: "writeApi", target: "searchIndex" },
  { source: "readApi", target: "timelineCache" },
  { source: "readApi", target: "tweetDb" },
  { source: "readApi", target: "userDb" },
];

const FLOWS = {
  normalTweet: [
    [{ source: "client", target: "lb", color: "#3b82f6", label: "POST /tweet" }],
    [{ source: "lb", target: "writeApi", color: "#8b5cf6" }],
    [
      { source: "writeApi", target: "tweetDb", color: "#ec4899", label: "Save Tweet" },
      { source: "writeApi", target: "userDb", color: "#f97316", label: "Get Followers" },
    ],
    [
      { source: "tweetDb", target: "writeApi", color: "#22c55e" },
      { source: "userDb", target: "writeApi", color: "#22c55e" },
    ],
    [
      { source: "writeApi", target: "timelineCache", color: "#06b6d4", label: "Fan-out (Push to 500)" },
      { source: "writeApi", target: "searchIndex", color: "#f59e0b", label: "Index" },
    ],
    [
      { source: "timelineCache", target: "writeApi", color: "#22c55e" },
      { source: "searchIndex", target: "writeApi", color: "#22c55e" },
    ],
    [{ source: "writeApi", target: "lb", color: "#22c55e" }],
    [{ source: "lb", target: "client", color: "#22c55e", label: "200 OK" }],
  ],
  celebTweet: [
    [{ source: "client", target: "lb", color: "#3b82f6", label: "POST /tweet (Elon)" }],
    [{ source: "lb", target: "writeApi", color: "#8b5cf6" }],
    [
      { source: "writeApi", target: "tweetDb", color: "#ec4899", label: "Save Tweet" },
      { source: "writeApi", target: "userDb", color: "#f97316", label: "Get Followers" },
    ],
    [
      { source: "tweetDb", target: "writeApi", color: "#22c55e" },
      { source: "userDb", target: "writeApi", color: "#22c55e", label: "100M Followers (Skip Push)" },
    ],
    [{ source: "writeApi", target: "searchIndex", color: "#f59e0b", label: "Index" }],
    [{ source: "searchIndex", target: "writeApi", color: "#22c55e" }],
    [{ source: "writeApi", target: "lb", color: "#22c55e" }],
    [{ source: "lb", target: "client", color: "#22c55e", label: "200 OK" }],
  ],
  readTimelineNormal: [
    [{ source: "client", target: "lb", color: "#3b82f6", label: "GET /timeline" }],
    [{ source: "lb", target: "readApi", color: "#8b5cf6" }],
    [{ source: "readApi", target: "timelineCache", color: "#06b6d4", label: "Fetch Timeline" }],
    [{ source: "timelineCache", target: "readApi", color: "#22c55e", label: "Cache Hit" }],
    [{ source: "readApi", target: "lb", color: "#22c55e" }],
    [{ source: "lb", target: "client", color: "#22c55e", label: "Timeline Data" }],
  ],
  readTimelineHybrid: [
    [{ source: "client", target: "lb", color: "#3b82f6", label: "GET /timeline" }],
    [{ source: "lb", target: "readApi", color: "#8b5cf6" }],
    [
      { source: "readApi", target: "timelineCache", color: "#06b6d4", label: "Fetch Timeline" },
      { source: "readApi", target: "userDb", color: "#f97316", label: "Get Celeb Follows" },
    ],
    [
      { source: "timelineCache", target: "readApi", color: "#22c55e", label: "Cache Hit" },
      { source: "userDb", target: "readApi", color: "#22c55e" },
    ],
    [{ source: "readApi", target: "tweetDb", color: "#ec4899", label: "Pull Celeb Tweets" }],
    [{ source: "tweetDb", target: "readApi", color: "#22c55e", label: "Merge & Sort" }],
    [{ source: "readApi", target: "lb", color: "#22c55e" }],
    [{ source: "lb", target: "client", color: "#22c55e", label: "Merged Timeline" }],
  ],
};

// --- Components ---

const BackgroundParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-500"
          style={{ width: p.size, height: p.size, top: `${p.y}%`, left: `${p.x}%` }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const NodeComponent = ({ node }: { node: NodePosition }) => (
  <div
    className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
    style={{ left: node.x, top: node.y }}
  >
    <motion.div
      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border z-10 bg-slate-900"
      style={{ borderColor: node.color }}
      animate={{ boxShadow: [`0 0 5px ${node.color}40`, `0 0 20px ${node.color}80`, `0 0 5px ${node.color}40`] }}
      transition={{ duration: 2 + Math.random(), repeat: Infinity }}
    >
      {node.icon}
    </motion.div>
    <div className="mt-2 text-[10px] font-semibold tracking-wider text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap">
      {node.label}
    </div>
  </div>
);

const PacketComponent = React.memo(({ packet, onComplete }: { packet: PacketData; onComplete: (id: string) => void }) => {
  const source = NODES[packet.source];
  const target = NODES[packet.target];

  return (
    <motion.div
      initial={{ x: source.x, y: source.y, opacity: 0, scale: 0.5 }}
      animate={{ x: target.x, y: target.y, opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      onAnimationComplete={() => onComplete(packet.id)}
      className="absolute top-0 left-0 z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{
        width: 10,
        height: 10,
        backgroundColor: packet.color,
        borderRadius: "50%",
        boxShadow: `0 0 15px ${packet.color}, 0 0 5px ${packet.color}`,
      }}
    >
      {packet.label && (
        <span
          className="absolute -top-6 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 whitespace-nowrap border"
          style={{ color: packet.color, borderColor: `${packet.color}50` }}
        >
          {packet.label}
        </span>
      )}
    </motion.div>
  );
});
PacketComponent.displayName = "PacketComponent";

const ControlButton = ({ onClick, label, icon, colorClass, desc }: any) => (
  <button
    onClick={onClick}
    className={`w-full group relative overflow-hidden flex flex-col items-start p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-300 ${colorClass}`}
  >
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl">{icon}</span>
      <span className="font-bold text-sm text-slate-200 group-hover:text-white">{label}</span>
    </div>
    <span className="text-[10px] text-slate-400 text-left leading-tight">{desc}</span>
  </button>
);

const MetricCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col">
    <span className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">{label}</span>
    <span className={`text-lg font-bold ${color}`}>{value}</span>
  </div>
);

// --- Main Visualization Component ---

export default function DesignTwitterViz() {
  const [packets, setPackets] = useState<PacketData[]>([]);
  const [autoTraffic, setAutoTraffic] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    cacheHits: 0,
    cacheMisses: 0,
    totalTweets: 0,
    celebTweets: 0,
    timelineLoads: 0,
    writeLatency: 0,
    readLatency: 0,
  });

  const triggerNextStep = useCallback((flowType: keyof typeof FLOWS, flowId: string, nextStepIndex: number) => {
    const steps = FLOWS[flowType];
    if (nextStepIndex >= steps.length) return;

    const stepPackets = steps[nextStepIndex];
    const newPackets = stepPackets.map((p, i) => ({
      id: `${flowId}-${nextStepIndex}-${i}`,
      flowId,
      flowType,
      stepIndex: nextStepIndex,
      source: p.source as NodeType,
      target: p.target as NodeType,
      color: p.color,
      label: p.label,
    }));

    setPackets((prev) => [...prev, ...newPackets]);
  }, []);

  const triggerFlow = useCallback(
    (flowType: keyof typeof FLOWS) => {
      const flowId = Math.random().toString(36).substring(2, 9);
      triggerNextStep(flowType, flowId, 0);

      setMetrics((m) => {
        const isWrite = flowType === "normalTweet" || flowType === "celebTweet";
        const isCeleb = flowType === "celebTweet";
        const isHybridRead = flowType === "readTimelineHybrid";

        return {
          ...m,
          totalTweets: m.totalTweets + (isWrite ? 1 : 0),
          celebTweets: m.celebTweets + (isCeleb ? 1 : 0),
          timelineLoads: m.timelineLoads + (!isWrite ? 1 : 0),
          writeLatency: isWrite ? (isCeleb ? 90 : 160) + Math.random() * 20 : m.writeLatency,
          readLatency: !isWrite ? (isHybridRead ? 180 : 40) + Math.random() * 30 : m.readLatency,
          cacheHits: m.cacheHits + (!isWrite ? 1 : 0),
          cacheMisses: m.cacheMisses + (isHybridRead ? 1 : 0),
        };
      });
    },
    [triggerNextStep]
  );

  const onPacketComplete = useCallback(
    (packetId: string) => {
      setPackets((prev) => {
        const packet = prev.find((p) => p.id === packetId);
        if (!packet) return prev;

        const newPackets = prev.filter((p) => p.id !== packetId);

        const stepPacketsRemaining = newPackets.filter(
          (p) => p.flowId === packet.flowId && p.stepIndex === packet.stepIndex
        );

        if (stepPacketsRemaining.length === 0) {
          setTimeout(() => {
            triggerNextStep(packet.flowType, packet.flowId, packet.stepIndex + 1);
          }, 50); // Small delay for visual pacing
        }

        return newPackets;
      });
    },
    [triggerNextStep]
  );

  // Auto traffic simulation
  useEffect(() => {
    if (!autoTraffic) return;
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.35) triggerFlow("readTimelineNormal");
      else if (rand < 0.6) triggerFlow("readTimelineHybrid");
      else if (rand < 0.85) triggerFlow("normalTweet");
      else triggerFlow("celebTweet");
    }, 1500);
    return () => clearInterval(interval);
  }, [autoTraffic, triggerFlow]);

  const hitRate =
    metrics.cacheHits + metrics.cacheMisses === 0
      ? 0
      : (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8 font-sans flex flex-col items-center relative overflow-hidden">
      <BackgroundParticles />

      {/* Header */}
      <header className="mb-8 text-center max-w-3xl relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-3">
          Twitter Scale: Push vs Pull Architecture
        </h1>
        <p className="text-slate-400 text-sm">
          Interactive simulation of Twitter's timeline fan-out strategy. Compare traditional Fan-out on Write (Push) 
          vs Hybrid Fan-out on Read (Pull) for celebrity accounts.
        </p>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl relative z-10">
        
        {/* Left Panel: Controls & Metrics */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0">
          
          {/* Controls */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Traffic Generator
            </h2>
            
            <div className="flex flex-col gap-3">
              <ControlButton 
                onClick={() => triggerFlow("normalTweet")}
                icon="👤"
                label="Tweet (Normal User)"
                desc="Fan-out on Write: Pushes tweet to all followers' Redis timelines."
                colorClass="hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
              <ControlButton 
                onClick={() => triggerFlow("celebTweet")}
                icon="🌟"
                label="Tweet (Celebrity)"
                desc="High Follower Count: Saves to DB but skips Redis Push to avoid massive overhead."
                colorClass="hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)]"
              />
              <div className="h-px w-full bg-slate-800/80 my-1" />
              <ControlButton 
                onClick={() => triggerFlow("readTimelineNormal")}
                icon="📜"
                label="Load Timeline"
                desc="Direct cache hit from pre-computed Redis timeline."
                colorClass="hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              />
              <ControlButton 
                onClick={() => triggerFlow("readTimelineHybrid")}
                icon="🔄"
                label="Load Timeline (Following Celeb)"
                desc="Pulls base timeline from Cache, then merges Celebrity tweets from DB."
                colorClass="hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              />
            </div>

            <div className="flex items-center justify-between mt-5 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Auto Simulation</span>
              <button 
                onClick={() => setAutoTraffic(!autoTraffic)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoTraffic ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoTraffic ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-xl flex-grow">
             <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Live Metrics</h2>
             <div className="grid grid-cols-2 gap-3">
               <MetricCard label="Hit Rate" value={`${hitRate.toFixed(1)}%`} color="text-cyan-400" />
               <MetricCard label="Write Lat" value={`${metrics.writeLatency.toFixed(0)}ms`} color="text-pink-400" />
               <MetricCard label="Read Lat" value={`${metrics.readLatency.toFixed(0)}ms`} color="text-emerald-400" />
               <MetricCard label="Total Tweets" value={metrics.totalTweets} color="text-purple-400" />
               <MetricCard label="Celeb Tweets" value={metrics.celebTweets} color="text-amber-400" />
               <MetricCard label="Timeline Hits" value={metrics.timelineLoads} color="text-blue-400" />
             </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow overflow-x-auto bg-slate-900/40 rounded-3xl border border-slate-700/50 shadow-2xl relative flex items-center justify-center p-4 backdrop-blur-sm min-h-[650px]">
           <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, minWidth: CANVAS_WIDTH }}>
              
              {/* Background SVG Lines */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                {EDGES.map((edge, i) => {
                  const source = NODES[edge.source as NodeType];
                  const target = NODES[edge.target as NodeType];
                  return (
                    <line
                      key={i}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      className="opacity-40"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {Object.values(NODES).map((node) => (
                <NodeComponent key={node.type} node={node} />
              ))}

              {/* Animated Packets */}
              <AnimatePresence>
                {packets.map((packet) => (
                  <PacketComponent key={packet.id} packet={packet} onComplete={onPacketComplete} />
                ))}
              </AnimatePresence>
              
           </div>
        </div>

      </div>
    </div>
  );
}

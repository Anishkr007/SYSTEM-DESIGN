"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Smartphone, 
  Server, 
  Database, 
  Image as ImageIcon,
  Layers,
  Activity,
  User,
  Cpu,
  Zap,
  Globe,
  Users
} from "lucide-react";

const NODES = {
  Client: { x: 80, y: 350, label: "Mobile App", icon: Smartphone, type: "client" },
  CDN: { x: 250, y: 150, label: "CDN (Edge)", icon: Globe, type: "edge" },
  Gateway: { x: 250, y: 350, label: "API Gateway", icon: Server, type: "service" },
  
  PostAPI: { x: 450, y: 250, label: "Post API", icon: Server, type: "service" },
  FeedAPI: { x: 450, y: 500, label: "Feed API", icon: Layers, type: "service" },
  
  Kafka: { x: 650, y: 350, label: "Kafka Stream", icon: Activity, type: "queue" },
  
  ImageWorkers: { x: 650, y: 150, label: "Image Workers", icon: Cpu, type: "service" },
  FanoutWorker: { x: 650, y: 500, label: "Fanout Worker", icon: Server, type: "service" },
  
  BlobStorage: { x: 900, y: 150, label: "S3 Blob", icon: ImageIcon, type: "database" },
  PostDB: { x: 900, y: 250, label: "Cassandra DB", icon: Database, type: "database" },
  GraphDB: { x: 900, y: 450, label: "Graph DB", icon: Users, type: "database" },
  RedisCache: { x: 900, y: 550, label: "Redis Cache", icon: Zap, type: "database" },
} as const;

type NodeId = keyof typeof NODES;

const EDGES: { source: NodeId; target: NodeId }[] = [
  { source: "Client", target: "Gateway" },
  { source: "Client", target: "CDN" },
  { source: "Gateway", target: "PostAPI" },
  { source: "Gateway", target: "FeedAPI" },
  { source: "PostAPI", target: "BlobStorage" },
  { source: "PostAPI", target: "PostDB" },
  { source: "PostAPI", target: "Kafka" },
  { source: "Kafka", target: "ImageWorkers" },
  { source: "Kafka", target: "FanoutWorker" },
  { source: "ImageWorkers", target: "BlobStorage" },
  { source: "FanoutWorker", target: "GraphDB" },
  { source: "FanoutWorker", target: "RedisCache" },
  { source: "FeedAPI", target: "RedisCache" },
];

type Packet = {
  id: string;
  source: NodeId;
  target: NodeId;
  color: string;
  label: string;
};

const Particles = () => {
  const [particles, setParticles] = useState<{x: string, y: string, delay: number, duration: number}[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 40 }).map(() => ({
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: Math.random() * 5 + 5
    })));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          initial={{ left: p.x, top: p.y, opacity: 0 }}
          animate={{ 
            top: `calc(${p.y} - 100px)`,
            opacity: [0, 1, 0] 
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function DesignInstagramViz() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [logs, setLogs] = useState<string[]>(["System initialized. Awaiting traffic..."]);
  const [isCelebrity, setIsCelebrity] = useState(false);
  const [activeNode, setActiveNode] = useState<NodeId | null>(null);
  const [metrics, setMetrics] = useState({
    cacheHitRatio: 88.5,
    queueSize: 0,
    latency: 120
  });
  
  const packetIdCounter = useRef(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const currentTimeouts = timeouts.current;
    return () => {
      currentTimeouts.forEach(clearTimeout);
    };
  }, []);

  const safeSetTimeout = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      fn();
      timeouts.current = timeouts.current.filter(id => id !== t);
    }, delay);
    timeouts.current.push(t);
    return t;
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg].slice(-5));
  }, []);

  const addPacket = useCallback((source: NodeId, target: NodeId, color: string, label: string) => {
    const id = `pkt-${packetIdCounter.current++}`;
    setPackets(prev => [...prev, { id, source, target, color, label }]);
    
    safeSetTimeout(() => {
      setPackets(prev => prev.filter(p => p.id !== id));
    }, 1000);
  }, [safeSetTimeout]);

  const handlePostPhoto = useCallback(() => {
    addLog(`[Client] Uploading photo... (Celebrity Mode: ${isCelebrity ? 'ON' : 'OFF'})`);
    setMetrics(m => ({ ...m, queueSize: m.queueSize + 1 }));

    addPacket("Client", "Gateway", "#06b6d4", "POST /post"); 
    safeSetTimeout(() => {
      addPacket("Gateway", "PostAPI", "#06b6d4", "Route");
      
      safeSetTimeout(() => {
        addPacket("PostAPI", "BlobStorage", "#3b82f6", "Save Image"); 
        addPacket("PostAPI", "PostDB", "#3b82f6", "Metadata");
        
        safeSetTimeout(() => {
          addPacket("PostAPI", "Kafka", "#10b981", "Event: PostCreated"); 
          
          safeSetTimeout(() => {
            addPacket("Kafka", "ImageWorkers", "#8b5cf6", "Process Job"); 
            addPacket("Kafka", "FanoutWorker", "#f59e0b", "Fanout Task"); 
            setMetrics(m => ({ ...m, queueSize: Math.max(0, m.queueSize - 1) }));

            safeSetTimeout(() => {
              addPacket("ImageWorkers", "BlobStorage", "#8b5cf6", "Save Variants");
              addPacket("FanoutWorker", "GraphDB", "#f59e0b", "Get Followers");
              
              safeSetTimeout(() => {
                if (isCelebrity) {
                  addLog("[Fan-out] Pull Model: Skipping push to millions of followers.");
                  addPacket("FanoutWorker", "RedisCache", "#ec4899", "Update Own Feed"); 
                } else {
                  addLog("[Fan-out] Push Model: Pushing out to all followers' feeds.");
                  addPacket("FanoutWorker", "RedisCache", "#ec4899", "Push to Followers");
                }
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, [isCelebrity, addPacket, addLog, safeSetTimeout]);

  // Background traffic simulation
  useEffect(() => {
    const interval = setInterval(() => {
       setMetrics(m => {
           const newHitRatio = Math.max(70, Math.min(99.9, m.cacheHitRatio + (Math.random() * 2 - 1)));
           const newLatency = Math.max(20, Math.min(200, m.latency + (Math.random() * 10 - 5)));
           return { ...m, cacheHitRatio: Number(newHitRatio.toFixed(1)), latency: Number(newLatency.toFixed(0)) };
       });

       if (Math.random() > 0.5) {
           addPacket("Client", "Gateway", "#06b6d4", "GET /feed");
           safeSetTimeout(() => {
               addPacket("Gateway", "FeedAPI", "#06b6d4", "Req");
               safeSetTimeout(() => {
                   addPacket("FeedAPI", "RedisCache", "#ec4899", "Fetch");
                   safeSetTimeout(() => {
                       addPacket("RedisCache", "FeedAPI", "#ec4899", "Hit");
                       safeSetTimeout(() => {
                           addPacket("FeedAPI", "Gateway", "#06b6d4", "Res");
                           safeSetTimeout(() => {
                               addPacket("Gateway", "Client", "#06b6d4", "200 OK");
                           }, 1000);
                       }, 1000);
                   }, 1000);
               }, 1000);
           }, 1000);
       } else if (Math.random() > 0.7) {
           // Simulate CDN request
           addPacket("Client", "CDN", "#eab308", "GET /static/img");
           safeSetTimeout(() => {
               addPacket("CDN", "Client", "#eab308", "200 OK");
           }, 800);
       }
    }, 4000);
    return () => clearInterval(interval);
  }, [addPacket, safeSetTimeout]);

  return (
    <div className="relative w-full min-h-[800px] bg-slate-950 text-slate-200 flex justify-center items-center overflow-hidden font-sans select-none">
      <Particles />

      {/* Top Navigation / Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-center bg-slate-900/60 backdrop-blur-lg border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Camera className="w-6 h-6 text-cyan-400" />
            InstaScale Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-1">Hybrid Fan-out System Design Visualization</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-3 text-sm bg-slate-950/80 p-2 rounded-xl border border-slate-800 shadow-inner">
            <span className={`${!isCelebrity ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>Normal User</span>
            <button 
              onClick={() => setIsCelebrity(!isCelebrity)}
              className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isCelebrity ? 'bg-pink-600' : 'bg-slate-700'}`}
            >
              <motion.div 
                layout 
                className="w-4 h-4 bg-white rounded-full shadow-md" 
                animate={{ x: isCelebrity ? 24 : 0 }} 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`${isCelebrity ? 'text-pink-400 font-semibold' : 'text-slate-500'}`}>Celebrity</span>
          </div>
          <button 
            onClick={handlePostPhoto}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <ImageIcon className="w-5 h-5" />
            Post Photo
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="relative w-[1000px] h-[700px] mt-16">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map((edge, i) => {
            const source = NODES[edge.source];
            const target = NODES[edge.target];
            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(51, 65, 85, 0.6)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            );
          })}
        </svg>

        {Object.entries(NODES).map(([id, node]) => {
          const isActive = activeNode === id;
          return (
            <div 
              key={id}
              onClick={() => setActiveNode(id as NodeId)}
              className="absolute z-20 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: node.x, top: node.y }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900/90 border backdrop-blur-md transition-all duration-300 group-hover:scale-110
                ${isActive ? 'ring-2 ring-white scale-110 z-30' : 'shadow-lg'}
                ${node.type === 'client' ? 'border-cyan-500/50 shadow-cyan-500/20 text-cyan-400' : 
                  node.type === 'edge' ? 'border-yellow-500/50 shadow-yellow-500/20 text-yellow-400' :
                  node.type === 'queue' ? 'border-emerald-500/50 shadow-emerald-500/20 text-emerald-400' :
                  node.type === 'database' ? 'border-blue-500/50 shadow-blue-500/20 text-blue-400' :
                  'border-purple-500/50 shadow-purple-500/20 text-purple-400'}`}
              >
                <node.icon className="w-7 h-7" />
              </div>
              <div className="mt-3 text-[11px] font-bold text-slate-300 tracking-wide bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap shadow-md">
                {node.label}
              </div>
            </div>
          );
        })}

        <AnimatePresence>
          {packets.map(pkt => {
            const s = NODES[pkt.source];
            const t = NODES[pkt.target];
            return (
              <motion.div
                key={pkt.id}
                className="absolute z-10 flex items-center justify-center rounded-full pointer-events-none"
                style={{ 
                  backgroundColor: pkt.color, 
                  width: 12, 
                  height: 12, 
                  marginLeft: -6, 
                  marginTop: -6, 
                  boxShadow: `0 0 15px ${pkt.color}, 0 0 30px ${pkt.color}` 
                }}
                initial={{ x: s.x, y: s.y, opacity: 0, scale: 0.5 }}
                animate={{ x: t.x, y: t.y, opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-white border border-slate-700/80 backdrop-blur-md">
                  {pkt.label}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Floating Side Panels */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-4 w-[320px]">
        {/* Metrics Panel */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Live Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Cache Hit Ratio</div>
              <div className="text-xl font-bold text-cyan-400">{metrics.cacheHitRatio}%</div>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Feed Latency</div>
              <div className="text-xl font-bold text-emerald-400">{metrics.latency}ms</div>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 col-span-2">
              <div className="text-xs text-slate-400 mb-1">Async Queue (Workers)</div>
              <div className="text-xl font-bold text-amber-400">{metrics.queueSize} pending tasks</div>
            </div>
          </div>
        </div>
        
        {/* Logs Panel */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" /> System Logs
          </h3>
          <div className="h-32 overflow-y-auto flex flex-col justify-end gap-1.5 font-mono text-[11px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-slate-300 border-l-2 border-cyan-500/50 pl-2 py-0.5 leading-tight"
              >
                <span className="text-cyan-500/60 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

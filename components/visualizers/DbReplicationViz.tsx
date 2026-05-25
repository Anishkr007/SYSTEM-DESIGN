"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Operation {
  id: number;
  type: "write" | "read" | "replication";
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  data: string;
  targetNodeId: string;
}

export default function DbReplicationViz() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [replicationType, setReplicationType] = useState<"async" | "sync">("async");
  const [lag, setLag] = useState(20); // ms base logic
  
  // Node states
  const [nodes, setNodes] = useState({
    primary: { id: "primary", type: "primary", status: "up", x: 50, y: 30, latestData: "v0" },
    replica1: { id: "replica1", type: "replica", status: "up", x: 25, y: 75, latestData: "v0" },
    replica2: { id: "replica2", type: "replica", status: "up", x: 75, y: 75, latestData: "v0" }
  });

  const [metrics, setMetrics] = useState({
    writes: 0,
    reads: 0,
    replicationLag: 0
  });

  const nextId = useRef(0);
  const dataCounter = useRef(0);
  const isPlaying = useRef(true);

  // Generate client traffic (Reads and Writes)
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPlaying.current) return;
      
      const isWrite = Math.random() > 0.6; // 40% writes, 60% reads
      
      // Determine target node
      let targetNodeId = "";
      if (isWrite) {
        // Writes always go to primary
        const primaryNode = Object.values(nodes).find(n => n.type === "primary" && n.status === "up");
        if (primaryNode) targetNodeId = primaryNode.id;
      } else {
        // Reads go to replicas (load balanced)
        const replicas = Object.values(nodes).filter(n => n.type === "replica" && n.status === "up");
        if (replicas.length > 0) {
          targetNodeId = replicas[Math.floor(Math.random() * replicas.length)].id;
        } else {
          // Fallback to primary if no replicas
          const primaryNode = Object.values(nodes).find(n => n.type === "primary" && n.status === "up");
          if (primaryNode) targetNodeId = primaryNode.id;
        }
      }

      if (!targetNodeId) return; // All down
      
      const targetNode = nodes[targetNodeId as keyof typeof nodes];
      const dataValue = isWrite ? `v${++dataCounter.current}` : "read";
      
      const op: Operation = {
        id: nextId.current++,
        type: isWrite ? "write" : "read",
        startX: 50, // Top center (client)
        startY: 0,
        targetX: targetNode.x,
        targetY: targetNode.y,
        progress: 0,
        data: dataValue,
        targetNodeId
      };
      
      setOperations(prev => [...prev, op]);
      
    }, 800); // Base rate
    
    return () => clearInterval(iv);
  }, [nodes]);

  // Animate operations and handle logic
  useEffect(() => {
    const iv = setInterval(() => {
      setOperations(prev => {
        let newOps = [...prev];
        const completedWrites: { nodeId: string, data: string }[] = [];
        const completedReplications: { nodeId: string, data: string }[] = [];
        
        newOps = newOps.map(op => {
          // Adjust speed based on type and lag settings
          let speed = 0.05; // Base speed
          if (op.type === "replication") {
            speed = 0.05 * (100 / (lag + 1)); // Slower if lag is higher
            if (speed > 0.08) speed = 0.08;
            if (speed < 0.01) speed = 0.01;
          }
          
          if (op.type === "write" && replicationType === "sync") {
            speed = 0.02; // Slower writes in sync mode because it waits for replicas
          }
          
          let newProgress = op.progress + speed;
          
          if (newProgress >= 1.0) {
            // Operation completed
            if (op.type === "write") {
              completedWrites.push({ nodeId: op.targetNodeId, data: op.data });
              setMetrics(m => ({ ...m, writes: m.writes + 1 }));
            } else if (op.type === "read") {
              setMetrics(m => ({ ...m, reads: m.reads + 1 }));
            } else if (op.type === "replication") {
              completedReplications.push({ nodeId: op.targetNodeId, data: op.data });
            }
            return { ...op, progress: 1.1 }; // Mark for removal
          }
          
          return { ...op, progress: newProgress };
        }).filter(op => op.progress <= 1.0);
        
        // Handle completed writes -> trigger replication
        completedWrites.forEach(write => {
          // Update primary node data
          setNodes(n => ({
            ...n,
            [write.nodeId]: { ...n[write.nodeId as keyof typeof nodes], latestData: write.data }
          }));
          
          const primaryNode = nodes[write.nodeId as keyof typeof nodes];
          
          // Trigger replication to all up replicas
          Object.values(nodes).forEach(replica => {
            if (replica.type === "replica" && replica.status === "up") {
              newOps.push({
                id: nextId.current++,
                type: "replication",
                startX: primaryNode.x,
                startY: primaryNode.y,
                targetX: replica.x,
                targetY: replica.y,
                progress: 0,
                data: write.data,
                targetNodeId: replica.id
              });
            }
          });
        });
        
        // Handle completed replications
        completedReplications.forEach(repl => {
          setNodes(n => ({
            ...n,
            [repl.nodeId]: { ...n[repl.nodeId as keyof typeof nodes], latestData: repl.data }
          }));
        });
        
        return newOps;
      });
      
      // Update calculated metrics
      setNodes(currentNodes => {
        const primaryData = parseInt((Object.values(currentNodes).find(n => n.type === "primary")?.latestData || "v0").substring(1));
        
        let avgLag = 0;
        let count = 0;
        
        Object.values(currentNodes).forEach(n => {
          if (n.type === "replica" && n.status === "up") {
            const replData = parseInt((n.latestData || "v0").substring(1));
            avgLag += (primaryData - replData);
            count++;
          }
        });
        
        if (count > 0) {
          setMetrics(m => ({ ...m, replicationLag: Math.max(0, avgLag / count) }));
        }
        
        return currentNodes;
      });
      
    }, 50);
    
    return () => clearInterval(iv);
  }, [lag, replicationType, nodes]);

  const triggerFailover = () => {
    // Kill primary, promote replica1
    setNodes(prev => ({
      ...prev,
      primary: { ...prev.primary, status: "down", type: "replica" }, // Demote and kill
      replica1: { ...prev.replica1, status: "up", type: "primary" }, // Promote to primary
      // replica2 remains replica but connects to new primary conceptually
    }));
  };

  const recoverNode = (nodeId: string) => {
    setNodes(prev => {
      // If we are recovering the old primary, it comes back as a replica to avoid split brain
      const type = nodeId === "primary" && prev.replica1.type === "primary" ? "replica" : prev[nodeId as keyof typeof nodes].type;
      return {
        ...prev,
        [nodeId]: { ...prev[nodeId as keyof typeof nodes], status: "up", type }
      };
    });
  };

  const killNode = (nodeId: string) => {
    setNodes(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId as keyof typeof nodes], status: "down" }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Architecture Visualization */}
      <div className="bg-black/30 rounded-2xl border border-white/10 p-6 relative overflow-hidden aspect-[16/9] min-h-[400px]">
        {/* Client Area */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full z-10">
          <span className="text-xl">💻</span>
          <span className="text-xs font-mono text-zinc-300">Client Application</span>
        </div>

        {/* Database Nodes */}
        {Object.entries(nodes).map(([key, node]) => (
          <div 
            key={key}
            className={`absolute flex flex-col items-center justify-center w-24 h-24 -ml-12 -mt-12 rounded-xl border-2 z-10 transition-colors duration-300 ${
              node.status === "down" 
                ? "bg-red-500/10 border-red-500/50 grayscale" 
                : node.type === "primary"
                  ? "bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                  : "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {node.status === "down" && <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-xl" />}
            
            <span className="text-3xl mb-1">{node.status === "down" ? "💀" : "🗄️"}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              {node.type === "primary" ? "Primary" : "Replica"}
            </span>
            
            {/* Data Version Badge */}
            {node.status === "up" && (
              <div className="absolute -bottom-3 bg-black border border-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                {node.latestData}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute -right-8 top-0 flex flex-col gap-1">
              {node.status === "up" ? (
                <button onClick={() => killNode(key)} className="w-6 h-6 bg-red-500/20 hover:bg-red-500/50 rounded flex items-center justify-center text-xs" title="Kill Node">🛑</button>
              ) : (
                <button onClick={() => recoverNode(key)} className="w-6 h-6 bg-emerald-500/20 hover:bg-emerald-500/50 rounded flex items-center justify-center text-xs" title="Recover Node">⚕️</button>
              )}
            </div>
          </div>
        ))}

        {/* Animated Operations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {operations.map(op => {
            const currentX = op.startX + (op.targetX - op.startX) * op.progress;
            const currentY = op.startY + (op.targetY - op.startY) * op.progress;
            
            let color = "#3b82f6"; // Blue (Read)
            if (op.type === "write") color = "#f59e0b"; // Yellow
            if (op.type === "replication") color = "#a855f7"; // Purple
            
            return (
              <g key={op.id}>
                <circle cx={`${currentX}%`} cy={`${currentY}%`} r="4" fill={color} filter="url(#glow)" />
                {/* Data payload label attached to moving dot */}
                <text x={`${currentX + 1.5}%`} y={`${currentY - 1.5}%`} fill="white" fontSize="10" fontFamily="monospace" textAnchor="start">
                  {op.data}
                </text>
              </g>
            );
          })}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 border border-white/10 p-3 rounded-lg backdrop-blur-md z-30 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_#f59e0b]"></div> Write (Primary Only)
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> Read (Replicas)
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_5px_#a855f7]"></div> Replication Log (WAL)
          </div>
        </div>
      </div>

      {/* Controls & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Replication Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400 mb-2 block">Replication Mode</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setReplicationType("async")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${replicationType === "async" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50" : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent"}`}
                >
                  Asynchronous
                </button>
                <button 
                  onClick={() => setReplicationType("sync")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${replicationType === "sync" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50" : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent"}`}
                >
                  Synchronous
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 min-h-[30px]">
                {replicationType === "async" 
                  ? "Primary acknowledges write immediately, replicates in background. Fast writes, but potential data loss on crash." 
                  : "Primary waits for replicas to acknowledge before confirming write. Slower writes, but guarantees zero data loss."}
              </p>
            </div>

            {replicationType === "async" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Network Lag (Simulated)</span>
                </div>
                <input
                  type="range" min="1" max="100" value={lag}
                  onChange={e => setLag(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
            
            <div className="pt-2 border-t border-white/10">
              <button 
                onClick={triggerFailover}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>⚠️</span> Trigger Manual Failover
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Database Metrics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Write Operations</div>
              <div className="text-2xl font-mono text-amber-400">{metrics.writes}</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Read Operations</div>
              <div className="text-2xl font-mono text-cyan-400">{metrics.reads}</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5 col-span-2 flex justify-between items-center">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Replication Lag (Versions Behind)</div>
                <div className={`text-2xl font-mono ${metrics.replicationLag > 2 ? 'text-red-400 animate-pulse' : metrics.replicationLag > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.replicationLag.toFixed(1)} <span className="text-sm text-zinc-500">v</span>
                </div>
              </div>
              <div className="text-right">
                {metrics.replicationLag > 2 && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                    STALE READS DETECTED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">📈</div>
          <h4 className="text-sm font-bold text-white">Read Scaling</h4>
          <p className="text-xs text-zinc-400 mt-1">Distribute reads across replicas</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">♻️</div>
          <h4 className="text-sm font-bold text-white">High Availability</h4>
          <p className="text-xs text-zinc-400 mt-1">Promote replica on primary failure</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">⏱️</div>
          <h4 className="text-sm font-bold text-white">Async / Sync</h4>
          <p className="text-xs text-zinc-400 mt-1">Tradeoff latency vs durability</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">⚠️</div>
          <h4 className="text-sm font-bold text-white">Replication Lag</h4>
          <p className="text-xs text-zinc-400 mt-1">Risk of reading stale data</p>
        </div>
      </div>
    </div>
  );
}

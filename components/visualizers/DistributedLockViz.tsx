"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Client {
  id: string;
  name: string;
  color: string;
  state: "idle" | "requesting" | "holding" | "failed" | "renewing" | "releasing";
  workProgress: number; // 0 to 100
}

interface Lock {
  owner: string | null;
  expiresAt: number | null; // Simulated ms timestamp
  key: string;
}

export default function DistributedLockViz() {
  const [algo, setAlgo] = useState<"single" | "redlock">("single");
  const [redisNodes, setRedisNodes] = useState<{id: number, status: "up" | "down", lockedBy: string | null}[]>([
    { id: 1, status: "up", lockedBy: null },
    { id: 2, status: "up", lockedBy: null },
    { id: 3, status: "up", lockedBy: null },
    { id: 4, status: "up", lockedBy: null },
    { id: 5, status: "up", lockedBy: null }
  ]);
  
  const [clients, setClients] = useState<Client[]>([
    { id: "c1", name: "Client A", color: "blue", state: "idle", workProgress: 0 },
    { id: "c2", name: "Client B", color: "purple", state: "idle", workProgress: 0 }
  ]);
  
  const [mainLock, setMainLock] = useState<Lock>({ owner: null, expiresAt: null, key: "resource_123" });
  const [time, setTime] = useState(0); // Simulated time in ms
  const [ttl, setTtl] = useState(5000); // 5 seconds
  const [autoRenew, setAutoRenew] = useState(true);

  const isRunning = useRef(true);

  // Simulated Clock
  useEffect(() => {
    const iv = setInterval(() => {
      if (isRunning.current) {
        setTime(t => t + 100);
      }
    }, 100);
    return () => clearInterval(iv);
  }, []);

  // Lock Expiration & Heartbeats
  useEffect(() => {
    if (!isRunning.current) return;

    // Check expiration
    if (mainLock.owner && mainLock.expiresAt && time >= mainLock.expiresAt) {
      // Lock expired!
      setMainLock({ owner: null, expiresAt: null, key: "resource_123" });
      setRedisNodes(nodes => nodes.map(n => ({ ...n, lockedBy: null })));
      
      // Update the client that held it (they might still think they hold it until they check, but we'll force idle for viz)
      setClients(prev => prev.map(c => 
        c.id === mainLock.owner ? { ...c, state: "failed", workProgress: 0 } : c
      ));
    }
    
    // Auto-renew (Heartbeat) - trigger when 30% TTL remaining
    if (autoRenew && mainLock.owner && mainLock.expiresAt) {
      const remaining = mainLock.expiresAt - time;
      if (remaining > 0 && remaining < ttl * 0.3) {
        // Renew lock
        const owner = mainLock.owner;
        setClients(prev => prev.map(c => c.id === owner ? { ...c, state: "renewing" } : c));
        
        setTimeout(() => {
          setMainLock(l => ({ ...l, expiresAt: time + ttl }));
          setClients(prev => prev.map(c => c.id === owner ? { ...c, state: "holding" } : c));
        }, 500); // Simulate network delay for renewal
      }
    }
  }, [time, mainLock, autoRenew, ttl]);

  // Client Work Progress Simulation
  useEffect(() => {
    if (!isRunning.current) return;
    
    setClients(prev => prev.map(c => {
      if (c.state === "holding" || c.state === "renewing") {
        const newProgress = c.workProgress + 2; // 2% per 100ms = 5s total work
        if (newProgress >= 100) {
          // Work done, release lock
          releaseLock(c.id);
          return { ...c, state: "idle", workProgress: 0 };
        }
        return { ...c, workProgress: newProgress };
      }
      return c;
    }));
  }, [time]);

  const acquireLock = (clientId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, state: "requesting" } : c));
    
    setTimeout(() => {
      let success = false;
      
      if (algo === "single") {
        const node1 = redisNodes[0];
        if (node1.status === "up" && !mainLock.owner) {
          success = true;
          setRedisNodes(nodes => nodes.map((n, i) => i === 0 ? { ...n, lockedBy: clientId } : n));
        }
      } else {
        // Redlock algorithm (needs majority)
        let votes = 0;
        const requiredVotes = Math.floor(redisNodes.length / 2) + 1; // 3 out of 5
        
        const newNodes = [...redisNodes];
        for (let i = 0; i < newNodes.length; i++) {
          if (newNodes[i].status === "up" && (!newNodes[i].lockedBy || newNodes[i].lockedBy === clientId)) {
            votes++;
            newNodes[i].lockedBy = clientId;
          }
        }
        
        if (votes >= requiredVotes && !mainLock.owner) {
          success = true;
          setRedisNodes(newNodes);
        } else {
          // Rollback votes if failed to get majority
          setRedisNodes(nodes => nodes.map(n => n.lockedBy === clientId ? { ...n, lockedBy: null } : n));
        }
      }

      if (success) {
        setMainLock({ owner: clientId, expiresAt: time + ttl, key: "resource_123" });
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, state: "holding", workProgress: 0 } : c));
      } else {
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, state: "failed" } : c));
        setTimeout(() => {
          setClients(prev => prev.map(c => c.id === clientId && c.state === "failed" ? { ...c, state: "idle" } : c));
        }, 1500);
      }
    }, 600); // Simulate network roundtrip
  };

  const releaseLock = (clientId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, state: "releasing" } : c));
    
    setTimeout(() => {
      // Only owner can release
      if (mainLock.owner === clientId) {
        setMainLock({ owner: null, expiresAt: null, key: "resource_123" });
        setRedisNodes(nodes => nodes.map(n => n.lockedBy === clientId ? { ...n, lockedBy: null } : n));
      }
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, state: "idle", workProgress: 0 } : c));
    }, 300);
  };

  const toggleNode = (id: number) => {
    setRedisNodes(nodes => nodes.map(n => n.id === id ? { ...n, status: n.status === "up" ? "down" : "up" } : n));
  };

  const getClientColor = (clientId: string | null) => {
    if (clientId === "c1") return "text-blue-400 border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
    if (clientId === "c2") return "text-purple-400 border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    return "text-zinc-500 border-zinc-600 bg-zinc-800/50";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Algorithm</h3>
            <div className="flex bg-black/40 rounded-lg p-1">
              <button 
                onClick={() => { setAlgo("single"); setMainLock({owner:null, expiresAt:null, key:""}); setRedisNodes(n=>n.map(x=>({...x, lockedBy: null}))); }}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${algo === "single" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Single Node
              </button>
              <button 
                onClick={() => { setAlgo("redlock"); setMainLock({owner:null, expiresAt:null, key:""}); setRedisNodes(n=>n.map(x=>({...x, lockedBy: null}))); }}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${algo === "redlock" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Redlock (Cluster)
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">
              {algo === "single" 
                ? "Uses SET NX PX on a single Redis instance. Simple but introduces a Single Point of Failure (SPOF)."
                : "Redlock algorithm requests locks from N independent Redis nodes. Requires N/2+1 (majority) to acquire the lock. Resilient to node failures."
              }
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Lock Settings</h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1 text-zinc-400">
                <span>Time To Live (TTL)</span>
                <span className="text-white font-mono">{ttl / 1000}s</span>
              </div>
              <input
                type="range" min="2000" max="10000" step="1000" value={ttl}
                onChange={e => setTtl(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Auto-Renew (Heartbeat)</span>
              <button 
                onClick={() => setAutoRenew(!autoRenew)}
                className={`w-10 h-5 rounded-full relative transition-colors ${autoRenew ? 'bg-indigo-500' : 'bg-white/10'}`}
              >
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full absolute top-1"
                  animate={{ left: autoRenew ? '22px' : '4px' }}
                />
              </button>
            </div>
            <p className="text-[9px] text-zinc-500">
              If client work takes longer than TTL, it must periodically renew the lock to prevent others from stealing it.
            </p>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="md:col-span-2 bg-black/40 rounded-2xl border border-white/10 p-6 relative flex flex-col items-center justify-between min-h-[400px] overflow-hidden">
          
          {/* Top: Shared Resource */}
          <div className="w-full max-w-sm flex flex-col items-center z-10 mb-8">
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Shared Resource</div>
            <div className={`w-full py-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${getClientColor(mainLock.owner)}`}>
              <span className="text-3xl mb-1">🗄️</span>
              <span className="text-sm font-bold">inventory_501</span>
              
              {/* Lock Status / TTL Bar */}
              <div className="w-3/4 mt-3 bg-black/50 h-2 rounded-full overflow-hidden relative border border-white/10">
                {mainLock.owner && mainLock.expiresAt && (
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-white"
                    initial={{ width: "100%" }}
                    animate={{ width: `${Math.max(0, ((mainLock.expiresAt - time) / ttl) * 100)}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                )}
              </div>
              <div className="text-[9px] mt-1 opacity-70 font-mono">
                {mainLock.owner ? `LOCKED BY ${mainLock.owner.toUpperCase()}` : "UNLOCKED"}
              </div>
            </div>
          </div>

          {/* Middle: Redis Nodes */}
          <div className="w-full flex justify-center gap-4 mb-8 z-10">
            {(algo === "single" ? [redisNodes[0]] : redisNodes).map(node => (
              <div 
                key={node.id}
                onClick={() => toggleNode(node.id)}
                className={`w-14 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  node.status === "down" ? "bg-red-500/20 border-red-500/50 grayscale opacity-50" : getClientColor(node.lockedBy)
                }`}
                title="Click to toggle node up/down"
              >
                <span className="text-lg">🔴</span>
                <span className="text-[8px] mt-1 font-mono">Node {node.id}</span>
                {node.status === "down" && <div className="absolute w-14 h-1 bg-red-500 rotate-45"></div>}
              </div>
            ))}
          </div>

          {/* Connection Lines (Abstract) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {clients.map((c, i) => {
              const startX = i === 0 ? "25%" : "75%";
              const startY = "85%";
              
              if (c.state === "requesting" || c.state === "renewing" || c.state === "releasing") {
                return (algo === "single" ? [redisNodes[0]] : redisNodes).map(node => {
                  if (node.status === "down") return null;
                  const targetX = algo === "single" ? "50%" : `${50 + (node.id - 3) * 12}%`;
                  const targetY = "50%";
                  const color = c.color === "blue" ? "#3b82f6" : "#a855f7";
                  
                  return (
                    <line key={`${c.id}-${node.id}`} x1={startX} y1={startY} x2={targetX} y2={targetY} stroke={color} strokeWidth="2" strokeDasharray="4 4">
                      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                    </line>
                  );
                });
              }
              return null;
            })}
          </svg>

          {/* Bottom: Clients */}
          <div className="w-full flex justify-around items-end z-10">
            {clients.map(client => (
              <div key={client.id} className="flex flex-col items-center w-40">
                
                {/* Status Indicator */}
                <div className="h-6 mb-2">
                  {client.state === "requesting" && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30 animate-pulse">Acquiring Lock...</span>}
                  {client.state === "renewing" && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">Sending Heartbeat...</span>}
                  {client.state === "holding" && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">Processing Data...</span>}
                  {client.state === "failed" && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-1 rounded border border-red-500/30">Lock Denied/Expired</span>}
                  {client.state === "releasing" && <span className="text-[10px] bg-zinc-500/20 text-zinc-300 px-2 py-1 rounded border border-zinc-500/30">Releasing...</span>}
                </div>

                {/* Client Node */}
                <div className={`w-full p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors shadow-lg ${
                  client.id === "c1" ? "bg-blue-900/20 border-blue-500" : "bg-purple-900/20 border-purple-500"
                }`}>
                  <span className="text-3xl mb-1">🖥️</span>
                  <span className="text-sm font-bold text-white mb-2">{client.name}</span>
                  
                  {/* Action Buttons */}
                  <div className="w-full space-y-2">
                    {client.state === "idle" || client.state === "failed" ? (
                      <button 
                        onClick={() => acquireLock(client.id)}
                        className={`w-full py-1.5 text-xs font-bold rounded bg-${client.color}-500 hover:bg-${client.color}-400 text-white transition-colors`}
                      >
                        Acquire Lock
                      </button>
                    ) : (
                      <div className="w-full">
                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-1">
                          <div className={`h-full bg-${client.color}-400 transition-all duration-100 ease-linear`} style={{ width: `${client.workProgress}%` }}></div>
                        </div>
                        <button 
                          onClick={() => releaseLock(client.id)}
                          className="w-full py-1 text-[10px] rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                        >
                          Cancel & Release
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

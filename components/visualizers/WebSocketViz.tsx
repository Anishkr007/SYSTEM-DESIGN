"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Protocol = "polling" | "long-polling" | "sse" | "websocket";

interface Packet {
  id: number;
  type: "request" | "response" | "stream" | "upgrade" | "ping" | "pong";
  progress: number; // 0 to 1
  direction: "up" | "down";
}

export default function WebSocketViz() {
  const [activeTab, setActiveTab] = useState<Protocol>("websocket");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [serverState, setServerState] = useState<"idle" | "processing" | "waiting" | "streaming">("idle");
  const [connectionState, setConnectionState] = useState<"closed" | "upgrading" | "open">("closed");
  
  const [metrics, setMetrics] = useState({
    requestsSent: 0,
    responsesReceived: 0,
    wastedOverhead: 0, // Number of empty responses or HTTP header overhead
    latency: 0
  });

  const nextId = useRef(0);
  const dataCounter = useRef(0);

  // Reset simulation when changing tabs
  useEffect(() => {
    setPackets([]);
    setServerState("idle");
    setMetrics({ requestsSent: 0, responsesReceived: 0, wastedOverhead: 0, latency: 0 });
    
    if (activeTab === "websocket") {
      setConnectionState("closed");
      // Auto-initiate handshake
      setTimeout(() => initiateHandshake(), 500);
    } else if (activeTab === "sse") {
      setConnectionState("closed");
      setTimeout(() => initiateHandshake(), 500);
    } else {
      setConnectionState("closed");
    }
  }, [activeTab]);

  const initiateHandshake = () => {
    setConnectionState("upgrading");
    const req: Packet = { id: nextId.current++, type: "upgrade", progress: 0, direction: "up" };
    setPackets([req]);
  };

  // Main Simulation Loop
  useEffect(() => {
    const iv = setInterval(() => {
      let currentPackets = [...packets];
      
      // Update packet positions
      currentPackets = currentPackets.map(p => {
        let speed = 0.05; // Base speed
        if (p.type === "stream") speed = 0.03; // Slower stream
        if (p.type === "upgrade") speed = 0.04;
        
        return { ...p, progress: p.progress + speed };
      });

      // Handle packet completion (arrived at destination)
      const completedPackets = currentPackets.filter(p => p.progress >= 1);
      currentPackets = currentPackets.filter(p => p.progress < 1);

      completedPackets.forEach(p => {
        if (p.direction === "up") { // Arrived at Server
          if (p.type === "upgrade") {
            // Server responds with 101 Switching Protocols or 200 OK for SSE
            setServerState("processing");
            setTimeout(() => {
              const resp: Packet = { id: nextId.current++, type: "upgrade", progress: 0, direction: "down" };
              setPackets(prev => [...prev, resp]);
              if (activeTab === "sse") setServerState("streaming");
            }, 300);
          } else if (p.type === "request") {
            setMetrics(m => ({ ...m, requestsSent: m.requestsSent + 1 }));
            
            if (activeTab === "polling") {
              // Server responds immediately (usually empty)
              setServerState("processing");
              const hasData = Math.random() > 0.7; // 30% chance of data
              setTimeout(() => {
                const resp: Packet = { id: nextId.current++, type: hasData ? "response" : "ping", progress: 0, direction: "down" };
                setPackets(prev => [...prev, resp]);
                setServerState("idle");
              }, 100);
            } else if (activeTab === "long-polling") {
              // Server holds connection
              setServerState("waiting");
              // Respond when data is available (simulated delay)
              setTimeout(() => {
                const resp: Packet = { id: nextId.current++, type: "response", progress: 0, direction: "down" };
                setPackets(prev => [...prev, resp]);
                setServerState("idle");
              }, 1500 + Math.random() * 1000);
            } else if (activeTab === "websocket") {
              // Bi-directional normal message
              setMetrics(m => ({ ...m, requestsSent: m.requestsSent + 1 }));
            }
          }
        } else { // Arrived at Client
          if (p.type === "upgrade") {
            setConnectionState("open");
            setMetrics(m => ({ ...m, latency: 15 })); // Fast latency for WS/SSE
          } else if (p.type === "response" || p.type === "stream") {
            setMetrics(m => ({ ...m, responsesReceived: m.responsesReceived + 1 }));
            if (activeTab === "polling" || activeTab === "long-polling") {
              setMetrics(m => ({ ...m, latency: activeTab === "polling" ? 45 : 120 }));
            }
          } else if (p.type === "ping") {
            // Empty response (wasted overhead)
            setMetrics(m => ({ ...m, wastedOverhead: m.wastedOverhead + 1 }));
          }
        }
      });

      // Generate traffic based on protocol
      const now = Date.now();
      
      if (activeTab === "polling" && currentPackets.length === 0) {
        // Send request immediately if empty
        if (!currentPackets.some(p => p.direction === "up")) {
           const req: Packet = { id: nextId.current++, type: "request", progress: 0, direction: "up" };
           currentPackets.push(req);
        }
      } else if (activeTab === "long-polling" && currentPackets.length === 0 && serverState === "idle") {
        // Client sends new request immediately after receiving response
        const req: Packet = { id: nextId.current++, type: "request", progress: 0, direction: "up" };
        currentPackets.push(req);
      } else if (activeTab === "sse" && connectionState === "open") {
        // Server spontaneously sends events
        if (Math.random() > 0.95 && currentPackets.filter(p => p.direction === "down").length < 3) {
          const streamData: Packet = { id: nextId.current++, type: "stream", progress: 0, direction: "down" };
          currentPackets.push(streamData);
        }
      } else if (activeTab === "websocket" && connectionState === "open") {
        // Both sides can send spontaneously
        if (Math.random() > 0.96 && currentPackets.filter(p => p.direction === "down").length < 2) {
          const down: Packet = { id: nextId.current++, type: "stream", progress: 0, direction: "down" };
          currentPackets.push(down);
        }
        if (Math.random() > 0.96 && currentPackets.filter(p => p.direction === "up").length < 2) {
          const up: Packet = { id: nextId.current++, type: "request", progress: 0, direction: "up" };
          currentPackets.push(up);
        }
      }

      setPackets(currentPackets);
    }, 50);

    return () => clearInterval(iv);
  }, [packets, activeTab, serverState, connectionState]);

  const getPacketStyle = (packet: Packet) => {
    let color = "bg-blue-500 shadow-[0_0_10px_#3b82f6]";
    let label = "DATA";
    
    if (packet.type === "upgrade") {
      color = "bg-purple-500 shadow-[0_0_10px_#a855f7]";
      label = "HTTP/1.1 101";
    } else if (packet.type === "request") {
      color = "bg-emerald-500 shadow-[0_0_10px_#10b981]";
      label = activeTab === "websocket" ? "FRAME" : "HTTP GET";
    } else if (packet.type === "ping") {
      color = "bg-red-500/50 shadow-[0_0_10px_#ef4444]";
      label = "EMPTY 200";
    } else if (packet.type === "stream") {
      color = "bg-cyan-500 shadow-[0_0_10px_#06b6d4]";
      label = activeTab === "sse" ? "EVENT" : "FRAME";
    }

    return { color, label };
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full overflow-x-auto no-scrollbar">
        {[
          { id: "polling", label: "Short Polling", icon: "🔄" },
          { id: "long-polling", label: "Long Polling", icon: "⏳" },
          { id: "sse", label: "Server-Sent Events", icon: "📥" },
          { id: "websocket", label: "WebSockets", icon: "⚡" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Protocol)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all min-w-[140px] ${
              activeTab === tab.id ? "bg-indigo-500 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizer Area */}
        <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-white/10 p-6 relative min-h-[400px] flex justify-between items-center px-12 md:px-24 overflow-hidden">
          
          {/* Client Node */}
          <div className="flex flex-col items-center z-10 w-32">
            <div className="w-20 h-20 bg-zinc-800 border-2 border-zinc-600 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-lg">
              💻
            </div>
            <div className="text-sm font-bold text-white mb-1">Client</div>
            <div className="text-xs text-zinc-500 font-mono text-center">
              {connectionState === "open" ? "Connected" : connectionState === "upgrading" ? "Handshake..." : "Disconnected"}
            </div>
          </div>

          {/* Connection Pipe Background */}
          <div className="absolute left-[150px] right-[150px] top-1/2 -translate-y-1/2 flex flex-col justify-center h-20 opacity-30">
            {activeTab === "websocket" || activeTab === "sse" ? (
              <div className={`w-full h-8 border-y-2 flex items-center justify-center transition-colors duration-1000 ${connectionState === "open" ? "border-cyan-500 bg-cyan-500/10" : "border-white/20 bg-white/5"}`}>
                <div className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-50">
                  {connectionState === "open" ? "Persistent TCP Connection" : "HTTP/1.1 Connection"}
                </div>
              </div>
            ) : (
              <div className="w-full border-t-2 border-white/20 border-dashed relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-mono opacity-50 text-nowrap">
                  Ephemeral HTTP Requests
                </div>
              </div>
            )}
          </div>

          {/* Animated Packets */}
          {packets.map(packet => {
            const { color, label } = getPacketStyle(packet);
            const x = packet.direction === "up" 
              ? 15 + (packet.progress * 70) // Client to Server
              : 85 - (packet.progress * 70); // Server to Client
            
            const y = activeTab === "websocket" || activeTab === "sse" 
              ? (packet.direction === "up" ? 45 : 55) // Top lane for up, bottom for down
              : 50; // Middle for polling
              
            return (
              <div 
                key={packet.id}
                className={`absolute w-3 h-3 rounded-full ${color} flex items-center justify-center transition-all duration-75 z-20`}
                style={{ 
                  left: `${x}%`, 
                  top: `calc(${y}% - 6px)`,
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                <div className="absolute -top-5 text-[9px] font-bold text-white font-mono whitespace-nowrap bg-black/60 px-1.5 rounded">
                  {label}
                </div>
              </div>
            );
          })}

          {/* Server Node */}
          <div className="flex flex-col items-center z-10 w-32 relative">
            {/* Processing Indicator */}
            {serverState === "processing" && (
              <div className="absolute -top-8 w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {serverState === "waiting" && (
              <div className="absolute -top-8 text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">Holding...</div>
            )}
            
            <div className={`w-20 h-20 border-2 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-lg transition-colors ${
              serverState === "waiting" ? "bg-amber-500/20 border-amber-500" :
              serverState === "streaming" ? "bg-cyan-500/20 border-cyan-500" :
              "bg-zinc-800 border-zinc-600"
            }`}>
              🗄️
            </div>
            <div className="text-sm font-bold text-white mb-1">Server</div>
            <div className="text-xs text-zinc-500 font-mono text-center">
              {activeTab === "websocket" ? "Node.js / Go" : activeTab === "sse" ? "EventStream" : "REST API"}
            </div>
          </div>

        </div>

        {/* Info & Metrics */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Traffic Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total Packets Sent</span>
                <span className="font-mono text-sm text-emerald-400">{metrics.requestsSent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Useful Data Received</span>
                <span className="font-mono text-sm text-cyan-400">{metrics.responsesReceived}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Wasted Overhead (Empty)</span>
                <span className="font-mono text-sm text-red-400">{metrics.wastedOverhead}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="text-xs text-zinc-400">Estimated Latency</span>
                <span className={`font-mono text-sm ${metrics.latency < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {metrics.latency}ms
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5 flex-1">
            <h3 className="text-sm font-bold text-indigo-300 mb-2">How it works</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeTab === "polling" && "Client repeatedly sends HTTP requests at fixed intervals. If server has no new data, it returns an empty response. Highly inefficient and creates massive HTTP overhead."}
              {activeTab === "long-polling" && "Client sends an HTTP request. Server holds the connection open until it has data, then responds. Client immediately sends a new request. Better than short polling, but still has HTTP header overhead for every message."}
              {activeTab === "sse" && "Client establishes one HTTP connection. Server pushes events down that single connection using 'text/event-stream'. Highly efficient for 1-way (Server to Client) streaming like live dashboards."}
              {activeTab === "websocket" && "Starts as HTTP, then 'upgrades' to a persistent TCP connection. Both client and server can send lightweight frames simultaneously with no HTTP header overhead. Lowest latency, true real-time."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

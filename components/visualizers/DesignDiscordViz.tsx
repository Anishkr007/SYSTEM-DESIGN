"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SVG Icons ---
const IconServer = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const IconDatabase = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const IconUsers = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMic = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const IconMessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconSettings = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// --- Particle Background ---
const Particles = () => {
  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-500"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.8, 0],
            scale: [1, 1.5, 1],
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

// --- Types & Constants ---
type ServerSize = 'small' | 'massive';
type PacketType = 'msg' | 'voice' | 'presence';

interface Packet {
  id: string;
  type: PacketType;
  path: [number, number][]; // Array of [x, y] percentages
  duration: number;
  color: string;
  delay?: number;
}

const NODES = {
  CLIENT: { x: 50, y: 15, label: "Clients", icon: IconUsers, color: "text-blue-400", border: "border-blue-500/50", glow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]" },
  GATEWAY: { x: 30, y: 40, label: "Gateway WS", icon: IconServer, color: "text-purple-400", border: "border-purple-500/50", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]" },
  VOICE_ROUTER: { x: 70, y: 40, label: "Voice Router", icon: IconMic, color: "text-green-400", border: "border-green-500/50", glow: "shadow-[0_0_15px_rgba(34,197,94,0.5)]" },
  GUILD_RING: { x: 30, y: 65, label: "Guild Ring (Erlang)", icon: IconSettings, color: "text-pink-400", border: "border-pink-500/50", glow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]" },
  SCYLLA: { x: 15, y: 85, label: "ScyllaDB (Msgs)", icon: IconDatabase, color: "text-orange-400", border: "border-orange-500/50", glow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]" },
  CASSANDRA: { x: 45, y: 85, label: "Cassandra (Presence)", icon: IconDatabase, color: "text-yellow-400", border: "border-yellow-500/50", glow: "shadow-[0_0_15px_rgba(234,179,8,0.5)]" },
};

// --- Main Component ---
export default function DesignDiscordViz() {
  const [serverSize, setServerSize] = useState<ServerSize>('small');
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [metrics, setMetrics] = useState({
    activeUsers: 1420,
    wsConnections: 350,
    msgPerSec: 15,
  });

  const packetIdCounter = useRef(0);

  // Auto-update metrics based on server size
  useEffect(() => {
    const isMassive = serverSize === 'massive';
    
    const targetUsers = isMassive ? 1450230 : 1420;
    const targetWs = isMassive ? 350420 : 350;
    const targetMsg = isMassive ? 12450 : 15;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: Math.floor(prev.activeUsers + (targetUsers - prev.activeUsers) * 0.1 + (Math.random() * 10 - 5)),
        wsConnections: Math.floor(prev.wsConnections + (targetWs - prev.wsConnections) * 0.1 + (Math.random() * 5 - 2)),
        msgPerSec: Math.floor(prev.msgPerSec + (targetMsg - prev.msgPerSec) * 0.1 + (Math.random() * 20 - 10)),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [serverSize]);

  // Voice UDP Packets Loop
  useEffect(() => {
    if (!voiceConnected) return;

    const interval = setInterval(() => {
      const newPacket: Packet = {
        id: `voice-${packetIdCounter.current++}`,
        type: 'voice',
        path: [
          [NODES.CLIENT.x, NODES.CLIENT.y],
          [NODES.VOICE_ROUTER.x, NODES.VOICE_ROUTER.y]
        ],
        duration: 0.8,
        color: '#22c55e' // green-500
      };
      
      const replyPacket: Packet = {
        id: `voice-reply-${packetIdCounter.current++}`,
        type: 'voice',
        path: [
          [NODES.VOICE_ROUTER.x, NODES.VOICE_ROUTER.y],
          [NODES.CLIENT.x, NODES.CLIENT.y]
        ],
        duration: 0.8,
        color: '#4ade80' // green-400
      };

      setPackets(prev => [...prev.slice(-40), newPacket, replyPacket]);
      
      // Cleanup
      setTimeout(() => {
        setPackets(prev => prev.filter(p => p.id !== newPacket.id && p.id !== replyPacket.id));
      }, 1000);

    }, 300); // 300ms interval for continuous UDP flow

    return () => clearInterval(interval);
  }, [voiceConnected]);

  const simulateMessageFlow = () => {
    const isMassive = serverSize === 'massive';
    const fanOutSize = isMassive ? 30 : 4;
    const baseDuration = isMassive ? 0.3 : 0.6;
    
    const flowId = packetIdCounter.current++;
    
    // 1. Client to Gateway
    const p1: Packet = {
      id: `msg-${flowId}-1`,
      type: 'msg',
      path: [[NODES.CLIENT.x, NODES.CLIENT.y], [NODES.GATEWAY.x, NODES.GATEWAY.y]],
      duration: baseDuration,
      color: '#a855f7' // purple
    };

    setPackets(prev => [...prev, p1]);

    setTimeout(() => {
      setPackets(prev => prev.filter(p => p.id !== p1.id));
      
      // 2. Gateway to Guild Ring
      const p2: Packet = {
        id: `msg-${flowId}-2`,
        type: 'msg',
        path: [[NODES.GATEWAY.x, NODES.GATEWAY.y], [NODES.GUILD_RING.x, NODES.GUILD_RING.y]],
        duration: baseDuration,
        color: '#ec4899' // pink
      };
      setPackets(prev => [...prev, p2]);

      setTimeout(() => {
        setPackets(prev => prev.filter(p => p.id !== p2.id));

        // 3. Guild Ring to DBs (Persist & Presence)
        const p3: Packet = {
          id: `msg-${flowId}-3`,
          type: 'msg',
          path: [[NODES.GUILD_RING.x, NODES.GUILD_RING.y], [NODES.SCYLLA.x, NODES.SCYLLA.y]],
          duration: baseDuration,
          color: '#f97316' // orange
        };
        const p4: Packet = {
          id: `msg-${flowId}-4`,
          type: 'presence',
          path: [[NODES.GUILD_RING.x, NODES.GUILD_RING.y], [NODES.CASSANDRA.x, NODES.CASSANDRA.y]],
          duration: baseDuration,
          color: '#eab308' // yellow
        };
        
        setPackets(prev => [...prev, p3, p4]);

        setTimeout(() => {
          setPackets(prev => prev.filter(p => p.id !== p3.id && p.id !== p4.id));

          // 4. Guild Ring Fan-out to Gateway
          const fanOutToGateway: Packet[] = Array.from({ length: isMassive ? 5 : 1 }).map((_, i) => ({
            id: `msg-${flowId}-5-${i}`,
            type: 'msg',
            path: [[NODES.GUILD_RING.x, NODES.GUILD_RING.y], [NODES.GATEWAY.x + (Math.random()*10-5), NODES.GATEWAY.y]],
            duration: baseDuration,
            color: '#ec4899',
            delay: i * 0.05
          }));
          setPackets(prev => [...prev, ...fanOutToGateway]);

          setTimeout(() => {
            setPackets(prev => prev.filter(p => !fanOutToGateway.find(f => f.id === p.id)));

            // 5. Massive Fan-out to Clients
            const fanOutToClients: Packet[] = Array.from({ length: fanOutSize }).map((_, i) => ({
              id: `msg-${flowId}-6-${i}`,
              type: 'msg',
              path: [[NODES.GATEWAY.x, NODES.GATEWAY.y], [NODES.CLIENT.x + (Math.random()*40-20), NODES.CLIENT.y + (Math.random()*10-5)]],
              duration: baseDuration + Math.random() * 0.4,
              color: '#3b82f6', // blue
              delay: Math.random() * 0.2
            }));
            setPackets(prev => [...prev, ...fanOutToClients]);

            setTimeout(() => {
              setPackets(prev => prev.filter(p => !fanOutToClients.find(f => f.id === p.id)));
            }, (baseDuration + 0.6) * 1000);

          }, (baseDuration + (isMassive ? 0.25 : 0)) * 1000);

        }, baseDuration * 1000);

      }, baseDuration * 1000);
      
    }, baseDuration * 1000);
  };

  return (
    <div className="relative w-full h-[800px] bg-slate-950 text-slate-200 font-sans overflow-hidden rounded-2xl border border-slate-800 shadow-2xl flex flex-col">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      <Particles />

      {/* Top Header & Controls */}
      <div className="relative z-20 flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            Discord System Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time Fan-out & Voice Routing</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Server Size Toggle */}
          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setServerSize('small')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                serverSize === 'small' 
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Small Guild
            </button>
            <button
              onClick={() => setServerSize('massive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                serverSize === 'massive' 
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Massive Guild (Midjourney)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={simulateMessageFlow}
              className="group relative px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-semibold transition-all overflow-hidden flex items-center gap-2"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <IconMessageSquare className="w-4 h-4 text-pink-400" />
              Send Message
            </button>

            <button
              onClick={() => setVoiceConnected(!voiceConnected)}
              className={`px-5 py-2.5 border rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                voiceConnected 
                  ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              <IconMic className={`w-4 h-4 ${voiceConnected ? 'animate-pulse' : ''}`} />
              {voiceConnected ? 'Voice Connected' : 'Join Voice'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex-1 w-full h-full p-8">
        
        {/* Live Metrics Panel */}
        <motion.div 
          layout
          className="absolute top-6 left-6 z-20 w-64 p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-lg"
        >
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Live Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Active Users</span>
                <span className="text-blue-400 font-mono">{metrics.activeUsers.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metrics.activeUsers / 2000000) * 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>WS Connections</span>
                <span className="text-purple-400 font-mono">{metrics.wsConnections.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-purple-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metrics.wsConnections / 500000) * 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Messages / Sec</span>
                <span className="text-pink-400 font-mono">{metrics.msgPerSec.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-pink-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metrics.msgPerSec / 15000) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Network Connections (Static Lines) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-ws" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="grad-voice" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <line x1={`${NODES.CLIENT.x}%`} y1={`${NODES.CLIENT.y}%`} x2={`${NODES.GATEWAY.x}%`} y2={`${NODES.GATEWAY.y}%`} stroke="url(#grad-ws)" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={`${NODES.CLIENT.x}%`} y1={`${NODES.CLIENT.y}%`} x2={`${NODES.VOICE_ROUTER.x}%`} y2={`${NODES.VOICE_ROUTER.y}%`} stroke="url(#grad-voice)" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={`${NODES.GATEWAY.x}%`} y1={`${NODES.GATEWAY.y}%`} x2={`${NODES.GUILD_RING.x}%`} y2={`${NODES.GUILD_RING.y}%`} stroke="#ec4899" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={`${NODES.GUILD_RING.x}%`} y1={`${NODES.GUILD_RING.y}%`} x2={`${NODES.SCYLLA.x}%`} y2={`${NODES.SCYLLA.y}%`} stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={`${NODES.GUILD_RING.x}%`} y1={`${NODES.GUILD_RING.y}%`} x2={`${NODES.CASSANDRA.x}%`} y2={`${NODES.CASSANDRA.y}%`} stroke="#eab308" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Dynamic Packets */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {packets.map(packet => (
              <motion.div
                key={packet.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: packet.color,
                  boxShadow: `0 0 10px 2px ${packet.color}80`,
                  marginLeft: '-4px',
                  marginTop: '-4px'
                }}
                initial={{ 
                  left: `${packet.path[0][0]}%`, 
                  top: `${packet.path[0][1]}%`,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  left: `${packet.path[1][0]}%`, 
                  top: `${packet.path[1][1]}%`,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.5, 1, 0]
                }}
                transition={{ 
                  duration: packet.duration,
                  delay: packet.delay || 0,
                  ease: "easeInOut"
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Nodes */}
        {Object.entries(NODES).map(([key, node]) => {
          const Icon = node.icon;
          const isPulsing = (key === 'VOICE_ROUTER' && voiceConnected) || 
                            (key === 'GUILD_RING' && serverSize === 'massive');
                            
          return (
            <motion.div
              key={key}
              className={`absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`
                relative flex items-center justify-center w-16 h-16 rounded-xl border bg-slate-900/90 backdrop-blur-sm z-10
                ${node.border} ${node.glow}
              `}>
                <Icon className={`w-8 h-8 ${node.color}`} />
                
                {/* Active pulse effect */}
                {isPulsing && (
                  <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <span className="absolute inset-0 rounded-xl bg-current opacity-20 animate-ping" style={{ color: 'inherit' }} />
                  </span>
                )}
              </div>
              <div className="mt-3 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 backdrop-blur-md text-xs font-semibold text-slate-300 shadow-lg whitespace-nowrap z-20">
                {node.label}
              </div>
            </motion.div>
          );
        })}

        {/* Legend / Info box */}
        <div className="absolute bottom-6 right-6 p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-lg max-w-xs z-20">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Architecture Notes</h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 mt-0.5 shrink-0" />
              <span><strong>Gateway WS:</strong> Maintains persistent WebSocket connections to clients.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 mt-0.5 shrink-0" />
              <span><strong>Guild Ring:</strong> Erlang processes managing room state and message fan-out.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-0.5 shrink-0" />
              <span><strong>ScyllaDB:</strong> High-throughput message storage (Cassandra compatible).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 mt-0.5 shrink-0" />
              <span><strong>WebRTC:</strong> UDP packets route through custom Voice Routers.</span>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
}

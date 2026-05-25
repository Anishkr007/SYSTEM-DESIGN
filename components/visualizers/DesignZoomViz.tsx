"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Server, 
  Activity, Zap, Database, User, AlertTriangle 
} from 'lucide-react';

const AUDIO_KBPS = 50;
const VIDEO_KBPS = 1500;

interface MetricRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  warning?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, highlight, warning }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm text-slate-400">{label}</span>
    <span className={`text-sm font-mono font-medium ${highlight ? 'text-cyan-400' : warning ? 'text-red-400 font-bold flex items-center gap-1' : 'text-slate-100'}`}>
      {warning && <AlertTriangle size={14} />}
      {value}
    </span>
  </div>
);

export default function DesignZoomViz() {
  const [participants, setParticipants] = useState(5);
  const [mode, setMode] = useState<'sfu' | 'p2p'>('sfu');
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  const [latency, setLatency] = useState(45);
  const [cpuLoad, setCpuLoad] = useState(12);
  const [packetLoss, setPacketLoss] = useState(0);

  // Bandwidth Math
  const currentAudioKbps = audioOn ? AUDIO_KBPS : 0;
  const currentVideoKbps = videoOn ? VIDEO_KBPS : 0;
  const mediaPerClient = currentAudioKbps + currentVideoKbps;

  const sfuClientUp = mediaPerClient;
  const sfuClientDown = mediaPerClient * (participants - 1);
  const sfuServerUp = sfuClientDown * participants;
  const sfuServerDown = sfuClientUp * participants;

  const p2pClientUp = mediaPerClient * (participants - 1);
  const p2pClientDown = mediaPerClient * (participants - 1);

  const mediaConnections = mode === 'sfu' 
      ? participants 
      : (participants * (participants - 1)) / 2;

  // Simulate dynamic network metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const base = mode === 'sfu' ? 45 : 30;
        const congestionPenalty = mode === 'p2p' && p2pClientUp > 5000 ? Math.floor(Math.random() * 100) + 80 : 0;
        const jitter = Math.floor(Math.random() * 12) - 6;
        return Math.max(10, base + congestionPenalty + jitter);
      });

      setCpuLoad(prev => {
        const baseClientCpu = mode === 'sfu' ? 12 : 10 + (participants * 5);
        const jitter = Math.floor(Math.random() * 8) - 4;
        return Math.min(99, Math.max(5, baseClientCpu + jitter));
      });

      setPacketLoss(() => {
        if (mode === 'p2p' && p2pClientUp > 8000) return Math.floor(Math.random() * 5) + 1;
        if (mode === 'p2p' && p2pClientUp > 15000) return Math.floor(Math.random() * 10) + 5;
        return 0;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [mode, participants, p2pClientUp]);

  // Layout Math
  const clients = useMemo(() => {
    return Array.from({ length: participants }).map((_, i) => {
      const angle = (i * (360 / participants) - 90) * (Math.PI / 180);
      return {
        id: i,
        x: 500 + 280 * Math.cos(angle),
        y: 480 + 240 * Math.sin(angle),
      };
    });
  }, [participants]);

  const sfuLines = useMemo(() => {
    return clients.flatMap(client => {
      const dx = 500 - client.x;
      const dy = 500 - client.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const ox = nx * 6;
      const oy = ny * 6;

      return [
        {
          id: `video-${client.id}`,
          type: 'video',
          x1: client.x + ox, y1: client.y + oy,
          x2: 500 + ox, y2: 500 + oy,
          active: videoOn
        },
        {
          id: `audio-${client.id}`,
          type: 'audio',
          x1: client.x - ox, y1: client.y - oy,
          x2: 500 - ox, y2: 500 - oy,
          active: audioOn
        }
      ];
    });
  }, [clients, videoOn, audioOn]);

  const p2pLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < clients.length; i++) {
      for (let j = i + 1; j < clients.length; j++) {
        lines.push({
          id: `p2p-${clients[i].id}-${clients[j].id}`,
          x1: clients[i].x, y1: clients[i].y,
          x2: clients[j].x, y2: clients[j].y,
          active: videoOn || audioOn
        });
      }
    }
    return lines;
  }, [clients, videoOn, audioOn]);

  const formatBandwidth = (kbps: number) => {
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
    return `${kbps.toFixed(0)} Kbps`;
  };

  const isChoking = mode === 'p2p' && p2pClientUp > 5000;

  return (
    <div className="relative w-full min-h-[850px] bg-[#05050a] text-slate-200 overflow-hidden font-sans rounded-2xl border border-white/10 shadow-2xl flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes dash-flow {
            to { stroke-dashoffset: -28; }
        }
        .anim-flow {
            animation: dash-flow 0.8s linear infinite;
        }
        .anim-flow-slow {
            animation: dash-flow 2s linear infinite;
        }
        .glass-panel {
            background: rgba(15, 17, 26, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}} />

      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-900" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid)" />
        </svg>
      </div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main SVG Visualization Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg viewBox="0 0 1000 800" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          
          {/* Static Infrastructure Lines */}
          <line x1={200} y1={120} x2={800} y2={120} stroke="#a855f7" strokeWidth="2" strokeDasharray="6 6" className="anim-flow-slow opacity-40" />

          {/* Signaling Lines */}
          <AnimatePresence>
            {clients.map(client => (
              <motion.line
                key={`sig-${client.id}`}
                initial={{ opacity: 0 }}
                animate={{ x1: client.x, y1: client.y, x2: 850, y2: 120, opacity: 0.3 }}
                exit={{ opacity: 0 }}
                stroke="#ec4899"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="anim-flow-slow"
                transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
              />
            ))}
          </AnimatePresence>

          {/* P2P Lines */}
          {mode === 'p2p' && p2pLines.map(line => (
            <motion.line
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, opacity: line.active ? 0.6 : 0.1 }}
              stroke={videoOn ? '#06b6d4' : (audioOn ? '#10b981' : '#475569')}
              strokeWidth={line.active ? 1.5 : 1}
              strokeDasharray={line.active ? "8 6" : "0"}
              className={line.active && !isChoking ? "anim-flow" : ""}
              transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
            />
          ))}

          {/* SFU Lines */}
          {mode === 'sfu' && sfuLines.map(line => (
            <motion.line
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, opacity: line.active ? 0.8 : 0.15 }}
              stroke={line.type === 'video' ? '#06b6d4' : '#10b981'}
              strokeWidth={line.active ? (line.type === 'video' ? 3 : 2) : 1}
              strokeDasharray={line.active ? "8 6" : "0"}
              className={line.active ? "anim-flow" : ""}
              transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
            />
          ))}

          {/* Nodes (using foreignObject for HTML rendering inside SVG) */}
          
          {/* Meeting DB */}
          <foreignObject x={150 - 60} y={120 - 45} width={120} height={90}>
            <div className="w-full h-full rounded-xl bg-purple-950/60 border border-purple-500/50 flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Database size={28} className="text-purple-400 mb-1" />
              <span className="text-[11px] text-purple-200 text-center leading-tight font-bold">Meeting<br/>DB</span>
            </div>
          </foreignObject>

          {/* Zone Controller */}
          <foreignObject x={850 - 60} y={120 - 45} width={120} height={90}>
            <div className="w-full h-full rounded-xl bg-pink-950/60 border border-pink-500/50 flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-pink-500/10 animate-pulse"></div>
              <Activity size={28} className="text-pink-400 mb-1 relative z-10" />
              <span className="text-[11px] text-pink-200 text-center leading-tight font-bold relative z-10">Zone<br/>Controller</span>
            </div>
          </foreignObject>

          {/* SFU Server */}
          <AnimatePresence>
            {mode === 'sfu' && (
              <motion.foreignObject 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: 500 - 55, y: 500 - 55 }}
                exit={{ scale: 0, opacity: 0 }}
                width={110} height={110}
              >
                <div className="w-full h-full rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.4)] z-20">
                  <div className="absolute inset-0 bg-cyan-400/10 animate-pulse rounded-xl"></div>
                  <Server size={36} className="text-cyan-400 drop-shadow-md z-10" />
                  <span className="text-[12px] text-cyan-100 mt-2 font-bold z-10">SFU MMR</span>
                  <span className="text-[9px] text-cyan-300 z-10 font-mono mt-0.5">PORT 10000</span>
                </div>
              </motion.foreignObject>
            )}
          </AnimatePresence>

          {/* Clients */}
          <AnimatePresence>
            {clients.map((c, i) => (
              <motion.foreignObject
                key={`client-${c.id}`}
                initial={{ opacity: 0, scale: 0, x: 500 - 25, y: 500 - 25 }}
                animate={{ opacity: 1, scale: 1, x: c.x - 28, y: c.y - 28 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                width={56} height={56}
              >
                <div className={`w-full h-full rounded-full bg-slate-900 flex items-center justify-center relative transition-all duration-500 z-10
                  ${i === 0 && audioOn ? 'border-2 border-green-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'border border-slate-600 shadow-lg'}
                `}>
                  <User size={24} className={i === 0 && audioOn ? "text-green-400" : "text-slate-300"} />
                  {!videoOn && (
                    <div className="absolute -top-1 -right-1 bg-slate-800 border border-red-500 rounded-full p-1 z-20">
                      <VideoOff size={10} className="text-red-500" />
                    </div>
                  )}
                  {!audioOn && (
                    <div className="absolute -bottom-1 -right-1 bg-slate-800 border border-red-500 rounded-full p-1 z-20">
                      <MicOff size={10} className="text-red-500" />
                    </div>
                  )}
                </div>
              </motion.foreignObject>
            ))}
          </AnimatePresence>
        </svg>
      </div>

      {/* Overlay UI - Top/Left Panels */}
      <div className="absolute top-6 left-6 w-80 flex flex-col gap-4 z-20 pointer-events-auto">
        <div className="glass-panel rounded-2xl p-5 shadow-2xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            Live Network Stats
          </h3>
          
          <div className="space-y-1">
            <MetricRow label="Architecture" value={mode === 'sfu' ? 'SFU Star' : 'Full Mesh (P2P)'} highlight />
            <MetricRow label="Media Edges" value={mediaConnections} />
            <MetricRow label="Avg Latency" value={`${latency} ms`} warning={latency > 100} />
            <MetricRow label="Client CPU" value={`${cpuLoad}%`} warning={cpuLoad > 80} />
            {packetLoss > 0 && <MetricRow label="Packet Loss" value={`${packetLoss}%`} warning />}
            
            <div className="h-px w-full bg-white/10 my-3" />
            
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Per-Client Limits</div>
            <MetricRow 
              label="Upload Load" 
              value={formatBandwidth(mode === 'sfu' ? sfuClientUp : p2pClientUp)} 
              warning={isChoking} 
            />
            <MetricRow 
              label="Download Load" 
              value={formatBandwidth(mode === 'sfu' ? sfuClientDown : p2pClientDown)} 
            />
            
            {mode === 'sfu' && (
              <>
                <div className="h-px w-full bg-white/10 my-3" />
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">SFU Server Load</div>
                <MetricRow label="Ingress (Total In)" value={formatBandwidth(sfuServerDown)} />
                <MetricRow label="Egress (Total Out)" value={formatBandwidth(sfuServerUp)} />
              </>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="glass-panel rounded-2xl p-4 shadow-xl">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Data Streams</h4>
          <div className="space-y-3 text-xs font-medium">
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div> 
              <span>Video (UDP)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-green-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> 
              <span>Audio (UDP)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-0 border-t-2 border-dashed border-pink-500"></div> 
              <span>Signaling (WSS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Panel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel p-6 rounded-3xl flex flex-col gap-6 min-w-[600px] shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20 pointer-events-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="text-cyan-400" size={20} />
            Meeting Simulator
          </h3>
          <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'sfu' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setMode('sfu')}
            >
              SFU Router Mode
            </button>
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'p2p' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setMode('p2p')}
            >
              Mesh P2P Mode
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-[1fr_auto] gap-10 items-center">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Users size={16} /> Participants
              </label>
              <span className="text-cyan-400 font-mono font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">
                {participants} Users
              </span>
            </div>
            <input 
              type="range" 
              min="2" max="15" 
              value={participants} 
              onChange={e => setParticipants(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {mode === 'sfu' 
                ? "SFU scales linearly O(N). The server multiplexes streams, keeping client upload low."
                : "P2P scales quadratically O(N²). Each client uploads to everyone else, rapidly choking connection."}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setVideoOn(!videoOn)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 w-24 ${videoOn ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:bg-cyan-500/20' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
            >
              {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
              <span className="text-[10px] font-bold uppercase tracking-wider">{videoOn ? 'Cam On' : 'Cam Off'}</span>
            </button>
            <button 
              onClick={() => setAudioOn(!audioOn)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 w-24 ${audioOn ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
            >
              {audioOn ? <Mic size={24} /> : <MicOff size={24} />}
              <span className="text-[10px] font-bold uppercase tracking-wider">{audioOn ? 'Mic On' : 'Mic Muted'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

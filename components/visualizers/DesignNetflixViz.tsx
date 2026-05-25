"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (Inline SVGs to guarantee zero dependencies) ---
const IconServer = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
const IconPlay = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconPause = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IconActivity = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconDatabase = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconShield = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconSmartphone = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IconAlert = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

// --- Types ---
type VideoQuality = '4K' | '1080p' | '720p' | '480p';
type FlowStage = 'idle' | 'auth' | 'drm' | 'find_oca' | 'streaming';

interface OcaNode {
  id: string;
  location: string;
  status: 'active' | 'failed';
  load: number;
}

interface Packet {
  id: number;
  from: keyof typeof nodesConfig;
  to: keyof typeof nodesConfig;
  color: string;
  label?: string;
}

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

// --- Constants ---
const nodesConfig = {
  client: { x: 15, y: 60, label: "Client Player", icon: IconSmartphone },
  aws_auth: { x: 40, y: 18, label: "Auth Service", icon: IconShield },
  aws_drm: { x: 60, y: 18, label: "DRM Service", icon: IconServer },
  aws_route: { x: 80, y: 18, label: "Routing API", icon: IconActivity },
  oca_1: { x: 82.5, y: 50, label: "OCA - US East", icon: IconDatabase },
  oca_2: { x: 82.5, y: 70, label: "OCA - US West", icon: IconDatabase },
  oca_3: { x: 82.5, y: 90, label: "OCA - EU Central", icon: IconDatabase },
};

export default function DesignNetflixViz() {
  const [isMounted, setIsMounted] = useState(false);

  // Core State
  const [isPlaying, setIsPlaying] = useState(false);
  const [networkSpeed, setNetworkSpeed] = useState(60); // Mbps
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('1080p');
  const [bufferLevel, setBufferLevel] = useState(0); // 0 to 100
  const [flowStage, setFlowStage] = useState<FlowStage>('idle');
  const [activeOca, setActiveOca] = useState<string | null>(null);
  const [ocaNodes, setOcaNodes] = useState<OcaNode[]>([
    { id: 'oca_1', location: 'US East', status: 'active', load: 30 },
    { id: 'oca_2', location: 'US West', status: 'active', load: 45 },
    { id: 'oca_3', location: 'EU Central', status: 'active', load: 20 },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [packets, setPackets] = useState<Packet[]>([]);

  // Refs for stable intervals
  const isPlayingRef = useRef(false);
  const packetIdRef = useRef(0);
  const ocaNodesRef = useRef(ocaNodes);
  const stateRefs = useRef({ networkSpeed, videoQuality, activeOca });
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync refs
  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { ocaNodesRef.current = ocaNodes; }, [ocaNodes]);
  useEffect(() => { stateRefs.current = { networkSpeed, videoQuality, activeOca }; }, [networkSpeed, videoQuality, activeOca]);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  // Logging Utility
  const addLog = useCallback((message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    setLogs(prev => {
      const newLogs = [{
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message,
        type
      }, ...prev].slice(0, 40);
      return newLogs;
    });
  }, []);

  // Packet Animation Utility
  const spawnPacket = useCallback((from: keyof typeof nodesConfig, to: keyof typeof nodesConfig, color: string, label: string = '') => {
    const newPacket: Packet = { id: ++packetIdRef.current, from, to, color, label };
    setPackets(prev => [...prev, newPacket]);
    setTimeout(() => {
      setPackets(prev => prev.filter(p => p.id !== newPacket.id));
    }, 1000);
  }, []);

  // Failover Logic
  const triggerFailover = useCallback(async (isInitial = false) => {
    if (!isPlayingRef.current) return;
    setFlowStage('find_oca');
    
    addLog(isInitial ? 'Requesting optimal OCA from Control Plane...' : 'Requesting new OCA assignment from Control Plane...', 'info');
    spawnPacket('client', 'aws_route', '#a855f7', 'Route Req');
    
    await new Promise(r => setTimeout(r, 1000));
    if (!isPlayingRef.current) return;
    
    const availableOcas = ocaNodesRef.current.filter(n => n.status === 'active');
    
    if (availableOcas.length === 0) {
       addLog('FATAL: All OCA nodes are offline!', 'error');
       setIsPlaying(false);
       isPlayingRef.current = false;
       setFlowStage('idle');
       return;
    }
    
    const selectedOca = availableOcas[0].id;
    setActiveOca(selectedOca);
    spawnPacket('aws_route', 'client', '#22c55e', 'OCA IP');
    addLog(isInitial ? `Routed to OCA: ${availableOcas[0].location}` : `Failover successful. Routed to OCA: ${availableOcas[0].location}`, 'success');
    
    await new Promise(r => setTimeout(r, 500));
    if (!isPlayingRef.current) return;
    setFlowStage('streaming');
    if (isInitial) addLog('Started streaming from Open Connect.', 'success');
  }, [addLog, spawnPacket]);

  // Initial Playback Flow
  const runInitialFlow = async () => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    setFlowStage('auth');
    addLog('Client requesting playback...', 'info');
    spawnPacket('client', 'aws_auth', '#3b82f6', 'Auth Req');
    
    await new Promise(r => setTimeout(r, 1000));
    if (!isPlayingRef.current) return;
    spawnPacket('aws_auth', 'client', '#22c55e', 'Token');
    addLog('User authenticated.', 'success');
    setFlowStage('drm');
    
    await new Promise(r => setTimeout(r, 800));
    if (!isPlayingRef.current) return;
    spawnPacket('client', 'aws_drm', '#eab308', 'DRM Req');
    
    await new Promise(r => setTimeout(r, 1000));
    if (!isPlayingRef.current) return;
    spawnPacket('aws_drm', 'client', '#22c55e', 'License');
    addLog('DRM License acquired.', 'success');
    
    triggerFailover(true);
  };

  // User Actions
  const handleTogglePlay = () => {
    if (isPlaying) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setFlowStage('idle');
        addLog('Playback stopped by user.', 'warn');
        setActiveOca(null);
        setBufferLevel(0);
        setPackets([]);
    } else {
        runInitialFlow();
    }
  };

  const handleFailOca = (id: string) => {
    setOcaNodes(prev => {
        const next = prev.map(n => n.id === id ? { ...n, status: 'failed' as const } : n);
        ocaNodesRef.current = next;
        return next;
    });
    addLog(`Simulated failure of OCA node: ${id}`, 'warn');
  };

  const handleRecoverOca = (id: string) => {
    setOcaNodes(prev => {
        const next = prev.map(n => n.id === id ? { ...n, status: 'active' as const } : n);
        ocaNodesRef.current = next;
        return next;
    });
    addLog(`Recovered OCA node: ${id}`, 'success');
  };

  // Streaming Interval (Data & Buffer simulation)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (flowStage === 'streaming' && isPlaying) {
      interval = setInterval(() => {
        const { networkSpeed: currentSpeed, videoQuality: currentQuality, activeOca: currentOca } = stateRefs.current;
        const activeNode = ocaNodesRef.current.find(n => n.id === currentOca);
        
        // Check for node failure during stream
        if (activeNode && activeNode.status === 'failed') {
            addLog(`Active OCA (${activeNode.location}) went offline! Connection lost.`, 'error');
            setActiveOca(null);
            triggerFailover();
            return;
        }

        // Spawn visual data chunks
        if (currentOca && Math.random() > 0.3) {
            spawnPacket(currentOca as keyof typeof nodesConfig, 'client', '#ec4899');
        }
        
        // Calculate buffer consumption based on quality
        const consumptionMap: Record<VideoQuality, number> = { '4K': 40, '1080p': 15, '720p': 5, '480p': 2 };
        const consumption = consumptionMap[currentQuality];
        
        setBufferLevel(prev => {
            let change = (currentSpeed - consumption) * 0.2;
            change += (Math.random() - 0.5) * 1.5; // add visual jitter
            return Math.max(0, Math.min(100, prev + change));
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [flowStage, isPlaying, addLog, triggerFailover, spawnPacket]);

  // ABR (Adaptive Bitrate) Decision Maker
  useEffect(() => {
      if (flowStage !== 'streaming' || !isPlaying) return;
      
      let targetQuality: VideoQuality = '4K';
      if (networkSpeed < 10) targetQuality = '480p';
      else if (networkSpeed < 25) targetQuality = '720p';
      else if (networkSpeed < 50) targetQuality = '1080p';

      if (bufferLevel < 20) {
        if (videoQuality === '4K') { setVideoQuality('1080p'); addLog('Downgrading to 1080p to prevent stalling.', 'warn'); }
        else if (videoQuality === '1080p') { setVideoQuality('720p'); addLog('Downgrading to 720p to prevent stalling.', 'warn'); }
        else if (videoQuality === '720p') { setVideoQuality('480p'); addLog('Downgrading to 480p to prevent stalling.', 'warn'); }
      } else if (bufferLevel > 70) {
        if (videoQuality === '480p' && targetQuality !== '480p') { setVideoQuality('720p'); addLog('Network stable. Upgrading to 720p.', 'success'); }
        else if (videoQuality === '720p' && ['1080p', '4K'].includes(targetQuality)) { setVideoQuality('1080p'); addLog('Network stable. Upgrading to 1080p.', 'success'); }
        else if (videoQuality === '1080p' && targetQuality === '4K') { setVideoQuality('4K'); addLog('Network stable. Upgrading to 4K.', 'success'); }
      }
  }, [bufferLevel, networkSpeed, videoQuality, flowStage, isPlaying, addLog]);

  const isNodeActive = (id: string) => {
    if (id === 'client') return isPlaying;
    if (id === 'aws_auth') return flowStage === 'auth';
    if (id === 'aws_drm') return flowStage === 'drm';
    if (id === 'aws_route') return flowStage === 'find_oca';
    if (id.startsWith('oca')) return activeOca === id && flowStage === 'streaming';
    return false;
  };

  if (!isMounted) return <div className="w-full h-[800px] bg-[#09090b] animate-pulse rounded-2xl" />;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[1000px] h-[800px] bg-[#09090b] text-white flex flex-col font-sans border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Top Control Header */}
        <div className="h-20 bg-white/5 border-b border-white/10 flex items-center px-6 justify-between shrink-0 z-20 relative backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
                <IconPlay className="w-6 h-6 text-red-500" fill="currentColor" />
                </div>
                <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Netflix System Design</h2>
                <div className="text-xs text-gray-400">Interactive Content Delivery Architecture</div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2 w-64 bg-gray-950/50 p-2.5 rounded-lg border border-white/10 shadow-inner">
                    <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-400">Client Network Speed</span>
                        <span className={networkSpeed < 25 ? 'text-yellow-400' : 'text-blue-400'}>{networkSpeed} Mbps</span>
                    </div>
                    <input 
                        type="range" 
                        min="2" max="100" 
                        value={networkSpeed}
                        onChange={(e) => setNetworkSpeed(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Poor (Edge)</span>
                        <span>Excellent (Fiber)</span>
                    </div>
                </div>

                <button 
                    onClick={handleTogglePlay}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg ${
                        isPlaying 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30'
                    }`}
                >
                    {isPlaying ? <IconPause className="w-5 h-5" /> : <IconPlay className="w-5 h-5" />}
                    {isPlaying ? 'Stop Playback' : 'Request Playback'}
                </button>
            </div>
        </div>
        
        {/* Main Visualization Area */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#09090b] to-[#09090b]">
            
            {/* Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-indigo-500/50 rounded-full"
                        initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }}
                        animate={{ y: [null, `${Math.random() * 100}%`], opacity: [null, Math.random() * 0.5 + 0.2, 0] }}
                        transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
                    />
                ))}
            </div>

            {/* Region Zones */}
            <div className="absolute border border-indigo-500/20 bg-indigo-500/5 rounded-2xl z-0" style={{ left: '30%', top: '8%', width: '60%', height: '22%' }}>
                <div className="absolute top-2 left-4 text-xs font-bold text-indigo-400/50 uppercase tracking-widest">AWS Control Plane</div>
            </div>
            <div className="absolute border border-pink-500/20 bg-pink-500/5 rounded-2xl z-0" style={{ left: '70%', top: '38%', width: '25%', height: '55%' }}>
                <div className="absolute top-2 left-4 text-xs font-bold text-pink-400/50 uppercase tracking-widest">Open Connect (CDN)</div>
            </div>

            {/* Connection Lines (SVG) */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50">
                <defs>
                    <linearGradient id="control-plane" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="data-plane" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8"/>
                    </linearGradient>
                </defs>

                {/* Control Plane Paths */}
                <path d={`M ${nodesConfig.client.x} ${nodesConfig.client.y} L ${nodesConfig.aws_auth.x} ${nodesConfig.aws_auth.y}`} vectorEffect="non-scaling-stroke" stroke="url(#control-plane)" strokeWidth="2" fill="none" strokeDasharray="5 5" />
                <path d={`M ${nodesConfig.client.x} ${nodesConfig.client.y} L ${nodesConfig.aws_drm.x} ${nodesConfig.aws_drm.y}`} vectorEffect="non-scaling-stroke" stroke="url(#control-plane)" strokeWidth="2" fill="none" strokeDasharray="5 5" />
                <path d={`M ${nodesConfig.client.x} ${nodesConfig.client.y} L ${nodesConfig.aws_route.x} ${nodesConfig.aws_route.y}`} vectorEffect="non-scaling-stroke" stroke="url(#control-plane)" strokeWidth="2" fill="none" strokeDasharray="5 5" />
                
                {/* Data Plane Paths */}
                <path d={`M ${nodesConfig.client.x} ${nodesConfig.client.y} L ${nodesConfig.oca_1.x} ${nodesConfig.oca_1.y}`} vectorEffect="non-scaling-stroke" stroke="url(#data-plane)" strokeWidth={activeOca === 'oca_1' ? 4 : 1} fill="none" opacity={activeOca === 'oca_1' ? 1 : 0.2} />
                <path d={`M ${nodesConfig.client.x} ${nodesConfig.client.y} L ${nodesConfig.oca_2.x} ${nodesConfig.oca_2.y}`} vectorEffect="non-scaling-stroke" stroke="url(#data-plane)" strokeWidth={activeOca === 'oca_2' ? 4 : 1} fill="none" opacity={activeOca === 'oca_2' ? 1 : 0.2} />
                <path d={`M ${nodesConfig.client.x} ${nodesConfig.client.y} L ${nodesConfig.oca_3.x} ${nodesConfig.oca_3.y}`} vectorEffect="non-scaling-stroke" stroke="url(#data-plane)" strokeWidth={activeOca === 'oca_3' ? 4 : 1} fill="none" opacity={activeOca === 'oca_3' ? 1 : 0.2} />
            </svg>

            {/* Packets */}
            <AnimatePresence>
                {packets.map(p => {
                    const from = nodesConfig[p.from];
                    const to = nodesConfig[p.to];
                    return (
                        <motion.div
                            key={p.id}
                            initial={{ left: `${from.x}%`, top: `${from.y}%`, opacity: 0 }}
                            animate={{ left: `${to.x}%`, top: `${to.y}%`, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="absolute z-50 pointer-events-none flex items-center justify-center"
                            style={{ transform: 'translate(-50%, -50%)' }}
                        >
                            {p.label ? (
                                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-[0_0_15px_currentColor] border border-white/20 backdrop-blur-md"
                                    style={{ backgroundColor: `${p.color}20`, color: p.color, textShadow: '0 0 5px currentColor' }}>
                                    {p.label}
                                </div>
                            ) : (
                                <div className="w-3 h-3 rounded-full shadow-[0_0_15px_currentColor]"
                                    style={{ backgroundColor: p.color, boxShadow: `0 0 20px ${p.color}` }} />
                            )}
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {/* Client Node */}
            <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-56 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden flex flex-col z-20"
                style={{ left: `${nodesConfig.client.x}%`, top: `${nodesConfig.client.y}%` }}
            >
                <div className="relative w-full h-32 bg-gray-950 flex items-center justify-center border-b border-white/10 overflow-hidden">
                    {isPlaying && flowStage === 'streaming' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div 
                                animate={{ background: ['linear-gradient(45deg, #1e1b4b, #312e81)', 'linear-gradient(45deg, #312e81, #1e1b4b)', 'linear-gradient(45deg, #1e1b4b, #312e81)'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full absolute inset-0 opacity-80"
                            />
                            {bufferLevel === 0 ? (
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin relative z-10 shadow-lg" />
                            ) : (
                                <IconPlay className="w-12 h-12 text-white/50 relative z-10 drop-shadow-lg" fill="currentColor" />
                            )}
                        </div>
                    ) : (
                        <IconSmartphone className="w-12 h-12 text-gray-700" />
                    )}
                    
                    <div className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] rounded font-bold border backdrop-blur-md ${
                        videoQuality === '4K' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                        videoQuality === '1080p' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' :
                        videoQuality === '720p' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                        'bg-red-500/20 text-red-300 border-red-500/50'
                    }`}>
                        {videoQuality}
                    </div>
                </div>

                <div className="p-3 bg-gray-900/80 text-xs flex flex-col gap-2">
                    <div>
                        <div className="flex justify-between items-center text-gray-400 mb-1">
                            <span>Playback Buffer</span>
                            <span className={bufferLevel < 20 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                {(bufferLevel * 0.3).toFixed(1)}s
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden border border-gray-700">
                            <div className={`h-full transition-all duration-300 ${bufferLevel < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${bufferLevel}%` }} />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-400 mt-1 bg-black/40 px-2 py-1.5 rounded border border-white/5">
                        <span>Bandwidth</span>
                        <span className={networkSpeed < 20 ? 'text-yellow-400 font-bold' : 'text-blue-400 font-bold'}>
                            {networkSpeed} Mbps
                        </span>
                    </div>
                </div>
            </div>

            {/* Other Nodes */}
            {Object.entries(nodesConfig).filter(([id]) => id !== 'client').map(([id, config]) => {
                const nodeData = ocaNodes.find(n => n.id === id);
                const status = nodeData?.status || 'active';
                const isActive = isNodeActive(id);
                const IconComponent = config.icon;
                
                return (
                    <div key={id} 
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-300 z-10
                            ${status === 'failed' ? 'opacity-50 grayscale' : ''}
                        `}
                        style={{ left: `${config.x}%`, top: `${config.y}%` }}
                    >
                        <div className={`relative p-4 rounded-2xl border shadow-lg backdrop-blur-md 
                            ${isActive ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.4)]' : 'bg-gray-900/80 border-white/10'}
                            ${status === 'failed' ? '!bg-red-950/80 !border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}
                        `}>
                            <IconComponent className={`w-8 h-8 
                                ${isActive ? 'text-indigo-400' : 'text-gray-400'} 
                                ${status === 'failed' ? '!text-red-500' : ''}
                            `} />
                            {isActive && <div className="absolute inset-0 rounded-2xl animate-ping border-2 border-indigo-400/50 opacity-50" />}
                        </div>
                        
                        <div className="text-xs font-semibold text-gray-200 bg-gray-950/90 px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-xl">
                            {config.label}
                        </div>
                        
                        {id.startsWith('oca') && (
                            <div className="absolute top-0 -right-24 flex gap-1">
                                {status === 'active' ? (
                                    <button onClick={() => handleFailOca(id)} className="flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] px-2 py-1.5 rounded-md border border-red-500/30 hover:bg-red-500/30 transition-colors uppercase tracking-wider font-bold">
                                        <IconAlert className="w-3 h-3" /> Fail
                                    </button>
                                ) : (
                                    <button onClick={() => handleRecoverOca(id)} className="flex items-center gap-1 bg-green-500/10 text-green-400 text-[10px] px-2 py-1.5 rounded-md border border-green-500/30 hover:bg-green-500/30 transition-colors uppercase tracking-wider font-bold">
                                        Recover
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
        
        {/* Logs Panel */}
        <div className="h-48 bg-[#050505] border-t border-white/10 p-4 overflow-y-auto font-mono text-sm shrink-0 z-20 flex flex-col gap-1.5 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 bg-[#050505] pb-2 text-xs text-gray-500 uppercase tracking-widest border-b border-white/10 flex justify-between">
                <span>System Events</span>
                <span className="text-indigo-500/50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/> LIVE MONITORING</span>
            </div>
            
            {logs.slice().reverse().map(log => (
                <div key={log.id} className="flex items-start gap-3 border-b border-white/5 pb-1 hover:bg-white/5 px-1 rounded transition-colors">
                    <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                    <span className={`
                        ${log.type === 'info' ? 'text-blue-400' : ''}
                        ${log.type === 'warn' ? 'text-yellow-400' : ''}
                        ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                        ${log.type === 'success' ? 'text-emerald-400' : ''}
                    `}>
                        {log.message}
                    </span>
                </div>
            ))}
            <div ref={logsEndRef} className="h-1" />
        </div>

      </div>
    </div>
  );
}

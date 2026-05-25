"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Server, Box, Layers, Play, Square, Download, Settings, Cpu, HardDrive, Network, Cloud, Hammer, XCircle
} from 'lucide-react';

type Tab = 'architecture' | 'comparison' | 'lifecycle';

interface Log {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface DockerImage {
  id: string;
  name: string;
  size: string;
  layers: number;
}

interface DockerContainer {
  id: string;
  name: string;
  imageId: string;
  imageName: string;
  status: 'running' | 'exited';
  cpu: number;
  mem: number;
}

const glassStyle = "bg-[#101018]/80 backdrop-blur-md border border-[#00f0ff]/20 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-xl";

export default function DockerViz() {
  const [activeTab, setActiveTab] = useState<Tab>('lifecycle');
  const [logs, setLogs] = useState<Log[]>([
    { id: '1', time: new Date().toLocaleTimeString([], { hour12: false }), message: 'Docker daemon started.', type: 'success' }
  ]);
  const [images, setImages] = useState<DockerImage[]>([
    { id: 'img-node', name: 'node:18-alpine', size: '175MB', layers: 4 }
  ]);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  
  const [isPulling, setIsPulling] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: Log['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    }]);
  };

  // Simulate container metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prev => prev.map(c => {
        if (c.status === 'running') {
          return {
            ...c,
            cpu: Math.max(0, Math.min(100, c.cpu + (Math.random() * 10 - 5))),
            mem: Math.max(10, Math.min(1024, c.mem + (Math.random() * 50 - 25))),
          };
        }
        return c;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePull = async () => {
    if (isPulling) return;
    setIsPulling(true);
    addLog('> docker pull ubuntu:latest', 'info');
    await new Promise(r => setTimeout(r, 600));
    addLog('latest: Pulling from library/ubuntu', 'info');
    
    const layerIds = ['e4c3d3e4f7b0', '1b2c3d4e5f6a'];
    for (const layer of layerIds) {
      await new Promise(r => setTimeout(r, 800));
      addLog(`${layer}: Pull complete`, 'success');
    }
    
    await new Promise(r => setTimeout(r, 500));
    addLog('Digest: sha256:abcdef1234567890', 'info');
    addLog('Status: Downloaded newer image for ubuntu:latest', 'success');
    
    setImages(prev => [...prev, { id: 'img-ubuntu', name: 'ubuntu:latest', size: '72MB', layers: 2 }]);
    setIsPulling(false);
  };

  const handleBuild = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    addLog('> docker build -t my-app:v1 .', 'info');
    
    const steps = [
      'Step 1/4 : FROM node:18-alpine',
      'Step 2/4 : WORKDIR /app',
      'Step 3/4 : COPY . .',
      'Step 4/4 : RUN npm install'
    ];
    
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 700));
      addLog(step, 'info');
    }
    
    await new Promise(r => setTimeout(r, 600));
    addLog('Successfully built 8a9b0c1d2e3f', 'success');
    addLog('Successfully tagged my-app:v1', 'success');
    
    setImages(prev => [...prev, { id: 'img-myapp', name: 'my-app:v1', size: '210MB', layers: 5 }]);
    setIsBuilding(false);
  };

  const handleRun = async (image: DockerImage) => {
    addLog(`> docker run -d ${image.name}`, 'info');
    await new Promise(r => setTimeout(r, 400));
    const containerId = Math.random().toString(16).substring(2, 14);
    addLog(containerId, 'success');
    
    setContainers(prev => [...prev, {
      id: containerId,
      name: `wizardly_bassi_${Math.floor(Math.random()*100)}`,
      imageId: image.id,
      imageName: image.name,
      status: 'running',
      cpu: Math.random() * 5,
      mem: Math.random() * 50 + 20
    }]);
  };

  const handleStop = (id: string) => {
    addLog(`> docker stop ${id.substring(0, 12)}`, 'info');
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'exited', cpu: 0, mem: 0 } : c));
  };

  const handleRm = (id: string) => {
    addLog(`> docker rm ${id.substring(0, 12)}`, 'info');
    setContainers(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 p-4 sm:p-8 font-sans selection:bg-cyan-500/30 flex flex-col">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Box className="w-10 h-10 text-cyan-400" />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-cyan-400/30 rounded-lg border-dashed"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Docker Architecture
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Interactive Virtualization</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#161622] rounded-lg p-1 border border-slate-800 shadow-inner">
          {(['architecture', 'comparison', 'lifecycle'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'comparison' && <ComparisonView key="comparison" />}
          {activeTab === 'architecture' && <ArchitectureView key="architecture" />}
          {activeTab === 'lifecycle' && (
            <LifecycleView 
              key="lifecycle"
              logs={logs}
              images={images}
              containers={containers}
              isPulling={isPulling}
              isBuilding={isBuilding}
              onPull={handlePull}
              onBuild={handleBuild}
              onRun={handleRun}
              onStop={handleStop}
              onRm={handleRm}
              logsEndRef={logsEndRef}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// --- Subcomponents ---

const ComparisonView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col lg:flex-row gap-8"
    >
      {/* VM Card */}
      <div className={`flex-1 ${glassStyle} p-6 flex flex-col`}>
        <h2 className="text-xl font-semibold text-purple-400 mb-6 flex items-center gap-2">
          <Server className="w-5 h-5" /> Virtual Machines
        </h2>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-4 mb-4 h-48">
            {[1,2].map(i => (
              <div key={i} className="flex-1 border border-purple-500/30 rounded-lg p-3 bg-purple-500/5 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
                <div className="text-center font-medium text-purple-300 text-sm border-b border-purple-500/30 pb-1">App {i}</div>
                <div className="bg-slate-800/80 rounded p-2 text-xs text-center border border-slate-700">Bins/Libs</div>
                <div className="flex-1 bg-red-900/30 rounded p-2 text-xs text-center border border-red-500/30 flex items-center justify-center text-red-300 font-semibold shadow-[0_0_10px_rgba(239,68,68,0.2)_inset]">
                  Guest OS <br/>(Heavy)
                </div>
              </div>
            ))}
          </div>
          <div className="bg-purple-900/30 border border-purple-500/40 rounded p-3 text-center text-purple-300 font-medium">
            Hypervisor
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center text-slate-400">
            Host OS
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded p-3 text-center text-slate-500 shadow-inner">
            Server Infrastructure
          </div>
        </div>
      </div>

      {/* Container Card */}
      <div className={`flex-1 ${glassStyle} p-6 flex flex-col`}>
        <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
          <Box className="w-5 h-5" /> Containers
        </h2>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-4 mb-4 h-48">
            {[1,2,3].map(i => (
              <div key={i} className="flex-1 border border-cyan-500/30 rounded-lg p-3 bg-cyan-500/5 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
                <div className="flex-1 flex flex-col justify-center gap-2">
                  <div className="text-center font-medium text-cyan-300 text-sm border-b border-cyan-500/30 pb-1">App {i}</div>
                  <div className="bg-slate-800/80 rounded p-2 text-xs text-center border border-slate-700">Bins/Libs</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-cyan-900/30 border border-cyan-500/40 rounded p-3 text-center text-cyan-300 font-medium relative overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.2)]">
             <motion.div 
               animate={{ x: ['-100%', '300%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 bottom-0 w-1/4 bg-cyan-400/20 blur-xl skew-x-12"
             />
             Docker Engine
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center text-slate-400">
            Host OS (Shared Kernel)
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded p-3 text-center text-slate-500 shadow-inner">
            Server Infrastructure
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ArchitectureView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`h-full ${glassStyle} p-8 flex flex-col lg:flex-row items-center justify-center gap-12 relative overflow-hidden`}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHptLTIwIDBoMjB2MjBIMHptMjAtMjBoMjB2MjBIMjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-20 pointer-events-none rounded-xl" />

      {/* Client */}
      <div className="flex flex-col items-center gap-4 z-10 w-full lg:w-64">
        <div className="w-full bg-[#161622] border border-slate-700 rounded-xl p-6 text-center shadow-lg relative">
          <Terminal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-slate-200">Docker Client</h3>
          <div className="mt-4 flex flex-col gap-2">
            <div className="bg-slate-800/50 rounded px-3 py-1 text-xs font-mono border border-slate-700 text-left text-slate-400">docker build</div>
            <div className="bg-slate-800/50 rounded px-3 py-1 text-xs font-mono border border-slate-700 text-left text-slate-400">docker pull</div>
            <div className="bg-slate-800/50 rounded px-3 py-1 text-xs font-mono border border-slate-700 text-left text-slate-400">docker run</div>
          </div>
          {/* Arrow out */}
          <div className="hidden lg:block absolute -right-16 top-1/2 -translate-y-1/2 w-16 h-0 border-t-2 border-dashed border-cyan-500/50">
            <motion.div 
               animate={{ x: [0, 40] }} transition={{ duration: 1, repeat: Infinity }}
               className="w-3 h-3 rounded-full bg-cyan-400 absolute -top-[7px]"
            />
          </div>
        </div>
      </div>

      {/* Docker Host */}
      <div className="flex-1 w-full max-w-2xl bg-cyan-900/10 border border-cyan-500/30 rounded-2xl p-6 z-10 relative shadow-[0_0_30px_rgba(0,240,255,0.05)]">
        <div className="absolute -top-3 left-6 bg-[#0a0a0f] px-2 text-cyan-400 font-bold tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4" /> DOCKER HOST
        </div>
        
        <div className="bg-[#161622] border border-cyan-500/40 rounded-xl p-4 mb-6 text-center shadow-inner relative overflow-hidden">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/5"
          />
          <Settings className="w-6 h-6 text-cyan-400 mx-auto mb-1 animate-spin-slow" style={{ animationDuration: '10s' }} />
          <h3 className="font-bold text-cyan-300">Docker Daemon (dockerd)</h3>
          <p className="text-xs text-slate-400 mt-1">REST API | Object Management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border border-slate-700 bg-slate-900/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <Layers className="w-4 h-4" /> Images
            </h4>
            <div className="flex flex-col gap-2">
              <div className="bg-slate-800 rounded p-2 text-xs border border-slate-700 text-slate-400">ubuntu:latest</div>
              <div className="bg-slate-800 rounded p-2 text-xs border border-slate-700 text-slate-400">nginx:alpine</div>
            </div>
          </div>
          
          <div className="border border-green-500/30 bg-green-900/10 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2 border-b border-green-500/20 pb-2 mb-3">
              <Box className="w-4 h-4" /> Containers
            </h4>
            <div className="flex flex-col gap-2">
              <div className="bg-green-500/10 rounded p-2 text-xs border border-green-500/30 text-green-300 flex items-center justify-between">
                <span>web_server</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registry */}
      <div className="flex flex-col items-center gap-4 z-10 w-full lg:w-64 relative">
        {/* Arrow in */}
        <div className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-0 border-t-2 border-dashed border-purple-500/50">
          <motion.div 
             animate={{ x: [-20, -60] }} transition={{ duration: 1.5, repeat: Infinity }}
             className="w-3 h-3 rounded-full bg-purple-400 absolute -top-[7px] right-0"
          />
        </div>
        
        <div className="w-full bg-[#161622] border border-purple-500/40 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(176,38,255,0.1)]">
          <Cloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-purple-300">Registry</h3>
          <p className="text-xs text-slate-400 mt-1">Docker Hub / ECR</p>
          <div className="mt-4 grid grid-cols-2 gap-2 opacity-50">
             <div className="bg-purple-900/30 rounded p-1 text-[10px] border border-purple-500/30">node</div>
             <div className="bg-purple-900/30 rounded p-1 text-[10px] border border-purple-500/30">redis</div>
             <div className="bg-purple-900/30 rounded p-1 text-[10px] border border-purple-500/30">mongo</div>
             <div className="bg-purple-900/30 rounded p-1 text-[10px] border border-purple-500/30">postgres</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface LifecycleViewProps {
  logs: Log[];
  images: DockerImage[];
  containers: DockerContainer[];
  isPulling: boolean;
  isBuilding: boolean;
  onPull: () => void;
  onBuild: () => void;
  onRun: (img: DockerImage) => void;
  onStop: (id: string) => void;
  onRm: (id: string) => void;
  logsEndRef: React.RefObject<HTMLDivElement>;
}

const LifecycleView: React.FC<LifecycleViewProps> = ({ 
  logs, images, containers, isPulling, isBuilding, onPull, onBuild, onRun, onStop, onRm, logsEndRef 
}) => {
  return (
    <motion.div 
       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
       className="h-full flex flex-col xl:flex-row gap-6"
    >
      {/* Terminal Pane */}
      <div className={`w-full xl:w-1/3 flex flex-col ${glassStyle} overflow-hidden max-h-[400px] xl:max-h-full`}>
        <div className="bg-[#0a0a0f] p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-mono text-slate-400">bash - root@docker-host</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-[#0a0a0f]/50 h-full">
          {logs.map(log => (
            <div key={log.id} className={`${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'
            }`}>
              <span className="text-slate-600 mr-2">[{log.time}]</span>
              {log.message}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
        
        {/* Controls */}
        <div className="p-4 border-t border-slate-800 bg-[#161622] grid grid-cols-2 gap-3 shrink-0">
          <button 
            onClick={onPull} disabled={isPulling}
            className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Pull
          </button>
          <button 
            onClick={onBuild} disabled={isBuilding}
            className="flex items-center justify-center gap-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 rounded py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Hammer className="w-4 h-4" /> Build
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        
        {/* Images Section */}
        <div className={`flex-1 ${glassStyle} p-6 flex flex-col relative overflow-hidden min-h-[250px]`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Layers className="w-24 h-24" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2 relative z-10">
            <Layers className="w-5 h-5 text-purple-400" /> Local Images (Union FS)
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 content-start">
            <AnimatePresence>
              {images.map(img => (
                <motion.div 
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-sm text-cyan-300 font-bold">{img.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{img.size}</div>
                    </div>
                    <button 
                      onClick={() => onRun(img)}
                      className="bg-green-500/20 hover:bg-green-500/40 text-green-400 p-1.5 rounded border border-green-500/30 transition-colors"
                      title="docker run"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Visualizing Layers */}
                  <div className="mt-auto space-y-1">
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Image Layers (Read-Only)</div>
                    {Array.from({ length: img.layers }).map((_, i) => (
                      <div key={i} className="h-2 w-full bg-slate-700/50 border border-slate-600 rounded-sm" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Skeletons */}
            {isPulling && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-4 animate-pulse">
                 <div className="h-4 bg-purple-500/20 rounded w-1/2 mb-2" />
                 <div className="h-3 bg-slate-800 rounded w-1/4 mb-6" />
                 <div className="space-y-1">
                   <div className="h-2 bg-slate-800 rounded w-full" />
                   <div className="h-2 bg-slate-800 rounded w-full" />
                 </div>
               </motion.div>
            )}
            {isBuilding && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4 animate-pulse">
                 <div className="h-4 bg-cyan-500/20 rounded w-2/3 mb-2" />
                 <div className="h-3 bg-slate-800 rounded w-1/3 mb-6" />
                 <div className="space-y-1">
                   <div className="h-2 bg-slate-800 rounded w-full" />
                   <div className="h-2 bg-slate-800 rounded w-full" />
                   <div className="h-2 bg-slate-800 rounded w-full" />
                 </div>
               </motion.div>
            )}
          </div>
        </div>

        {/* Containers Section */}
        <div className={`flex-1 ${glassStyle} p-6 flex flex-col relative overflow-hidden min-h-[300px]`}>
           <div className="absolute top-0 right-0 p-4 opacity-5">
             <Box className="w-32 h-32" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2 relative z-10">
            <Box className="w-5 h-5 text-green-400" /> Running Containers (Isolated)
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 content-start">
            <AnimatePresence>
              {containers.length === 0 && (
                <div className="text-center text-slate-500 text-sm mt-8 italic col-span-full">No running containers. Click run on an image.</div>
              )}
              {containers.map(container => (
                <motion.div 
                  key={container.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`border ${container.status === 'running' ? 'border-green-500/40 bg-green-900/10' : 'border-slate-700 bg-slate-900/50'} rounded-lg p-4`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${container.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                      <div>
                        <div className="font-mono text-sm text-slate-200">{container.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Image: {container.imageName} ({container.id})</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {container.status === 'running' ? (
                        <button onClick={() => onStop(container.id)} className="p-1.5 bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/30 hover:bg-yellow-500/40" title="docker stop">
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => onRm(container.id)} className="p-1.5 bg-red-500/20 text-red-500 rounded border border-red-500/30 hover:bg-red-500/40" title="docker rm">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Namespaces & Cgroups Vis */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Cgroups (Metrics) */}
                    <div className="bg-[#0a0a0f]/80 rounded p-3 border border-slate-800 relative overflow-hidden">
                      <div className="text-[10px] text-slate-500 mb-2 uppercase flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Cgroups (Limits)
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">CPU</span>
                            <span className="font-mono text-cyan-400">{container.cpu.toFixed(1)}%</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded overflow-hidden">
                            <motion.div 
                               className="h-full bg-cyan-500" 
                               animate={{ width: `${container.cpu}%` }} transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">MEM</span>
                            <span className="font-mono text-purple-400">{container.mem.toFixed(0)} MB</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded overflow-hidden">
                            <motion.div 
                               className="h-full bg-purple-500" 
                               animate={{ width: `${Math.min(100, (container.mem / 1024) * 100)}%` }} transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Namespaces */}
                    <div className="bg-[#0a0a0f]/80 rounded p-3 border border-slate-800 flex flex-col">
                       <div className="text-[10px] text-slate-500 mb-2 uppercase flex items-center gap-1">
                        <Network className="w-3 h-3" /> Namespaces (Isolation)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['PID', 'NET', 'IPC', 'MNT', 'UTS'].map(ns => (
                          <div key={ns} className={`text-[10px] px-1.5 py-0.5 rounded border ${container.status === 'running' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-700 text-slate-500 bg-slate-800'}`}>
                            {ns}
                          </div>
                        ))}
                      </div>
                      {/* Union FS Read-Write Layer */}
                      <div className="mt-auto pt-2">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> Container Layer
                        </div>
                        <div className={`mt-1 h-2 w-full rounded-sm border ${container.status === 'running' ? 'bg-cyan-500/50 border-cyan-400' : 'bg-slate-700 border-slate-600'}`} title="Read/Write Layer" />
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  )
}

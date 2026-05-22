"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoundRobinViz() {
  const [servers, setServers] = useState([
    { id: 1, color: "text-red-400", bg: "bg-red-400", count: 0 },
    { id: 2, color: "text-blue-400", bg: "bg-blue-400", count: 0 },
    { id: 3, color: "text-green-400", bg: "bg-green-400", count: 0 },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [packets, setPackets] = useState<{ id: number; targetServer: number }[]>([]);
  const [packetCounter, setPacketCounter] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        sendPacket();
      }, speed);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex, speed, servers.length]);

  const sendPacket = () => {
    const nextIndex = (currentIndex + 1) % servers.length;
    const targetServer = servers[nextIndex].id;
    const newPacket = { id: packetCounter, targetServer };
    
    setCurrentIndex(nextIndex);
    setPacketCounter(prev => prev + 1);
    setPackets(prev => [...prev, newPacket]);

    // Update server count after delay
    setTimeout(() => {
      setServers(prev => prev.map(s => 
        s.id === targetServer ? { ...s, count: s.count + 1 } : s
      ));
      // Remove packet
      setPackets(prev => prev.filter(p => p.id !== newPacket.id));
    }, 800);
  };

  const addServer = () => {
    if (servers.length >= 6) return;
    const colors = ["text-yellow-400", "text-purple-400", "text-pink-400", "text-cyan-400"];
    const bgs = ["bg-yellow-400", "bg-purple-400", "bg-pink-400", "bg-cyan-400"];
    const newServer = { 
      id: servers.length > 0 ? Math.max(...servers.map(s => s.id)) + 1 : 1, 
      color: colors[servers.length % colors.length], 
      bg: bgs[servers.length % bgs.length], 
      count: 0 
    };
    setServers([...servers, newServer]);
  };

  const removeServer = () => {
    if (servers.length <= 1) return;
    setServers(servers.slice(0, -1));
    if (currentIndex >= servers.length - 1) {
      setCurrentIndex(0);
    }
  };

  const reset = () => {
    setServers(servers.map(s => ({ ...s, count: 0 })));
    setCurrentIndex(0);
    setPackets([]);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 bg-black/20 rounded-2xl border border-white/10">
      
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12 w-full p-4 bg-white/5 rounded-xl border border-white/10">
        <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-neon-primary">
          {isPlaying ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
          Reset
        </button>
        <button onClick={sendPacket} disabled={isPlaying} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50">
          Step
        </button>
        
        <div className="w-px h-8 bg-white/20 mx-2"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Speed:</span>
          <input 
            type="range" 
            min="200" 
            max="2000" 
            step="100" 
            value={2200 - speed} 
            onChange={(e) => setSpeed(2200 - Number(e.target.value))}
            className="accent-primary w-24"
          />
        </div>

        <div className="w-px h-8 bg-white/20 mx-2"></div>

        <div className="flex gap-2">
          <button onClick={addServer} disabled={servers.length >= 6} className="px-3 py-1.5 rounded bg-white/10 text-sm hover:bg-white/20 disabled:opacity-50">+</button>
          <button onClick={removeServer} disabled={servers.length <= 1} className="px-3 py-1.5 rounded bg-white/10 text-sm hover:bg-white/20 disabled:opacity-50">-</button>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-between">
        
        {/* Load Balancer */}
        <div className="relative z-10 w-48 h-20 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg mb-8">
          <span className="font-bold text-lg text-white">Load Balancer</span>
          
          {/* Active pointer indicator */}
          <div className="absolute -bottom-6 w-full flex justify-center">
            <motion.div 
              className="text-primary text-2xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              ⚙️
            </motion.div>
          </div>
        </div>

        {/* Connections and Packets (Absolute Positioning) */}
        <div className="absolute top-20 bottom-20 left-0 right-0 pointer-events-none">
          <AnimatePresence>
            {packets.map(packet => {
              const targetServerIndex = servers.findIndex(s => s.id === packet.targetServer);
              const serverWidth = 100 / servers.length;
              const targetX = `${(targetServerIndex * serverWidth) + (serverWidth / 2)}%`;
              
              const targetServer = servers[targetServerIndex];

              return (
                <motion.div
                  key={packet.id}
                  initial={{ top: "0%", left: "50%", scale: 0.5, opacity: 0 }}
                  animate={{ top: "100%", left: targetX, scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`absolute w-6 h-6 rounded-full ${targetServer?.bg || 'bg-white'} shadow-[0_0_15px_currentColor] border border-white z-20`}
                  style={{ transform: "translate(-50%, -50%)" }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Servers Row */}
        <div className="w-full flex justify-around items-end relative z-10 mt-auto">
          <AnimatePresence mode="popLayout">
            {servers.map((server, idx) => (
              <motion.div
                key={server.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex flex-col items-center"
              >
                {/* Pointer indicator */}
                <motion.div 
                  className={`mb-4 w-4 h-4 rounded-full ${currentIndex === idx ? 'bg-primary shadow-neon-primary' : 'bg-transparent'}`}
                  animate={{ scale: currentIndex === idx ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                
                <div className={`w-24 h-32 rounded-xl bg-white/5 border ${currentIndex === idx ? 'border-primary/50 shadow-neon-primary' : 'border-white/10'} flex flex-col items-center justify-center relative backdrop-blur-md transition-all duration-300`}>
                  <div className="text-3xl mb-2">🖥️</div>
                  <div className={`font-mono font-bold ${server.color} text-xl`}>{server.count}</div>
                  
                  {/* Progress bar fill effect based on count */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/5 rounded-b-xl overflow-hidden" style={{ height: `${Math.min(server.count * 2, 100)}%` }}>
                    <div className={`w-full h-full ${server.bg} opacity-20`}></div>
                  </div>
                </div>
                <div className="mt-4 text-xs font-mono text-zinc-400">Node {server.id}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

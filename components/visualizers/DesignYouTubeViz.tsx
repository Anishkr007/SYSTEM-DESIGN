"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type NodeId = 'clientUp' | 'apiGw' | 'rawS3' | 'metadataDb' | 'queue' | 'workers' | 'transcodedS3' | 'cdn' | 'clientView';

interface Packet {
  id: string;
  source: NodeId;
  target: NodeId;
  color: string;
  shadow: string;
  duration: number;
}

const NODES: Record<NodeId, { id: NodeId; label: string; x: number; y: number; width?: number }> = {
  clientUp: { id: 'clientUp', label: 'Upload Client', x: 10, y: 20 },
  apiGw: { id: 'apiGw', label: 'API Gateway', x: 30, y: 35 },
  rawS3: { id: 'rawS3', label: 'Raw S3', x: 50, y: 20 },
  metadataDb: { id: 'metadataDb', label: 'Metadata DB', x: 30, y: 65 },
  queue: { id: 'queue', label: 'Transcode Queue', x: 50, y: 50 },
  workers: { id: 'workers', label: 'Workers', x: 70, y: 50, width: 140 },
  transcodedS3: { id: 'transcodedS3', label: 'Transcoded S3', x: 90, y: 20 },
  cdn: { id: 'cdn', label: 'CDN Edge Node', x: 80, y: 80, width: 140 },
  clientView: { id: 'clientView', label: 'View Client', x: 10, y: 80 },
};

const CONNECTIONS = [
  { from: 'clientUp', to: 'apiGw' },
  { from: 'apiGw', to: 'rawS3' },
  { from: 'apiGw', to: 'metadataDb' },
  { from: 'rawS3', to: 'queue' },
  { from: 'queue', to: 'workers' },
  { from: 'workers', to: 'transcodedS3' },
  { from: 'transcodedS3', to: 'cdn' },
  { from: 'clientView', to: 'cdn' },
  { from: 'cdn', to: 'transcodedS3', dashArray: '2 6', stroke: 'rgba(239,68,68,0.4)' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

// Icons
const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const GlobeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const ServerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
);

const Node = ({ x, y, label, children, status, width = 120 }: any) => (
  <div
    className={`absolute flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 backdrop-blur-md bg-black/60 text-xs text-white transition-all duration-300 z-20
      ${status === 'offline' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] opacity-80' : ''}
    `}
    style={{ left: `${x}%`, top: `${y}%`, width: `${width}px`, transform: 'translate(-50%, -50%)' }}
  >
    <div className="font-bold mb-1 text-center w-full">{label}</div>
    {children}
  </div>
);

const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
    <motion.div 
      animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} 
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"
    />
    <motion.div 
      animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }} 
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
    />
  </div>
);

export default function DesignYouTubeViz() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [queueDepth, setQueueDepth] = useState(0);
  const [transcoding, setTranscoding] = useState(false);
  const [cdnStatus, setCdnStatus] = useState<'online' | 'offline'>('online');
  const [bandwidth, setBandwidth] = useState(0);

  const cdnStatusRef = useRef(cdnStatus);
  useEffect(() => {
    cdnStatusRef.current = cdnStatus;
  }, [cdnStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPackets(currentPackets => {
        const activeStreams = currentPackets.filter(p => p.source === 'cdn' || p.source === 'transcodedS3').length;
        const activeUploads = currentPackets.filter(p => p.source === 'clientUp').length;
        const noise = Math.floor(Math.random() * 8);
        const base = (activeStreams * 45) + (activeUploads * 80);
        setBandwidth(base > 0 ? base + noise : 0);
        return currentPackets;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const addPacket = (packet: Packet) => {
    setPackets(prev => [...prev, packet]);
    setTimeout(() => {
      setPackets(prev => prev.filter(p => p.id !== packet.id));
    }, packet.duration);
  };

  const uploadVideo = () => {
    addPacket({ id: generateId(), source: 'clientUp', target: 'apiGw', color: 'bg-cyan-400', shadow: 'shadow-[0_0_10px_#22d3ee]', duration: 600 });
    
    setTimeout(() => {
      addPacket({ id: generateId(), source: 'apiGw', target: 'metadataDb', color: 'bg-purple-400', shadow: 'shadow-[0_0_10px_#c084fc]', duration: 600 });
      addPacket({ id: generateId(), source: 'apiGw', target: 'rawS3', color: 'bg-yellow-400', shadow: 'shadow-[0_0_10px_#facc15]', duration: 800 });
    }, 600);

    setTimeout(() => {
      addPacket({ id: generateId(), source: 'rawS3', target: 'queue', color: 'bg-orange-400', shadow: 'shadow-[0_0_10px_#fb923c]', duration: 600 });
    }, 1400);

    setTimeout(() => {
      setQueueDepth(q => q + 1);
      setTimeout(() => {
        setQueueDepth(q => Math.max(0, q - 1));
        addPacket({ id: generateId(), source: 'queue', target: 'workers', color: 'bg-orange-400', shadow: 'shadow-[0_0_10px_#fb923c]', duration: 500 });
        
        setTimeout(() => {
          setTranscoding(true);
          setTimeout(() => {
            setTranscoding(false);
            addPacket({ id: generateId(), source: 'workers', target: 'transcodedS3', color: 'bg-green-400', shadow: 'shadow-[0_0_10px_#4ade80]', duration: 600 });
            addPacket({ id: generateId(), source: 'workers', target: 'transcodedS3', color: 'bg-green-400', shadow: 'shadow-[0_0_10px_#4ade80]', duration: 600 });
            addPacket({ id: generateId(), source: 'workers', target: 'transcodedS3', color: 'bg-green-400', shadow: 'shadow-[0_0_10px_#4ade80]', duration: 600 });

            setTimeout(() => {
               addPacket({ id: generateId(), source: 'transcodedS3', target: 'cdn', color: 'bg-green-400', shadow: 'shadow-[0_0_10px_#4ade80]', duration: 800 });
            }, 600);
          }, 2000);
        }, 500);
      }, 1000);
    }, 2000);
  };

  const streamChunks = (source: NodeId, target: NodeId, color: string, shadow: string) => {
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval);
        return;
      }
      addPacket({ id: generateId(), source, target, color, shadow, duration: 800 });
      count++;
    }, 300);
  };

  const watchVideo = () => {
    addPacket({ id: generateId(), source: 'clientView', target: 'cdn', color: 'bg-purple-400', shadow: 'shadow-[0_0_10px_#c084fc]', duration: 600 });
    
    setTimeout(() => {
      if (cdnStatusRef.current === 'offline') {
        // CDN Miss / Fail -> Route to Origin
        addPacket({ id: generateId(), source: 'cdn', target: 'transcodedS3', color: 'bg-red-500', shadow: 'shadow-[0_0_10px_#ef4444]', duration: 800 });
        
        setTimeout(() => {
           // Origin replies to CDN
           streamChunks('transcodedS3', 'cdn', 'bg-orange-400', 'shadow-[0_0_10px_#fb923c]');
           // CDN passes back to Client
           setTimeout(() => {
              streamChunks('cdn', 'clientView', 'bg-orange-400', 'shadow-[0_0_10px_#fb923c]');
           }, 800);
        }, 800);
      } else {
        // CDN Hit -> Stream
        streamChunks('cdn', 'clientView', 'bg-cyan-400', 'shadow-[0_0_10px_#22d3ee]');
      }
    }, 600);
  };

  return (
    <div className="relative w-full h-[800px] bg-[#0A0F1A] overflow-hidden rounded-xl border border-white/10 font-sans shadow-2xl">
      <Background />
      
      <div className="absolute top-0 w-full p-6 text-center z-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
          YouTube System Architecture
        </h1>
        <p className="text-gray-400 text-sm mt-2">Interactive Video Upload & Streaming Pipeline</p>
      </div>

      <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
        {CONNECTIONS.map((c, i) => (
          <line 
            key={i}
            x1={`${NODES[c.from as NodeId].x}%`}
            y1={`${NODES[c.from as NodeId].y}%`}
            x2={`${NODES[c.to as NodeId].x}%`}
            y2={`${NODES[c.to as NodeId].y}%`}
            stroke={c.stroke || "rgba(255,255,255,0.15)"}
            strokeWidth="2"
            strokeDasharray={c.dashArray || "4 4"}
          />
        ))}
      </svg>

      {/* Nodes */}
      <Node {...NODES.clientUp}>
        <UserIcon className="w-6 h-6 text-cyan-400 mt-2 mb-1" />
        <div className="text-[10px] text-cyan-300 bg-cyan-900/30 px-2 py-0.5 rounded">Creator</div>
      </Node>

      <Node {...NODES.clientView}>
        <UserIcon className="w-6 h-6 text-purple-400 mt-2 mb-1" />
        <div className="text-[10px] text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">Viewer</div>
      </Node>

      <Node {...NODES.apiGw}>
        <ServerIcon className="w-6 h-6 text-gray-300 mt-2 mb-1" />
        <div className="text-[10px] text-gray-400 text-center">Load Balancer / API</div>
      </Node>

      <Node {...NODES.rawS3}>
        <DatabaseIcon className="w-6 h-6 text-yellow-400 mt-2 mb-1" />
        <div className="text-[10px] text-gray-400">Object Store</div>
      </Node>

      <Node {...NODES.metadataDb}>
        <DatabaseIcon className="w-6 h-6 text-purple-400 mt-2 mb-1" />
        <div className="text-[10px] text-gray-400">PostgreSQL</div>
      </Node>

      <Node {...NODES.queue}>
        <div className="flex flex-col-reverse gap-1 mt-2 h-14 w-full items-center justify-start bg-gray-900/50 rounded-md p-1 border border-gray-700 overflow-hidden relative">
          <AnimatePresence>
            {Array.from({length: queueDepth}).map((_, i) => (
              <motion.div 
                key={`q-${i}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-full h-2 rounded-sm bg-orange-500 shadow-[0_0_5px_#f97316]" 
              />
            ))}
          </AnimatePresence>
          {queueDepth === 0 && <span className="text-[9px] text-gray-500 absolute top-1/2 -translate-y-1/2">Empty</span>}
        </div>
      </Node>

      <Node {...NODES.workers}>
        <div className="flex flex-col gap-1.5 w-full mt-2">
          {['1080p', '720p', '360p'].map((res, i) => (
            <div key={res} className="flex items-center gap-2 text-[9px]">
              <span className="w-8 text-right text-gray-400 font-mono">{res}</span>
              <div className="flex-1 bg-gray-800/50 h-1.5 rounded overflow-hidden shadow-inner">
                <motion.div 
                   className="h-full bg-green-400 shadow-[0_0_5px_#4ade80]"
                   initial={{ width: 0 }}
                   animate={{ width: transcoding ? '100%' : '0%' }}
                   transition={{ duration: 2, delay: i * 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </Node>

      <Node {...NODES.transcodedS3}>
        <DatabaseIcon className="w-6 h-6 text-green-400 mt-2 mb-1" />
        <div className="text-[10px] text-gray-400">Multi-bitrate Store</div>
      </Node>

      <Node {...NODES.cdn} status={cdnStatus}>
        <GlobeIcon className="w-6 h-6 text-blue-400 mt-2 mb-1" />
        <div className="text-[10px] text-gray-400">Edge Location Cache</div>
        {cdnStatus === 'offline' && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </>
        )}
      </Node>

      {/* Animated Packets */}
      <AnimatePresence>
        {packets.map(p => (
          <motion.div
            key={p.id}
            initial={{ left: `${NODES[p.source].x}%`, top: `${NODES[p.source].y}%`, x: '-50%', y: '-50%' }}
            animate={{ left: `${NODES[p.target].x}%`, top: `${NODES[p.target].y}%`, x: '-50%', y: '-50%' }}
            transition={{ duration: p.duration / 1000, ease: 'linear' }}
            className={`absolute w-3 h-3 rounded-full ${p.color} ${p.shadow} z-30`}
          />
        ))}
      </AnimatePresence>

      {/* Metrics Panel */}
      <div className="absolute top-4 right-4 bg-black/60 border border-white/10 backdrop-blur-md p-4 rounded-xl text-white text-sm w-56 shadow-2xl z-30">
        <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-wider text-[10px] flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          Live Telemetry
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Network I/O</span>
            <span className="font-mono text-cyan-300">{bandwidth.toFixed(1)} Mbps</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Queue Depth</span>
            <span className="font-mono text-orange-300">{queueDepth} jobs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transcoder</span>
            <span className={`font-mono text-xs ${transcoding ? 'text-green-400' : 'text-gray-500'}`}>
              {transcoding ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">CDN Edge</span>
            <span className={`font-mono text-xs ${cdnStatus === 'online' ? 'text-green-400' : 'text-red-500'}`}>
              {cdnStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-3 z-30 w-48">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={uploadVideo}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all overflow-hidden"
        >
          Upload Video
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={watchVideo}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all overflow-hidden"
        >
          Stream Video
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCdnStatus(s => s === 'online' ? 'offline' : 'online')}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all overflow-hidden ${cdnStatus === 'online' ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(22,163,74,0.5)]'}`}
        >
          {cdnStatus === 'online' ? 'Simulate CDN Outage' : 'Restore CDN Node'}
        </motion.button>
      </div>

      {/* Legend / Info */}
      <div className="absolute bottom-4 right-4 bg-black/60 border border-white/10 backdrop-blur-md p-4 rounded-xl text-white text-[10px] w-64 shadow-2xl z-30">
        <p className="text-gray-300 mb-2 font-bold uppercase tracking-wider border-b border-gray-700 pb-1">Architecture Highlights</p>
        <ul className="list-disc pl-4 space-y-1 text-gray-400">
          <li><strong className="text-cyan-400">Upload:</strong> Chunked upload to Raw Storage.</li>
          <li><strong className="text-orange-400">Processing:</strong> Queue triggers workers to transcode multiple resolutions.</li>
          <li><strong className="text-green-400">Distribution:</strong> Saved to Transcoded S3 and pushed to CDN.</li>
          <li><strong className="text-purple-400">Streaming:</strong> Viewers stream directly from CDN Edge.</li>
          <li><strong className="text-red-400">Resilience:</strong> CDN failure routes requests to Origin.</li>
        </ul>
      </div>

    </div>
  );
}

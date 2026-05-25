"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (Inline SVGs to avoid dependency issues) ---
const FolderIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
);
const FileIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
);
const DatabaseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
);
const HardDriveIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
);
const ServerIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
);
const Trash2Icon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const UploadCloudIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const LayersIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11l-7 4-7-4m14 4l-7 4-7-4m14-8l-7 4-7-4 7-4 7 4z" /></svg>
);
const ActivityIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);

// --- Constants & Types ---
const CHUNK_COLORS = [
  'bg-cyan-500 shadow-[0_0_8px_#06b6d4]',
  'bg-magenta-500 shadow-[0_0_8px_#d946ef]',
  'bg-yellow-500 shadow-[0_0_8px_#eab308]',
  'bg-green-500 shadow-[0_0_8px_#22c55e]',
  'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
  'bg-purple-500 shadow-[0_0_8px_#a855f7]'
];

const SAMPLE_KEYS = [
  "user/avatars/john.png",
  "reports/2026/q1.pdf",
  "config.json",
  "backups/db-01.tar.gz",
  "assets/logo.svg"
];

const NODES = [
  { id: 1, name: "Node-Alpha" },
  { id: 2, name: "Node-Beta" },
  { id: 3, name: "Node-Gamma" },
  { id: 4, name: "Node-Delta" }
];

type Chunk = { id: string; nodeId: number; color: string; objectId: string };
type Obj = {
  id: string; 
  key: string;
  version: number;
  size: number;
  isTombstone: boolean;
  chunks: Chunk[];
  color: string;
};

type HierarchyNode = {
  name: string;
  children: Record<string, HierarchyNode>;
  files: string[];
};

type TransferTarget = {
  obj: Obj;
  progress: number;
} | null;

// --- Initial Data ---
const createInitialObjects = (): Obj[] => [
  {
    id: 'assets/logo.svg-v1',
    key: 'assets/logo.svg',
    version: 1,
    size: 45,
    isTombstone: false,
    color: CHUNK_COLORS[0],
    chunks: [
      { id: 'c1', nodeId: 1, color: CHUNK_COLORS[0], objectId: 'assets/logo.svg-v1' },
      { id: 'c2', nodeId: 2, color: CHUNK_COLORS[0], objectId: 'assets/logo.svg-v1' },
      { id: 'c3', nodeId: 4, color: CHUNK_COLORS[0], objectId: 'assets/logo.svg-v1' },
    ]
  },
  {
    id: 'config.json-v1',
    key: 'config.json',
    version: 1,
    size: 12,
    isTombstone: false,
    color: CHUNK_COLORS[1],
    chunks: [
      { id: 'c4', nodeId: 2, color: CHUNK_COLORS[1], objectId: 'config.json-v1' },
      { id: 'c5', nodeId: 3, color: CHUNK_COLORS[1], objectId: 'config.json-v1' },
      { id: 'c6', nodeId: 4, color: CHUNK_COLORS[1], objectId: 'config.json-v1' },
    ]
  }
];

// --- Main Component ---
export default function ObjectStorageViz() {
  const [objects, setObjects] = useState<Obj[]>(createInitialObjects());
  const [versioning, setVersioning] = useState(false);
  const [viewMode, setViewMode] = useState<'flat'|'hierarchy'>('flat');
  const [uploading, setUploading] = useState(false);
  const [transferTarget, setTransferTarget] = useState<TransferTarget>(null);
  const [metrics, setMetrics] = useState({ latency: 45, storage: 0, count: 0 });
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update metrics
  useEffect(() => {
    let storage = 0;
    let count = 0;
    objects.forEach(o => {
      if (!o.isTombstone) {
        storage += o.size;
        count++;
      }
    });
    setMetrics(m => ({ ...m, storage, count }));
  }, [objects]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    };
  }, []);

  const getRandomNodes = (count: number) => {
    const shuffled = [...NODES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const triggerUpload = () => {
    if (uploading) return;
    setUploading(true);
    
    const key = SAMPLE_KEYS[Math.floor(Math.random() * SAMPLE_KEYS.length)];
    const existingVersions = objects.filter(o => o.key === key);
    const version = existingVersions.length + 1;
    
    const color = CHUNK_COLORS[Math.floor(Math.random() * CHUNK_COLORS.length)];
    const objectId = `${key}-v${version}`;
    
    const selectedNodes = getRandomNodes(3);
    const newChunks = selectedNodes.map((node, i) => ({
      id: `${objectId}-c${i}`,
      nodeId: node.id,
      color,
      objectId
    }));

    const newObj: Obj = {
      id: objectId,
      key,
      version,
      size: Math.floor(Math.random() * 500) + 10,
      isTombstone: false,
      chunks: newChunks,
      color
    };

    setTransferTarget({ obj: newObj, progress: 0 });
    
    let p = 0;
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    uploadIntervalRef.current = setInterval(() => {
      p += 20;
      setTransferTarget(prev => prev ? { ...prev, progress: p } : null);
      if (p >= 100) {
        if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
        
        setObjects(prev => {
          if (!versioning) {
            // Logical overwrite if versioning is off
            const filtered = prev.filter(o => o.key !== key);
            return [...filtered, newObj];
          } else {
            return [...prev, newObj];
          }
        });
        
        setUploading(false);
        setTransferTarget(null);
        setMetrics(m => ({ ...m, latency: Math.floor(Math.random() * 50) + 20 }));
      }
    }, 200);
  };

  const triggerDelete = (key: string) => {
    if (versioning) {
      const existingVersions = objects.filter(o => o.key === key);
      const version = existingVersions.length + 1;
      const tombstone: Obj = {
        id: `${key}-v${version}-tombstone`,
        key,
        version,
        size: 0,
        isTombstone: true,
        chunks: [],
        color: 'bg-gray-600 shadow-none'
      };
      setObjects(prev => [...prev, tombstone]);
    } else {
      // Hard delete / GC
      setObjects(prev => prev.filter(o => o.key !== key));
    }
  };

  const buildHierarchy = (objs: Obj[]): HierarchyNode => {
    const root: HierarchyNode = { name: '/', children: {}, files: [] };
    const uniqueKeys = Array.from(new Set(objs.map(o => o.key)));
    
    uniqueKeys.forEach(key => {
      const parts = key.split('/');
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current.children[parts[i]]) {
          current.children[parts[i]] = { name: parts[i], children: {}, files: [] };
        }
        current = current.children[parts[i]];
      }
      current.files.push(key);
    });
    return root;
  };

  const chunksForNode = useCallback((nodeId: number) => {
    return objects.flatMap(o => o.chunks).filter(c => c.nodeId === nodeId);
  }, [objects]);

  const incomingChunksForNode = useCallback((nodeId: number) => {
    return transferTarget ? transferTarget.obj.chunks.filter(c => c.nodeId === nodeId) : [];
  }, [transferTarget]);

  const renderNamespace = () => {
    if (viewMode === 'flat') {
      const uniqueKeys = Array.from(new Set(objects.map(o => o.key)));
      return (
        <div className="flex flex-col gap-1">
          {uniqueKeys.length === 0 && <div className="text-gray-500 text-sm p-2 italic">Bucket is empty</div>}
          <AnimatePresence>
            {uniqueKeys.map(key => {
              const versions = objects.filter(o => o.key === key).sort((a,b) => b.version - a.version);
              const latest = versions[0];
              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  key={key} className="flex flex-col gap-1 p-2 hover:bg-white/5 rounded-lg group transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileIcon className={`w-4 h-4 ${latest.isTombstone ? 'text-gray-600' : 'text-blue-400'}`} />
                      <span className={`text-sm tracking-wide ${latest.isTombstone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{key}</span>
                    </div>
                    <button onClick={() => triggerDelete(key)} className="hidden group-hover:block text-red-500 hover:text-red-400 p-1">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                  {versioning && versions.length > 1 && (
                    <div className="pl-7 text-xs text-gray-500 flex flex-col gap-1 border-l border-gray-800/50 ml-2 mt-1">
                      {versions.map(v => (
                        <div key={v.id} className="flex justify-between items-center py-0.5">
                          <span>v{v.version} {v.isTombstone && <span className="text-red-400/70 ml-1">(Delete Marker)</span>}</span>
                          {!v.isTombstone && <span>{v.size} MB</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      );
    }

    const hierarchy = buildHierarchy(objects);
    
    const renderNode = (node: HierarchyNode, path: string) => {
      return (
        <div key={path} className="flex flex-col gap-1 ml-4 mt-1 border-l border-gray-800/50 pl-3">
          {Object.keys(node.children).map(dir => (
            <div key={dir}>
              <div className="flex items-center gap-2 text-sm text-yellow-500 py-1.5 font-medium tracking-wide">
                <FolderIcon className="w-4 h-4" /> {dir}/
              </div>
              {renderNode(node.children[dir], path + '/' + dir)}
            </div>
          ))}
          {node.files.map((key: string) => {
            const versions = objects.filter(o => o.key === key).sort((a,b) => b.version - a.version);
            const latest = versions[0];
            const name = key.split('/').pop();
            return (
              <div key={key} className="flex flex-col gap-1 py-1.5 group hover:bg-white/5 rounded px-2 -ml-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileIcon className={`w-4 h-4 ${latest.isTombstone ? 'text-gray-600' : 'text-blue-400'}`} />
                    <span className={`text-sm ${latest.isTombstone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{name}</span>
                  </div>
                  <button onClick={() => triggerDelete(key)} className="hidden group-hover:block text-red-500 hover:text-red-400">
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      );
    };

    return (
      <div className="-ml-4">
        {Object.keys(hierarchy.children).length === 0 && hierarchy.files.length === 0 && (
          <div className="text-gray-500 text-sm p-2 ml-4 italic">Bucket is empty</div>
        )}
        {renderNode(hierarchy, '')}
      </div>
    );
  };

  const glassPanelClass = "bg-[#13131A]/80 border border-[#2A2A35] rounded-xl shadow-2xl backdrop-blur-md";

  const MetricCard = ({ label, value, icon }: any) => (
    <div className={`${glassPanelClass} p-4 flex items-center gap-4`}>
      <div className="p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-cyan-400 shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">{label}</span>
        <span className="text-xl font-bold text-gray-100">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#0B0B13] w-full min-h-screen text-gray-200 font-sans grid grid-cols-1 md:grid-cols-12 gap-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header & Controls */}
      <div className={`col-span-12 flex items-center justify-between ${glassPanelClass} p-5 z-10`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <DatabaseIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 tracking-tight">
            Object Storage Visualizer
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-gray-800 shadow-inner">
            <span className="text-sm font-medium text-gray-400">Versioning</span>
            <div 
              onClick={() => setVersioning(!versioning)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${versioning ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-gray-700'}`}
            >
              <motion.div 
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                animate={{ x: versioning ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
          <button 
            onClick={triggerUpload}
            disabled={uploading}
            className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploading && (
              <div 
                className="absolute top-0 left-0 bottom-0 bg-white/20" 
                style={{ width: `${transferTarget?.progress || 0}%`, transition: 'width 0.2s' }} 
              />
            )}
            <div className="relative flex items-center gap-2 z-10">
              <UploadCloudIcon className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </div>
          </button>
        </div>
      </div>

      {/* Left Panel: Namespace & Metrics */}
      <div className="col-span-12 md:col-span-4 flex flex-col gap-6 z-10">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Total Objects" value={metrics.count} icon={<LayersIcon />} />
          <MetricCard label="Total Storage" value={`${metrics.storage} MB`} icon={<HardDriveIcon />} />
          <div className="col-span-2">
            <MetricCard label="Request Latency" value={`${metrics.latency} ms`} icon={<ActivityIcon />} />
          </div>
        </div>

        <div className={`${glassPanelClass} flex-1 flex flex-col min-h-[400px] overflow-hidden`}>
          <div className="p-4 border-b border-gray-800/80 flex justify-between items-center bg-black/20">
            <h2 className="font-bold text-gray-200 flex items-center gap-2">
              <FolderIcon className="w-5 h-5 text-cyan-400" /> Namespace
            </h2>
            <div className="flex bg-black/60 rounded-lg p-1 border border-gray-800">
              <button 
                onClick={() => setViewMode('flat')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode==='flat'?'bg-gray-700 text-white shadow-sm':'text-gray-400 hover:text-gray-200'}`}
              >
                Flat
              </button>
              <button 
                onClick={() => setViewMode('hierarchy')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode==='hierarchy'?'bg-gray-700 text-white shadow-sm':'text-gray-400 hover:text-gray-200'}`}
              >
                Hierarchy
              </button>
            </div>
          </div>
          <div className="p-2 border-b border-gray-800/50 bg-blue-900/10">
            <p className="text-[10px] text-center text-blue-400/80 uppercase tracking-widest font-semibold">
              Directories are simulated via key prefixes
            </p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {renderNamespace()}
          </div>
        </div>
      </div>

      {/* Right Panel: Storage Architecture */}
      <div className="col-span-12 md:col-span-8 flex flex-col gap-6 z-10">
        {/* Metadata DB */}
        <div className={`${glassPanelClass} border-purple-500/30 p-5 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px]" />
          <h2 className="text-purple-400 font-bold mb-4 flex items-center gap-2 text-lg">
            <DatabaseIcon className="w-6 h-6" /> Metadata Database
          </h2>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto font-mono text-xs pr-2">
            <AnimatePresence>
              {objects.map(obj => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={obj.id} 
                  className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-purple-900/50 shadow-sm"
                >
                  <span className="text-gray-300 font-medium">{obj.key} <span className="text-purple-500 text-[10px] ml-1 bg-purple-500/10 px-1.5 py-0.5 rounded">v{obj.version}</span></span>
                  {obj.isTombstone ? (
                    <span className="text-red-400 font-semibold bg-red-400/10 px-2 py-1 rounded">TOMBSTONE</span>
                  ) : (
                    <span className="text-gray-500">[{obj.chunks.map(c => `N${c.nodeId}`).join(', ')}] - <span className="text-gray-400">{obj.size}MB</span></span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Incoming Metadata Animation */}
            {transferTarget && (
              <motion.div 
                initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} 
                className="flex justify-between items-center bg-purple-500/20 p-2.5 rounded-lg border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <span className="text-purple-300 font-medium">{transferTarget.obj.key} <span className="text-purple-400 text-[10px] ml-1">v{transferTarget.obj.version}</span></span>
                <span className="text-purple-400 animate-pulse font-semibold">Writing metadata...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Storage Nodes */}
        <div className={`flex-1 ${glassPanelClass} border-blue-500/30 p-5 flex flex-col relative`}>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-blue-500/5 blur-[50px] pointer-events-none" />
          <h2 className="text-blue-400 font-bold mb-5 flex items-center gap-2 text-lg">
            <ServerIcon className="w-6 h-6" /> Object Storage Nodes (Data Chunks)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 flex-1">
            {NODES.map(node => {
              const isReceiving = incomingChunksForNode(node.id).length > 0;
              return (
                <div key={node.id} className="bg-black/50 border border-gray-800 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-inner min-h-[160px]">
                  {/* Neon Receive Border */}
                  <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none transition-colors duration-200 ${isReceiving ? 'border-cyan-400 animate-pulse shadow-[0_0_15px_#22d3ee_inset]' : 'border-transparent'}`} />
                  
                  {/* Node Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800 z-10">
                    <span className="text-sm font-bold text-cyan-400 tracking-wide">{node.name}</span>
                    <HardDriveIcon className="w-5 h-5 text-cyan-700" />
                  </div>
                  
                  {/* Chunks Area */}
                  <div className="flex flex-wrap gap-2.5 content-start flex-1 z-10">
                    <AnimatePresence>
                      {chunksForNode(node.id).map(chunk => (
                        <motion.div 
                          key={chunk.id} 
                          layout
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={`w-6 h-6 rounded-md border border-white/20 ${chunk.color}`}
                          title={`Object: ${chunk.objectId} | Chunk: ${chunk.id}`}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Incoming Chunks Overlay */}
                  {isReceiving && (
                    <div className="absolute inset-0 bg-cyan-900/20 flex items-center justify-center backdrop-blur-[2px] z-20">
                      <motion.div 
                        className={`w-8 h-8 rounded-md animate-ping ${incomingChunksForNode(node.id)[0].color}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}

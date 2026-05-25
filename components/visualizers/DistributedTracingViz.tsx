"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type SpanStatus = 'pending' | 'success' | 'error';

type Span = {
  id: string;
  parentId: string | null;
  serviceId: string;
  name: string;
  startTime: number;
  duration: number;
  status: SpanStatus;
  depth: number;
};

type TraceEmit = {
  id: string;
  source: string;
  ts: number;
};

// --- Architecture Definition ---
const NODES = {
  user: { label: 'Client', x: 50, y: 10, color: '#ffffff', icon: '👤' },
  gateway: { label: 'API Gateway', x: 50, y: 35, color: '#00f0ff', icon: '🚪' },
  auth: { label: 'Auth Service', x: 20, y: 60, color: '#ff003c', icon: '🔒' },
  product: { label: 'Product Service', x: 80, y: 60, color: '#b026ff', icon: '📦' },
  database: { label: 'PostgreSQL', x: 80, y: 85, color: '#39ff14', icon: '🗄️' },
  tracing: { label: 'Jaeger Backend', x: 20, y: 85, color: '#ffaa00', icon: '📊' }
};

const EDGES = [
  { id: 'user-gateway', from: 'user', to: 'gateway' },
  { id: 'gateway-auth', from: 'gateway', to: 'auth' },
  { id: 'gateway-product', from: 'gateway', to: 'product' },
  { id: 'product-database', from: 'product', to: 'database' },
];

// --- Helper Components ---
const HighlightedLog = ({ text }: { text: string }) => {
  const parts = text.split(/(t-[0-9a-f]{6}|s-[0-9a-f]{6}|ERROR:|200 OK|401 Unauthorized)/);
  return (
    <span className="font-mono text-xs">
      {parts.map((part, i) => {
        if (part.startsWith('t-')) return <span key={i} className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded">{part}</span>;
        if (part.startsWith('s-')) return <span key={i} className="text-green-400 font-bold bg-green-400/10 px-1 rounded">{part}</span>;
        if (part === 'ERROR:' || part === '401 Unauthorized') return <span key={i} className="text-red-500 font-bold">{part}</span>;
        if (part === '200 OK') return <span key={i} className="text-blue-400 font-bold">{part}</span>;
        return part;
      })}
    </span>
  );
};

export default function DistributedTracingViz() {
  // --- State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [latencyEnabled, setLatencyEnabled] = useState(false);
  const [failureEnabled, setFailureEnabled] = useState(false);
  
  const [spans, setSpans] = useState<Span[]>([]);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [activeEdges, setActiveEdges] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [traceEmits, setTraceEmits] = useState<TraceEmit[]>([]);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [runToken, setRunToken] = useState(0);

  // --- Refs ---
  const runIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- Derived ---
  const maxAxisTime = latencyEnabled ? 3000 : 1500;

  // --- Effects ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isProcessing) {
      const start = Date.now();
      timer = setInterval(() => {
        setElapsedTime(Date.now() - start);
      }, 16);
    }
    return () => clearInterval(timer);
  }, [isProcessing, runToken]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Actions ---
  const addLog = (msg: string) => setLogs(p => [...p, msg]);
  
  const emitTrace = (source: string) => {
    const id = Math.random().toString(36).substring(7);
    setTraceEmits(p => [...p.slice(-15), { id, source, ts: Date.now() }]);
    setTimeout(() => {
      setTraceEmits(p => p.filter(x => x.id !== id));
    }, 1000);
  };

  const startSimulation = async () => {
    runIdRef.current += 1;
    const currentRun = runIdRef.current;
    
    setIsProcessing(true);
    setElapsedTime(0);
    setSpans([]);
    setActiveNodes([]);
    setActiveEdges([]);
    setLogs([]);
    setRunToken(t => t + 1);
    
    const tId = 't-' + Math.random().toString(16).slice(2, 8);
    const s1Id = 's-' + Math.random().toString(16).slice(2, 8);
    const startRealTime = Date.now();
    
    const waitUntil = async (targetMs: number) => {
      while (Date.now() - startRealTime < targetMs) {
        if (runIdRef.current !== currentRun) throw new Error('Aborted');
        await new Promise(r => setTimeout(r, 16));
      }
    };

    try {
      // 0ms: User -> Gateway
      setSpans([{ id: s1Id, parentId: null, serviceId: 'gateway', name: 'POST /api/checkout', startTime: 0, duration: 0, status: 'pending', depth: 0 }]);
      setActiveNodes(['gateway']);
      setActiveEdges(['user-gateway']);
      addLog(`[HTTP] Client -> Gateway. Headers: { X-B3-TraceId: ${tId} }`);
      
      await waitUntil(200);
      
      // 200ms: Gateway -> Auth
      const s2Id = 's-' + Math.random().toString(16).slice(2, 8);
      setSpans(p => [...p, { id: s2Id, parentId: s1Id, serviceId: 'auth', name: 'gRPC /validateToken', startTime: 200, duration: 0, status: 'pending', depth: 1 }]);
      setActiveNodes(['gateway', 'auth']);
      setActiveEdges(['gateway-auth']);
      addLog(`[gRPC] Gateway -> Auth. Metadata: { trace-id: ${tId}, span-id: ${s2Id}, parent: ${s1Id} }`);
      
      if (failureEnabled) {
        await waitUntil(500);
        // Auth Fails
        setSpans(p => p.map(s => s.id === s2Id ? { ...s, duration: 300, status: 'error' } : s));
        emitTrace('auth');
        addLog(`[Auth] ERROR: Token validation failed.`);
        
        await waitUntil(600);
        // Gateway Fails
        setSpans(p => p.map(s => s.id === s1Id ? { ...s, duration: 600, status: 'error' } : s));
        emitTrace('gateway');
        addLog(`[Gateway] 401 Unauthorized. Aborting request.`);
        
        setActiveNodes([]);
        setActiveEdges([]);
        setIsProcessing(false);
        return;
      }
      
      await waitUntil(500);
      // Auth Success
      setSpans(p => p.map(s => s.id === s2Id ? { ...s, duration: 300, status: 'success' } : s));
      emitTrace('auth');
      addLog(`[Auth] Token valid. Emitted Span ${s2Id} to Jaeger.`);
      
      await waitUntil(600);
      // Gateway -> Product
      const s3Id = 's-' + Math.random().toString(16).slice(2, 8);
      setSpans(p => [...p, { id: s3Id, parentId: s1Id, serviceId: 'product', name: 'POST /orders', startTime: 600, duration: 0, status: 'pending', depth: 1 }]);
      setActiveNodes(['gateway', 'product']);
      setActiveEdges(['gateway-product']);
      addLog(`[HTTP] Gateway -> Product. Headers: { traceparent: 00-${tId}-${s3Id}-01 }`);
      
      await waitUntil(700);
      // Product -> DB
      const s4Id = 's-' + Math.random().toString(16).slice(2, 8);
      setSpans(p => [...p, { id: s4Id, parentId: s3Id, serviceId: 'database', name: 'UPDATE inventory', startTime: 700, duration: 0, status: 'pending', depth: 2 }]);
      setActiveNodes(['gateway', 'product', 'database']);
      setActiveEdges(['product-database']);
      addLog(`[SQL] Product -> DB. Context: { span_id: ${s4Id} }`);
      
      const dbDuration = latencyEnabled ? 1500 : 300;
      await waitUntil(700 + dbDuration);
      
      // DB Success
      setSpans(p => p.map(s => s.id === s4Id ? { ...s, duration: dbDuration, status: 'success' } : s));
      emitTrace('database');
      addLog(`[DB] Query complete. Emitted Span ${s4Id}.`);
      
      await waitUntil(700 + dbDuration + 100);
      // Product Success
      const prodTotal = 700 + dbDuration + 100 - 600;
      setSpans(p => p.map(s => s.id === s3Id ? { ...s, duration: prodTotal, status: 'success' } : s));
      emitTrace('product');
      addLog(`[Product] Order processed. Emitted Span ${s3Id}.`);
      
      await waitUntil(700 + dbDuration + 200);
      // Gateway Success
      const gwTotal = 700 + dbDuration + 200;
      setSpans(p => p.map(s => s.id === s1Id ? { ...s, duration: gwTotal, status: 'success' } : s));
      emitTrace('gateway');
      addLog(`[HTTP] Gateway -> Client. 200 OK. Total time: ${gwTotal}ms`);
      
      setActiveNodes([]);
      setActiveEdges([]);
      setIsProcessing(false);
      
    } catch (e) {
      // Aborted silently on new run
    }
  };

  return (
    <div className="flex flex-col w-full h-[700px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950 font-sans text-white shadow-2xl">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
      
      {/* Top Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={startSimulation}
            disabled={isProcessing}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-bold tracking-wide hover:from-blue-400 hover:to-purple-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            {isProcessing ? 'Tracing Request...' : 'Send Request'}
          </button>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${latencyEnabled ? 'bg-green-500' : 'bg-gray-700'}`}>
               <div className={`w-3 h-3 bg-white rounded-full transition-transform ${latencyEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" checked={latencyEnabled} onChange={e => setLatencyEnabled(e.target.checked)} className="hidden" />
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Slow DB (1.5s)</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer group">
             <div className={`w-10 h-5 rounded-full p-1 transition-colors ${failureEnabled ? 'bg-red-500' : 'bg-gray-700'}`}>
               <div className={`w-3 h-3 bg-white rounded-full transition-transform ${failureEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" checked={failureEnabled} onChange={e => setFailureEnabled(e.target.checked)} className="hidden" />
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Auth Failure (500)</span>
          </label>
        </div>
        
        <div className="hidden md:flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded border border-gray-800">
          <span className="text-xs text-gray-400">Context:</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">W3C Traceparent</span>
          <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">B3 Headers</span>
        </div>
      </div>
      
      {/* Main Content Split */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        
        {/* Left Col: Network Architecture */}
        <div className="relative w-full lg:w-2/5 h-64 lg:h-full bg-[#09090b] flex items-center justify-center overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-gray-800">
          {/* Cyberpunk Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          {/* SVG Connectors Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* Dashed lines to tracing */}
            {['gateway', 'auth', 'product', 'database'].map(service => (
              <line
                key={`trace-${service}`}
                x1={`${NODES[service as keyof typeof NODES].x}%`} 
                y1={`${NODES[service as keyof typeof NODES].y}%`}
                x2={`${NODES.tracing.x}%`} 
                y2={`${NODES.tracing.y}%`}
                stroke="#ffaa00"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.2}
              />
            ))}
            
            {/* Service Edges */}
            {EDGES.map(e => {
              const from = NODES[e.from as keyof typeof NODES];
              const to = NODES[e.to as keyof typeof NODES];
              const isActive = activeEdges.includes(e.id);
              return (
                <line
                  key={e.id}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke={isActive ? from.color : '#333'}
                  strokeWidth={isActive ? 2 : 1}
                  className="transition-all duration-300"
                  style={{ filter: isActive ? `drop-shadow(0 0 8px ${from.color})` : 'none' }}
                />
              );
            })}
            
            {/* Network Packets (Particles) */}
            {activeEdges.map(edgeId => {
              const e = EDGES.find(x => x.id === edgeId)!;
              const from = NODES[e.from as keyof typeof NODES];
              const to = NODES[e.to as keyof typeof NODES];
              return (
                <motion.circle
                  key={`particle-${edgeId}`}
                  r={4}
                  fill="#fff"
                  initial={{ cx: `${from.x}%`, cy: `${from.y}%` }}
                  animate={{ cx: `${to.x}%`, cy: `${to.y}%` }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                  style={{ filter: 'drop-shadow(0 0 6px #fff)' }}
                />
              );
            })}

            {/* Trace Backend Emits */}
            <AnimatePresence>
              {traceEmits.map(emit => {
                const from = NODES[emit.source as keyof typeof NODES];
                const to = NODES.tracing;
                return (
                  <motion.circle
                    key={emit.id}
                    r={5}
                    fill="#ffaa00"
                    initial={{ cx: `${from.x}%`, cy: `${from.y}%`, opacity: 1 }}
                    animate={{ cx: `${to.x}%`, cy: `${to.y}%`, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeIn" }}
                    style={{ filter: 'drop-shadow(0 0 10px #ffaa00)' }}
                  />
                );
              })}
            </AnimatePresence>
          </svg>

          {/* Nodes Layer */}
          {Object.entries(NODES).map(([id, node]) => {
            const isActive = activeNodes.includes(id);
            return (
              <div 
                key={id} 
                className="absolute flex flex-col items-center justify-center z-10 transition-transform duration-300"
                style={{ 
                  left: `${node.x}%`, 
                  top: `${node.y}%`, 
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.15 : 1})`
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-300 bg-gray-900"
                  style={{ 
                    backgroundColor: `${node.color}${isActive ? '30' : '10'}`, 
                    borderColor: isActive ? node.color : `${node.color}55`,
                    boxShadow: isActive ? `0 0 20px ${node.color}` : 'none'
                  }}
                >
                  {node.icon}
                </div>
                <span className="mt-2 text-[10px] font-bold tracking-wider text-gray-300 bg-black/80 px-2 py-0.5 rounded border border-gray-800 shadow-md">
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Right Col: Timeline & Logs */}
        <div className="flex flex-col w-full lg:w-3/5 bg-gray-950 flex-1 min-h-0">
          
          {/* Timeline View */}
          <div className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden min-h-0">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2 shrink-0">
              <span className="text-orange-500 text-xl">📊</span> Trace Timeline
              {spans.length > 0 && <span className="ml-auto text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">Elapsed: {elapsedTime}ms</span>}
            </h3>
            
            {spans.length === 0 && !isProcessing ? (
              <div className="flex-1 flex items-center justify-center text-gray-600 flex-col gap-3">
                <div className="text-5xl opacity-50 mb-2">⏱️</div>
                <p>Waiting for request trace data...</p>
                <p className="text-xs">Click "Send Request" to begin distributed tracing.</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Timeline Header (Axis) */}
                <div className="flex border-b border-gray-800 pb-2 mb-2 text-[10px] font-mono text-gray-500 shrink-0">
                  <div className="w-[40%] pl-2">SERVICE : OPERATION</div>
                  <div className="w-[60%] relative h-4">
                    <span className="absolute left-0">0ms</span>
                    <span className="absolute left-1/4 -translate-x-1/2">{Math.round(maxAxisTime * 0.25)}ms</span>
                    <span className="absolute left-1/2 -translate-x-1/2">{Math.round(maxAxisTime * 0.5)}ms</span>
                    <span className="absolute left-3/4 -translate-x-1/2">{Math.round(maxAxisTime * 0.75)}ms</span>
                    <span className="absolute right-0">{maxAxisTime}ms</span>
                  </div>
                </div>
                
                {/* Spans List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                  <AnimatePresence>
                    {spans.map((span) => {
                      const node = NODES[span.serviceId as keyof typeof NODES];
                      const isErr = span.status === 'error';
                      const duration = span.status === 'pending' ? Math.max(0, elapsedTime - span.startTime) : span.duration;
                      const leftPct = (span.startTime / maxAxisTime) * 100;
                      const widthPct = (duration / maxAxisTime) * 100;
                      
                      return (
                        <motion.div 
                          key={span.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex text-sm items-center group relative"
                        >
                          {/* Left Column: Service & Name */}
                          <div 
                            className="w-[40%] pr-4 truncate flex items-center gap-2 py-1.5"
                            style={{ paddingLeft: `${(span.depth * 1) + 0.5}rem` }}
                          >
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                            <span className="font-semibold text-gray-300 text-xs truncate">{node.label}</span>
                            <span className="text-gray-500 text-[10px] truncate hidden sm:inline">{span.name}</span>
                          </div>
                          
                          {/* Right Column: Gantt Area */}
                          <div className="w-[60%] relative h-8 bg-gray-900/30 rounded flex items-center group-hover:bg-gray-800/50 transition-colors border-l border-gray-800/50">
                            {/* Gantt Bar */}
                            <div
                              className="absolute h-5 rounded-sm opacity-90 border-l-[3px] shadow-sm transition-all duration-75"
                              style={{
                                backgroundColor: isErr ? '#ef444433' : `${node.color}44`,
                                borderColor: isErr ? '#ef4444' : node.color,
                                left: `${leftPct}%`,
                                width: `${Math.max(widthPct, 0.5)}%`,
                              }}
                            />
                            {/* Duration Label */}
                            <span 
                              className={`absolute text-[10px] font-mono whitespace-nowrap z-10 transition-all ${isErr ? 'text-red-400' : 'text-gray-300'}`}
                              style={{ left: `calc(${leftPct + widthPct}% + 8px)` }}
                            >
                              {duration}ms {isErr && '⚠️'}
                            </span>
                            
                            {/* Grid Lines Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex justify-between">
                              <div className="w-1/4 border-r border-gray-800/30 h-full" />
                              <div className="w-1/4 border-r border-gray-800/30 h-full" />
                              <div className="w-1/4 border-r border-gray-800/30 h-full" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
          
          {/* Log Console View */}
          <div className="h-48 md:h-64 bg-[#09090b] border-t border-gray-800 p-4 flex flex-col relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] shrink-0">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2 pb-2 border-b border-gray-800/50 shrink-0 font-mono">
              <span>> Trace Context Propagation Logs</span>
              <span className="text-[10px] text-gray-600 bg-gray-900 px-2 py-0.5 rounded">Auto-scroll</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
              {logs.length === 0 && (
                <div className="text-gray-600 font-mono text-xs italic">Awaiting network activity...</div>
              )}
              {logs.map((log, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400 py-0.5 flex gap-2"
                >
                  <span className="text-gray-600 shrink-0 font-mono">
                    [{new Date().toISOString().split('T')[1].slice(0, 11)}]
                  </span>
                  <HighlightedLog text={log} />
                </motion.div>
              ))}
              <div ref={logsEndRef} className="h-1" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ShieldAlert, Cpu, HardDrive, 
  Layers, Zap, RefreshCcw, Server, Terminal,
  Settings, Database, BarChart2
} from 'lucide-react';

// --- Types ---
type LogEntry = {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
};

type TraceEntry = {
  id: string;
  service: string;
  duration: number;
  status: 'ok' | 'error';
  timestamp: string;
};

type MetricPoint = {
  time: number;
  value: number;
};

const MAX_HISTORY = 40;

// --- Subcomponents ---

const Particles = ({ active, color, delay = 0 }: { active: boolean, color: string, delay?: number }) => {
  const glowColors: Record<string, string> = {
    'bg-cyan-400': '#22d3ee',
    'bg-green-400': '#4ade80',
    'bg-purple-400': '#c084fc',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(active ? 6 : 2)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute h-1 w-3 rounded-full ${color} opacity-70`}
          style={{ 
            top: `${20 + Math.random() * 60}%`, 
            boxShadow: `0 0 10px ${glowColors[color] || '#fff'}`
          }}
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ 
            duration: active ? 0.6 + Math.random() * 0.4 : 1.5 + Math.random(), 
            delay: delay + Math.random() * 2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
};

const AgentBadge = ({ name, type, color, borderColor, icon: Icon }: { name: string, type: string, color: string, borderColor: string, icon: any }) => (
  <div className={`p-2 rounded-lg border ${borderColor} bg-slate-900/80 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-md z-10 w-full h-full`}>
    <Icon className={`w-4 h-4 mb-1 ${color}`} />
    <div className={`text-xs font-bold ${color}`}>{name}</div>
    <div className="text-[9px] text-slate-400 uppercase tracking-wider">{type}</div>
  </div>
);

const Sparkline = ({ data, color, threshold }: { data: MetricPoint[], color: string, threshold: number }) => {
  if (data.length === 0) return <div className="h-full w-full bg-slate-800/30 rounded animate-pulse" />;
  
  const maxH = 100;
  const w = 400; 
  const h = 100;
  
  const points = data.map((d, i) => {
    const x = (i / (MAX_HISTORY - 1)) * w;
    const y = h - (d.value / maxH) * h;
    return `${x},${y}`;
  }).join(' ');

  const thresholdY = h - (threshold / maxH) * h;
  const currentVal = data[data.length - 1].value;
  const isAlerting = currentVal > threshold;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <line x1="0" y1={thresholdY} x2={w} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
      <text x="5" y={thresholdY - 5} fill="#ef4444" fontSize="10" opacity="0.8" className="font-mono">Alert: {threshold}%</text>
      
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {data.length > 0 && (
        <circle 
          cx={w} 
          cy={h - (currentVal / maxH) * h} 
          r="4" 
          fill={isAlerting ? '#ef4444' : color} 
          className={isAlerting ? 'animate-ping' : ''}
        />
      )}
    </svg>
  );
};

const MetricCard = ({ title, value, data, color, threshold, isAlert }: { title: string, value: string, data: MetricPoint[], color: string, threshold: number, isAlert: boolean }) => (
  <div className={`bg-slate-900/60 backdrop-blur-md rounded-xl border flex flex-col p-4 relative overflow-hidden transition-colors ${isAlert ? 'border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.15)]' : 'border-slate-800'}`}>
    <div className="flex justify-between items-start mb-2 z-10">
      <div className="text-sm font-semibold text-slate-400">{title}</div>
      <div className={`text-2xl font-bold font-mono ${isAlert ? 'text-red-400 animate-pulse' : 'text-white'}`}>{value}</div>
    </div>
    <div className="flex-1 relative z-10 mt-2">
      <Sparkline data={data} color={color} threshold={threshold} />
    </div>
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: color }} />
  </div>
);

// --- Main Component ---
export default function MonitoringViz() {
  const [trafficSpike, setTrafficSpike] = useState(false);
  const [cpuThreshold, setCpuThreshold] = useState(80);
  const [memThreshold, setMemThreshold] = useState(85);
  
  const [cpuMetrics, setCpuMetrics] = useState<MetricPoint[]>([]);
  const [memMetrics, setMemMetrics] = useState<MetricPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [traces, setTraces] = useState<TraceEntry[]>([]);
  
  const [alerting, setAlerting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize dummy data
  useEffect(() => {
    const now = Date.now();
    const initCpu = Array.from({ length: MAX_HISTORY }).map((_, i) => ({
      time: now - (MAX_HISTORY - i) * 800,
      value: 25 + Math.random() * 15
    }));
    const initMem = Array.from({ length: MAX_HISTORY }).map((_, i) => ({
      time: now - (MAX_HISTORY - i) * 800,
      value: 45 + Math.random() * 10
    }));
    setCpuMetrics(initCpu);
    setMemMetrics(initMem);
    
    setLogs([
      { id: 'init-1', timestamp: new Date().toISOString().split('T')[1].substring(0, 12), level: 'INFO', service: 'System', message: 'Monitoring initialized' },
      { id: 'init-2', timestamp: new Date().toISOString().split('T')[1].substring(0, 12), level: 'INFO', service: 'Agent', message: 'Connected to telemetry backends' }
    ]);
  }, []);

  // Simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Calculate current metrics
      const baseCpu = trafficSpike ? 88 : 30;
      const baseMem = trafficSpike ? 92 : 45;
      
      const cpuJitter = (Math.random() - 0.5) * 20;
      const memJitter = (Math.random() - 0.5) * 15;
      
      const currentCpu = Math.min(100, Math.max(0, baseCpu + cpuJitter));
      const currentMem = Math.min(100, Math.max(0, baseMem + memJitter));
      
      // Update metrics
      setCpuMetrics(prev => {
        if (prev.length === 0) return [];
        return [...prev.slice(-(MAX_HISTORY - 1)), { time: now, value: currentCpu }];
      });
      setMemMetrics(prev => {
        if (prev.length === 0) return [];
        return [...prev.slice(-(MAX_HISTORY - 1)), { time: now, value: currentMem }];
      });
      
      // Check alerts
      const isCpuAlert = currentCpu > cpuThreshold;
      const isMemAlert = currentMem > memThreshold;
      setAlerting(isCpuAlert || isMemAlert);
      
      // Generate logs
      const services = ['Web UI', 'API Gateway', 'User DB'];
      const svc = services[Math.floor(Math.random() * services.length)];
      let level: 'INFO' | 'WARN' | 'ERROR' = 'INFO';
      let msg = 'Request processed successfully';
      
      if (trafficSpike) {
        if (Math.random() > 0.5) {
          level = 'ERROR';
          msg = isCpuAlert ? 'Connection pool timeout' : 'Out of memory killer triggered';
        } else if (Math.random() > 0.2) {
          level = 'WARN';
          msg = 'High latency detected on upstream';
        }
      } else {
        if (Math.random() > 0.95) {
          level = 'WARN';
          msg = 'Retrying connection drops...';
        }
      }
      
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
        level,
        service: svc,
        message: msg
      };
      
      setLogs(prev => [...prev.slice(-49), newLog]);
      
      // Generate traces occasionally
      if (Math.random() > (trafficSpike ? 0.2 : 0.6)) {
        const duration = trafficSpike ? 500 + Math.random() * 2500 : 50 + Math.random() * 150;
        const newTrace: TraceEntry = {
          id: Math.random().toString(36).substring(2, 8),
          service: svc,
          duration: Math.round(duration),
          status: level === 'ERROR' ? 'error' : 'ok',
          timestamp: new Date().toISOString().split('T')[1].substring(0, 12)
        };
        setTraces(prev => [newTrace, ...prev.slice(0, 9)]);
      }

    }, 800);
    
    return () => clearInterval(interval);
  }, [trafficSpike, cpuThreshold, memThreshold]);

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const currentCpu = cpuMetrics.length > 0 ? cpuMetrics[cpuMetrics.length - 1].value : 0;
  const currentMem = memMetrics.length > 0 ? memMetrics[memMetrics.length - 1].value : 0;
  const isCpuAlert = currentCpu > cpuThreshold;
  const isMemAlert = currentMem > memThreshold;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-6 pt-20 flex flex-col xl:flex-row gap-6 font-sans relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-500 opacity-10 blur-[120px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 leading-tight">
              SystemSense
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Observability Platform
            </div>
          </div>
        </div>
      </div>

      {/* Left Panel: Architecture & Controls */}
      <div className="w-full xl:w-5/12 flex flex-col gap-6 z-10">
        
        {/* Architecture Diagram */}
        <div className={`relative rounded-xl border p-6 flex flex-col gap-4 transition-colors duration-500 ${alerting ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'bg-slate-900/40 border-slate-700/50 shadow-xl backdrop-blur-sm'}`}>
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Layers className="w-5 h-5" /> Telemetry Pipeline
          </h3>
          
          <div className="flex items-stretch justify-between relative h-64 mt-2">
            {/* Connection Lines */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute w-full h-px border-t border-dashed border-cyan-500/30 top-[16.66%]" />
              <div className="absolute w-full h-px border-t border-dashed border-green-500/30 top-[50%]" />
              <div className="absolute w-full h-px border-t border-dashed border-purple-500/30 top-[83.33%]" />
            </div>

            {/* Services */}
            <div className="flex flex-col justify-around z-10 w-[28%]">
              {['Web UI', 'API Gateway', 'User DB'].map((svc, i) => (
                <div key={i} className={`h-12 p-2 rounded-lg border flex items-center justify-center text-xs font-bold text-center transition-colors shadow-lg ${trafficSpike ? 'bg-slate-800 border-cyan-500/50 text-cyan-300' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>
                  <Server className="w-4 h-4 mr-2 opacity-70" /> {svc}
                </div>
              ))}
            </div>

            {/* Particles 1 */}
            <div className="flex-1 relative z-0">
              <Particles active={trafficSpike} color="bg-cyan-400" />
              <Particles active={trafficSpike} color="bg-green-400" delay={0.3} />
            </div>

            {/* Agents */}
            <div className="flex flex-col justify-around z-10 w-[28%]">
              <div className="h-12"><AgentBadge name="Prometheus" type="Metrics" color="text-cyan-400" borderColor="border-cyan-500/40" icon={BarChart2} /></div>
              <div className="h-12"><AgentBadge name="Fluent Bit" type="Logs" color="text-green-400" borderColor="border-green-500/40" icon={Terminal} /></div>
              <div className="h-12"><AgentBadge name="OpenTelemetry" type="Traces" color="text-purple-400" borderColor="border-purple-500/40" icon={Activity} /></div>
            </div>

            {/* Particles 2 */}
            <div className="flex-1 relative z-0">
              <Particles active={trafficSpike} color="bg-purple-400" delay={0.1} />
              <Particles active={trafficSpike} color="bg-cyan-400" delay={0.4} />
            </div>

            {/* Storage */}
            <div className="flex flex-col justify-around z-10 w-[28%]">
              <div className="h-12"><AgentBadge name="TSDB" type="Storage" color="text-cyan-400" borderColor="border-cyan-500/40" icon={Database} /></div>
              <div className="h-12"><AgentBadge name="Elastic" type="Storage" color="text-green-400" borderColor="border-green-500/40" icon={Database} /></div>
              <div className="h-12"><AgentBadge name="Jaeger" type="Backend" color="text-purple-400" borderColor="border-purple-500/40" icon={Database} /></div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-900/40 border border-slate-700/50 backdrop-blur-md rounded-xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" /> Control Panel
            </h3>
            <button 
              onClick={() => setTrafficSpike(!trafficSpike)}
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 w-48 ${
                trafficSpike 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
              }`}
            >
              <Zap className={`w-4 h-4 ${trafficSpike ? 'animate-pulse' : ''}`} />
              {trafficSpike ? 'Disable Spike' : 'Generate Spike'}
            </button>
          </div>
          
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400 flex items-center gap-1"><Cpu className="w-4 h-4"/> CPU Alert Threshold</span>
                <span className="text-cyan-400 font-bold font-mono">{cpuThreshold}%</span>
              </div>
              <input 
                type="range" min="10" max="95" 
                value={cpuThreshold} 
                onChange={(e) => setCpuThreshold(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400 flex items-center gap-1"><HardDrive className="w-4 h-4"/> Memory Alert Threshold</span>
                <span className="text-purple-400 font-bold font-mono">{memThreshold}%</span>
              </div>
              <input 
                type="range" min="10" max="95" 
                value={memThreshold} 
                onChange={(e) => setMemThreshold(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel: Dashboard */}
      <div className="w-full xl:w-7/12 flex flex-col gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 shadow-2xl z-10 backdrop-blur-sm">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-200">Live Dashboards</h2>
          </div>
          <div className="flex items-center gap-4">
            {alerting && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-4 h-4" /> ALERTS TRIGGERED
              </div>
            )}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                <RefreshCcw className="w-3 h-3 animate-spin-slow" /> 1s
              </div>
              <div className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                Last 30s
              </div>
            </div>
          </div>
        </div>

        {/* Top Row: Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-48">
          <MetricCard 
            title="CPU Usage" 
            value={`${Math.round(currentCpu)}%`} 
            data={cpuMetrics} 
            color="#06b6d4" 
            threshold={cpuThreshold} 
            isAlert={isCpuAlert} 
          />
          <MetricCard 
            title="Memory Usage" 
            value={`${Math.round(currentMem)}%`} 
            data={memMetrics} 
            color="#a855f7" 
            threshold={memThreshold} 
            isAlert={isMemAlert} 
          />
        </div>

        {/* Middle Row: Logs */}
        <div className="flex-1 flex flex-col bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden min-h-[220px]">
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Terminal className="w-4 h-4 text-green-400" /> Log Stream
            </div>
            <div className="text-[10px] text-slate-500 font-mono">/var/log/containers/*.log</div>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-[11px] flex-1 space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 hover:bg-slate-800/50 py-0.5 px-1 rounded transition-colors">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span className={`font-bold w-12 shrink-0 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {log.level}
                </span>
                <span className="text-cyan-600 font-semibold w-24 truncate shrink-0">[{log.service}]</span>
                <span className={log.level === 'ERROR' ? 'text-red-300' : 'text-slate-300'}>{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Bottom Row: Traces */}
        <div className="h-48 flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-md">
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Layers className="w-4 h-4 text-purple-400" /> Recent Distributed Traces
          </div>
          <div className="p-4 overflow-y-auto font-mono text-[11px] flex-1 space-y-3">
            <AnimatePresence>
              {traces.map(trace => (
                <motion.div 
                  key={trace.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 w-full"
                >
                  <div className="w-20 text-slate-500 shrink-0">{trace.timestamp}</div>
                  <div className="w-16 font-bold text-slate-400 shrink-0">{trace.id}</div>
                  <div className="w-24 text-cyan-600 truncate shrink-0">{trace.service}</div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="relative h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, trace.duration / 30)}%` }}
                        className={`absolute top-0 left-0 h-full rounded-full ${trace.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-purple-500 shadow-[0_0_8px_#a855f7]'}`}
                      />
                    </div>
                  </div>
                  <div className={`w-16 text-right shrink-0 ${trace.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                    {trace.duration}ms
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

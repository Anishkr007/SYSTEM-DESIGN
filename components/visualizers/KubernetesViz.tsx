"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const ServerIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const DatabaseIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const SettingsIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const RefreshIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const HardDriveIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const RealPowerIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" /></svg>;
const BoxIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const TrashIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const XIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const GlobeIcon = (p: any) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;

// --- Types ---
type NodeStatus = 'ready' | 'not_ready';
type PodStatus = 'pending' | 'creating' | 'running' | 'terminating';
type LogComponent = 'api' | 'scheduler' | 'controller' | 'kubelet' | 'system';

interface K8sNode {
    id: string;
    name: string;
    status: NodeStatus;
    cpuUsed: number;
    memUsed: number;
}

interface K8sPod {
    id: string;
    name: string;
    nodeId: string | null;
    status: PodStatus;
}

interface LogEntry {
    id: string;
    time: string;
    message: string;
    component: LogComponent;
}

export default function KubernetesViz() {
    const [replicas, setReplicas] = useState(3);
    const [nodes, setNodes] = useState<K8sNode[]>([
        { id: 'n1', name: 'worker-node-1', status: 'ready', cpuUsed: 10, memUsed: 20 },
        { id: 'n2', name: 'worker-node-2', status: 'ready', cpuUsed: 15, memUsed: 25 },
        { id: 'n3', name: 'worker-node-3', status: 'ready', cpuUsed: 12, memUsed: 18 },
    ]);
    const [pods, setPods] = useState<K8sPod[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [serviceActive, setServiceActive] = useState(false);
    const [trafficFlows, setTrafficFlows] = useState<any[]>([]);

    const podsRef = useRef(pods);
    const nodesRef = useRef(nodes);
    const serviceActiveRef = useRef(serviceActive);

    useEffect(() => { podsRef.current = pods; }, [pods]);
    useEffect(() => { nodesRef.current = nodes; }, [nodes]);
    useEffect(() => { serviceActiveRef.current = serviceActive; }, [serviceActive]);

    const addLog = useCallback((msg: string, component: LogComponent) => {
        setLogs(prev => {
            const newLog = { id: Math.random().toString(), time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: msg, component };
            return [newLog, ...prev].slice(0, 50);
        });
    }, []);

    // Controller Manager Loop (Deployment Scale)
    useEffect(() => {
        const interval = setInterval(() => {
            setPods(currentPods => {
                const activePods = currentPods.filter(p => p.status !== 'terminating');
                let newPods = [...currentPods];
                let changed = false;
                
                if (activePods.length < replicas) {
                    const toCreate = replicas - activePods.length;
                    for (let i = 0; i < toCreate; i++) {
                        const newId = `pod-${Math.random().toString(36).substr(2, 5)}`;
                        newPods.push({ id: newId, name: `nginx-${newId}`, nodeId: null, status: 'pending' });
                        addLog(`ReplicaSet scaling up: created ${newId}`, 'controller');
                        changed = true;
                    }
                } else if (activePods.length > replicas) {
                    const toRemove = activePods.length - replicas;
                    let removed = 0;
                    for (let i = newPods.length - 1; i >= 0 && removed < toRemove; i--) {
                        if (newPods[i].status !== 'terminating' && newPods[i].status !== 'pending') {
                            newPods[i] = { ...newPods[i], status: 'terminating' };
                            addLog(`ReplicaSet scaling down: terminating ${newPods[i].name.split('-')[1]}`, 'controller');
                            removed++;
                            changed = true;
                        }
                    }
                }
                return changed ? newPods : currentPods;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [replicas, addLog]);

    // Scheduler Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setPods(currentPods => {
                let changed = false;
                const newPods = currentPods.map(pod => {
                    if (pod.status === 'pending' && !pod.nodeId) {
                        const readyNodes = nodesRef.current.filter(n => n.status === 'ready');
                        if (readyNodes.length > 0) {
                            const node = readyNodes[Math.floor(Math.random() * readyNodes.length)];
                            addLog(`Scheduled ${pod.name.split('-')[1]} to ${node.name}`, 'scheduler');
                            changed = true;
                            return { ...pod, nodeId: node.id, status: 'creating' as PodStatus };
                        }
                    }
                    return pod;
                });
                return changed ? newPods : currentPods;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [addLog]);

    // Kubelet / Node Health Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setPods(currentPods => {
                let changed = false;
                let newPods = [...currentPods];
                
                // Evict pods on down nodes
                newPods = newPods.map(pod => {
                    if (pod.nodeId) {
                        const node = nodesRef.current.find(n => n.id === pod.nodeId);
                        if (!node || node.status === 'not_ready') {
                            if (pod.status !== 'terminating' && pod.status !== 'pending') {
                                changed = true;
                                addLog(`Node NotReady, evicting ${pod.name.split('-')[1]}`, 'kubelet');
                                return { ...pod, status: 'terminating' as PodStatus };
                            }
                        }
                    }
                    return pod;
                });

                // creating -> running
                newPods = newPods.map(pod => {
                    if (pod.status === 'creating' && Math.random() > 0.3) {
                        changed = true;
                        addLog(`Container started for ${pod.name.split('-')[1]}`, 'kubelet');
                        return { ...pod, status: 'running' as PodStatus };
                    }
                    return pod;
                });
                
                // remove terminating
                const finalPods = newPods.filter(pod => {
                    if (pod.status === 'terminating' && Math.random() > 0.6) {
                        changed = true;
                        addLog(`Deleted pod ${pod.name.split('-')[1]}`, 'api');
                        return false;
                    }
                    return true;
                });

                return changed ? finalPods : currentPods;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [addLog]);

    // Node Resource Calculator Loop
    useEffect(() => {
        const interval = setInterval(() => {
             setNodes(currentNodes => currentNodes.map(n => {
                  if (n.status === 'not_ready') return { ...n, cpuUsed: 0, memUsed: 0 };
                  const nodePods = podsRef.current.filter(p => p.nodeId === n.id && (p.status === 'running' || p.status === 'creating'));
                  const targetCpu = Math.min(100, nodePods.length * 15 + Math.random() * 10);
                  const targetMem = Math.min(100, nodePods.length * 20 + Math.random() * 5);
                  return { 
                      ...n, 
                      cpuUsed: Math.max(5, Math.round(n.cpuUsed + (targetCpu - n.cpuUsed) * 0.5)), 
                      memUsed: Math.max(5, Math.round(n.memUsed + (targetMem - n.memUsed) * 0.5)) 
                  };
             }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Traffic Generator Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (!serviceActiveRef.current) return;
            const runningPods = podsRef.current.filter(p => p.status === 'running');
            if (runningPods.length > 0) {
                const targetPod = runningPods[Math.floor(Math.random() * runningPods.length)];
                const newFlow = {
                    id: Math.random().toString(),
                    podId: targetPod.id,
                    nodeId: targetPod.nodeId
                };
                setTrafficFlows(prev => [...prev, newFlow]);
                setTimeout(() => {
                    setTrafficFlows(prev => prev.filter(f => f.id !== newFlow.id));
                }, 1000);
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    // Handlers
    const toggleNodeStatus = (nodeId: string) => {
        setNodes(ns => ns.map(n => {
            if (n.id === nodeId) {
                const newStatus = n.status === 'ready' ? 'not_ready' : 'ready';
                addLog(`Node ${n.name} marked as ${newStatus}`, 'system');
                return { ...n, status: newStatus };
            }
            return n;
        }));
    };

    const killPod = (podId: string) => {
        setPods(ps => ps.map(p => {
            if (p.id === podId) {
                addLog(`Pod ${p.name.split('-')[1]} manually killed`, 'api');
                return { ...p, status: 'terminating' };
            }
            return p;
        }));
    };

    const simulateChaos = () => {
        const runningPods = podsRef.current.filter(p => p.status === 'running');
        if (runningPods.length > 0) {
            const target = runningPods[Math.floor(Math.random() * runningPods.length)];
            killPod(target.id);
            addLog(`Chaos Monkey destroyed ${target.name.split('-')[1]}`, 'system');
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-slate-200 overflow-hidden font-sans">
            {/* LEFT: Controls & Logs Panel */}
            <div className="w-96 border-r border-slate-800 bg-[#0a0a0f] z-20 flex flex-col shadow-2xl shrink-0">
                <div className="p-6 border-b border-slate-800 bg-[#0f0f15]">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight flex items-center gap-2">
                        <ServerIcon className="w-6 h-6 text-blue-400" />
                        K8S CLUSTER VIZ
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">Architecture Control Panel</p>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto space-y-8 flex flex-col">
                    {/* Controls */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4" /> Config
                        </h2>
                        
                        <div className="space-y-3 bg-[#11111a] p-4 rounded-xl border border-slate-800 shadow-inner">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-300 font-medium text-xs">Deployment Replicas</span>
                                <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{replicas}</span>
                            </div>
                            <input 
                                type="range" min="1" max="12" 
                                value={replicas} 
                                onChange={(e) => setReplicas(parseInt(e.target.value))}
                                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between bg-[#11111a] p-4 rounded-xl border border-slate-800 shadow-inner gap-4">
                            <span className="text-xs font-medium text-slate-300 flex-1">Expose Service (LoadBalancer)</span>
                            <button 
                                onClick={() => { setServiceActive(!serviceActive); addLog(`LoadBalancer Service ${serviceActive ? 'deleted' : 'created'}`, 'api'); }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${serviceActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20'}`}
                            >
                                {serviceActive ? 'DISABLE' : 'DEPLOY'}
                            </button>
                        </div>

                        <button 
                            onClick={simulateChaos}
                            className="w-full px-4 py-2.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <TrashIcon className="w-4 h-4" />
                            SIMULATE CHAOS (KILL POD)
                        </button>
                    </div>

                    {/* Logs */}
                    <div className="flex-1 flex flex-col min-h-[300px]">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <DatabaseIcon className="w-4 h-4" /> Event Stream
                        </h2>
                        <div className="flex-1 bg-[#0b0b10] rounded-xl border border-slate-800 p-3 overflow-y-auto space-y-1.5 font-mono text-[10px] shadow-inner">
                            <AnimatePresence initial={false}>
                                {logs.map(log => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10, height: 0 }} 
                                        animate={{ opacity: 1, x: 0, height: 'auto' }} 
                                        key={log.id} 
                                        className="flex gap-2 items-start"
                                    >
                                        <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                        <span className={`shrink-0 font-bold
                                            ${log.component === 'api' ? 'text-blue-400' : ''}
                                            ${log.component === 'scheduler' ? 'text-purple-400' : ''}
                                            ${log.component === 'controller' ? 'text-cyan-400' : ''}
                                            ${log.component === 'kubelet' ? 'text-emerald-400' : ''}
                                            ${log.component === 'system' ? 'text-rose-400' : ''}
                                        `}>[{log.component}]</span>
                                        <span className="text-slate-300 break-words">{log.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Visualizer Canvas */}
            <div className="flex-1 relative bg-[#050505] overflow-hidden p-8 flex flex-col justify-between">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                
                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Control Plane to Nodes */}
                    {nodes.map((n, i) => {
                        const nodeX = 20 + (i * 30);
                        return (
                            <path 
                                key={`cp-${n.id}`} 
                                d={`M 50 40 Q ${nodeX < 50 ? 35 : nodeX > 50 ? 65 : 50} 50 ${nodeX} 60`} 
                                fill="none" stroke="#3b82f6" strokeWidth="0.15" strokeOpacity="0.4" strokeDasharray="1 1" 
                            />
                        )
                    })}
                    
                    {/* LoadBalancer to Nodes (Traffic) */}
                    {serviceActive && nodes.map((n, i) => {
                        const nodeX = 20 + (i * 30);
                        const isReceivingTraffic = trafficFlows.some(f => f.nodeId === n.id);
                        return (
                            <motion.path 
                                key={`lb-${n.id}`}
                                d={`M 50 15 Q ${nodeX < 50 ? 20 : nodeX > 50 ? 80 : 50} 35 ${nodeX} 60`}
                                fill="none" 
                                stroke={isReceivingTraffic ? "#818cf8" : "#4338ca"} 
                                strokeWidth={isReceivingTraffic ? "0.4" : "0.1"} 
                                strokeDasharray="2 2"
                                animate={isReceivingTraffic ? { strokeDashoffset: [20, 0] } : {}}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                style={{ opacity: isReceivingTraffic ? 1 : 0.2 }}
                            />
                        )
                    })}
                </svg>

                {/* Top: Load Balancer */}
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-64 flex justify-center">
                    <AnimatePresence>
                        {serviceActive && (
                            <motion.div 
                                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                                className="bg-[#0f0f15]/90 backdrop-blur-xl border border-indigo-500/40 rounded-full px-6 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(99,102,241,0.2)] relative"
                            >
                                <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse pointer-events-none" />
                                <GlobeIcon className="w-6 h-6 text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Load Balancer</span>
                                    <span className="text-[9px] text-indigo-400 text-center font-mono">10.0.0.1:80</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Middle: Control Plane */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[550px]">
                    <div className="bg-[#0f0f15]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 border border-slate-600 rounded-full text-[9px] font-bold text-slate-300 tracking-widest uppercase shadow-lg">
                            Control Plane
                        </div>
                        
                        <div className="grid grid-cols-4 gap-6 mt-2">
                            {/* API Server */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center relative shadow-[0_0_20px_rgba(59,130,246,0.15)] group">
                                    <ServerIcon className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 tracking-wider">API Server</span>
                            </div>
                            
                            {/* etcd */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.1)] group">
                                    <DatabaseIcon className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 tracking-wider">etcd</span>
                            </div>

                            {/* Scheduler */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center relative shadow-[0_0_20px_rgba(168,85,247,0.1)] overflow-hidden">
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
                                        <SettingsIcon className="w-8 h-8 text-purple-400" />
                                    </motion.div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 tracking-wider">Scheduler</span>
                            </div>

                            {/* Controller */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                    <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
                                        <RefreshIcon className="w-7 h-7 text-cyan-400" />
                                    </motion.div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 tracking-wider">Controller</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Pods (Waiting for scheduler) */}
                <div className="absolute top-[52%] left-1/2 -translate-x-1/2 z-10 flex flex-wrap justify-center gap-2 w-64 pointer-events-none">
                    <AnimatePresence>
                        {pods.filter(p => p.status === 'pending' || (p.status === 'creating' && !p.nodeId)).map(pod => (
                            <motion.div 
                                key={pod.id}
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0 }}
                                className="w-7 h-7 bg-amber-500/10 border border-amber-500/40 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            >
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                    <RefreshIcon className="w-4 h-4 text-amber-400" />
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom: Worker Nodes */}
                {nodes.map((node, i) => (
                    <div key={node.id} className="absolute top-[60%] -translate-x-1/2 z-10 w-64" style={{ left: `${20 + i * 30}%` }}>
                        <div className={`rounded-2xl border bg-[#0f0f15]/90 backdrop-blur-xl flex flex-col shadow-2xl transition-all duration-700
                            ${node.status === 'ready' ? 'border-slate-700/80 hover:border-slate-500' : 'border-rose-900/50 grayscale opacity-80 shadow-none'}
                        `}>
                            {/* Node Header */}
                            <div className="p-3 border-b border-slate-800 bg-slate-900/40 rounded-t-2xl flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <HardDriveIcon className={`w-5 h-5 ${node.status === 'ready' ? 'text-emerald-400' : 'text-rose-400'}`} />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">{node.name}</div>
                                        <div className={`text-[9px] uppercase tracking-widest font-bold ${node.status === 'ready' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {node.status === 'ready' ? 'Ready' : 'NotReady'}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleNodeStatus(node.id)} 
                                    className={`p-1.5 rounded-lg transition-colors border ${node.status === 'ready' ? 'text-rose-400 border-rose-500/20 hover:bg-rose-500/10' : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'}`} 
                                    title={node.status === 'ready' ? 'Simulate Node Failure' : 'Recover Node'}
                                >
                                    <RealPowerIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Node Agents */}
                            <div className="px-3 py-2.5 border-b border-slate-800 flex gap-3 bg-black/20">
                                <div className="flex-1 bg-[#151520] border border-slate-700/50 rounded-lg text-[9px] font-mono text-center py-1.5 text-emerald-400/80 tracking-wide">kubelet</div>
                                <div className="flex-1 bg-[#151520] border border-slate-700/50 rounded-lg text-[9px] font-mono text-center py-1.5 text-blue-400/80 tracking-wide">kube-proxy</div>
                            </div>

                            {/* Node Resources */}
                            <div className="px-4 py-3 border-b border-slate-800 space-y-2 bg-black/10">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-slate-500 w-6 tracking-widest">CPU</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-emerald-500 transition-all duration-500 relative" style={{ width: `${node.cpuUsed}%` }}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-slate-500 w-6 tracking-widest">MEM</span>
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-indigo-500 transition-all duration-500 relative" style={{ width: `${node.memUsed}%` }}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pods Grid */}
                            <div className="p-3 min-h-[110px]">
                                <div className="grid grid-cols-2 gap-2">
                                    <AnimatePresence>
                                        {pods.filter(p => p.nodeId === node.id).map(pod => (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                key={pod.id}
                                                className={`p-2.5 rounded-xl border text-center relative overflow-hidden group cursor-pointer transition-colors
                                                    ${pod.status === 'running' ? 'bg-indigo-500/10 border-indigo-500/40 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : ''}
                                                    ${pod.status === 'creating' ? 'bg-amber-500/10 border-amber-500/40' : ''}
                                                    ${pod.status === 'terminating' ? 'bg-rose-500/10 border-rose-500/40' : ''}
                                                `}
                                                onClick={() => killPod(pod.id)}
                                            >
                                                {/* Status indicator */}
                                                <div className="absolute top-1.5 right-1.5">
                                                    {pod.status === 'running' && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />}
                                                    {pod.status === 'creating' && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />}
                                                    {pod.status === 'terminating' && <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />}
                                                </div>
                                                
                                                <BoxIcon className={`w-6 h-6 mx-auto mb-1 ${pod.status === 'running' ? 'text-indigo-300' : 'text-slate-400'}`} />
                                                <div className="text-[10px] font-mono text-slate-300 font-bold tracking-wide">{pod.name.split('-')[1]}</div>
                                                
                                                {/* Traffic Highlight Overlay */}
                                                {trafficFlows.some(f => f.podId === pod.id) && (
                                                    <motion.div 
                                                        layoutId={`highlight-${pod.id}`}
                                                        className="absolute inset-0 border-2 border-indigo-400 rounded-xl bg-indigo-400/20"
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    />
                                                )}
                                                
                                                {/* Hover Kill Overlay */}
                                                <div className="absolute inset-0 bg-rose-500/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                                    <XIcon className="w-6 h-6 text-white" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

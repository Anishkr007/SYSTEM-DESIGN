"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type PipelineStatus = "idle" | "running" | "failed" | "waiting_approval" | "success";
type StageStatus = "pending" | "running" | "success" | "failed";

interface Stage {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: number; // simulated duration in ms
  requiresApproval?: boolean;
}

// --- Icons ---
const GitCommitIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>
);
const BuildIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);
const TestIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H15M10 9H14M3 19C3 19 4 19 5 17C6 15 9 10 9 10V3M21 19C21 19 20 19 19 17C18 15 15 10 15 10V3"/></svg>
);
const DockerIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="11" width="20" height="10" rx="2" ry="2"/><path d="M6 16h.01M10 16h.01M14 16h.01M18 16h.01M8 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/></svg>
);
const ServerIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
);
const RocketIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

// --- Configuration ---
const STAGES: Stage[] = [
  { id: "commit", name: "Commit", icon: <GitCommitIcon className="w-7 h-7" />, duration: 1500 },
  { id: "build", name: "Build", icon: <BuildIcon className="w-7 h-7" />, duration: 2500 },
  { id: "tests", name: "Test", icon: <TestIcon className="w-7 h-7" />, duration: 3000 },
  { id: "docker", name: "Docker", icon: <DockerIcon className="w-7 h-7" />, duration: 2000 },
  { id: "staging", name: "Staging", icon: <ServerIcon className="w-7 h-7" />, duration: 2500 },
  { id: "prod", name: "Prod", icon: <RocketIcon className="w-7 h-7" />, duration: 3000, requiresApproval: true },
];

const getLeftPos = (index: number) => 10 + index * (80 / (STAGES.length - 1));

const MetricBox = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col bg-gray-950/50 backdrop-blur-sm border border-gray-800 rounded-xl px-4 py-2 min-w-[110px] shadow-inner">
    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">{label}</span>
    <span className="text-xl font-mono font-bold text-gray-100">{value}</span>
  </div>
);

// --- Component ---
export default function CiCdViz() {
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>(Array(STAGES.length).fill("pending"));
  const [failureTargetIndex, setFailureTargetIndex] = useState<number | null>(null);
  
  const [metrics, setMetrics] = useState({ builds: 0, successes: 0, totalTime: 0 });
  const [currentBuildTime, setCurrentBuildTime] = useState<number>(0);
  const [logs, setLogs] = useState<{ id: number; text: string; type: "info" | "error" | "success" | "warning" }[]>([]);

  const startTimeRef = useRef<number>(0);
  const hasApprovedRef = useRef<boolean>(false);

  const addLog = useCallback((text: string, type: "info" | "error" | "success" | "warning") => {
    setLogs(prev => {
      const next = [...prev, { id: Date.now() + Math.random(), text, type }];
      return next.slice(-40); // Keep last 40 logs
    });
  }, []);

  const handleTrigger = () => {
    setStatus("running");
    setActiveStageIndex(0);
    setStageStatuses(Array(STAGES.length).fill("pending"));
    setCurrentBuildTime(0);
    startTimeRef.current = Date.now();
    hasApprovedRef.current = false;
    setLogs([]);
    addLog("Pipeline triggered manually. Initiating sequence...", "info");
  };

  const handleApprove = () => {
    if (status === "waiting_approval") {
      // Adjust start time to resume seamlessly
      startTimeRef.current = Date.now() - currentBuildTime;
      hasApprovedRef.current = true;
      setStatus("running");
      addLog(`Manual approval granted. Resuming deployment...`, "success");
    }
  };

  // High-performance timer for build time
  useEffect(() => {
    let reqId: number;
    const tick = () => {
      if (status === "running") {
        setCurrentBuildTime(Date.now() - startTimeRef.current);
        reqId = requestAnimationFrame(tick);
      }
    };
    if (status === "running") {
      reqId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(reqId);
  }, [status]);

  // Main Pipeline State Machine
  useEffect(() => {
    if (status !== "running") return;
    const currentStage = STAGES[activeStageIndex];
    if (!currentStage) return;

    // Check manual approval gate
    if (currentStage.requiresApproval && !hasApprovedRef.current && stageStatuses[activeStageIndex] === "pending") {
      setStatus("waiting_approval");
      addLog(`Pipeline paused. Waiting for manual approval for [${currentStage.name}].`, "warning");
      return;
    }

    // Enter "running" state
    if (stageStatuses[activeStageIndex] === "pending") {
      setStageStatuses(prev => {
        const next = [...prev];
        next[activeStageIndex] = "running";
        return next;
      });
      addLog(`Starting stage: [${currentStage.name}]...`, "info");
      return; // Return and wait for re-render with "running" state
    }

    // Execute the stage duration
    if (stageStatuses[activeStageIndex] === "running") {
      const timerId = setTimeout(() => {
        if (failureTargetIndex === activeStageIndex) {
          // Trigger Failure
          setStageStatuses(prev => {
            const next = [...prev];
            next[activeStageIndex] = "failed";
            return next;
          });
          setStatus("failed");
          setMetrics(prev => ({ ...prev, builds: prev.builds + 1 }));
          addLog(`CRITICAL FAILURE in stage: [${currentStage.name}]. Pipeline halted.`, "error");
        } else {
          // Success
          setStageStatuses(prev => {
            const next = [...prev];
            next[activeStageIndex] = "success";
            return next;
          });
          addLog(`Stage completed successfully: [${currentStage.name}].`, "success");
          
          if (activeStageIndex === STAGES.length - 1) {
            // Reached end of pipeline
            setStatus("success");
            setMetrics(prev => ({
               ...prev,
               builds: prev.builds + 1,
               successes: prev.successes + 1,
               totalTime: prev.totalTime + (Date.now() - startTimeRef.current)
            }));
            addLog("Pipeline completed all stages successfully!", "success");
          } else {
            // Next stage
            setActiveStageIndex(prev => prev + 1);
          }
        }
      }, currentStage.duration);
      
      return () => clearTimeout(timerId);
    }
  }, [status, activeStageIndex, stageStatuses, failureTargetIndex, addLog]);

  const successRateText = metrics.builds === 0 
    ? "100%" 
    : `${Math.round((metrics.successes / metrics.builds) * 100)}%`;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-cyan-500/30">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.8); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 1); }
        @keyframes dash-flow { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        .animate-flow { stroke-dasharray: 12 12; animation: dash-flow 0.8s linear infinite; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes scan { from { transform: translateY(-50%); } to { transform: translateY(0%); } }
      `}</style>

      {/* --- Top Dashboard Bar --- */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center border border-gray-800 bg-gray-900/40 backdrop-blur-xl p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
        
        <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleTrigger} 
            disabled={status === "running" || status === "waiting_approval"}
            className="flex-1 md:flex-none relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
          >
            <PlayIcon className="w-4 h-4" />
            Trigger Pipeline
            {!["running", "waiting_approval"].includes(status) && (
               <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
          </button>

          <div className="flex flex-col gap-1">
             <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Inject Failure</label>
             <select 
                value={failureTargetIndex === null ? "" : failureTargetIndex}
                onChange={(e) => setFailureTargetIndex(e.target.value === "" ? null : parseInt(e.target.value))}
                className="bg-gray-950/80 text-gray-300 rounded-lg px-3 py-1.5 text-sm border border-gray-800 outline-none focus:border-cyan-500 transition-colors"
                disabled={status === "running" || status === "waiting_approval"}
             >
                <option value="">None (Success)</option>
                {STAGES.map((s, i) => (
                  <option key={s.id} value={i}>Fail at {s.name}</option>
                ))}
             </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "waiting_approval" && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative z-10 flex-1 flex justify-center"
             >
                <button 
                  onClick={handleApprove} 
                  className="px-6 py-3 rounded-xl font-bold text-sm text-yellow-950 bg-yellow-400 hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.6)] transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <CheckIcon className="w-5 h-5" />
                  Approve Production Deploy
                </button>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex gap-4 w-full md:w-auto justify-between md:justify-end">
          <MetricBox label="Build Time" value={`${(currentBuildTime / 1000).toFixed(1)}s`} />
          <MetricBox label="Success Rate" value={successRateText} />
          <MetricBox label="Deploys" value={metrics.successes.toString()} />
        </div>
      </div>

      {/* --- Pipeline Visualization Canvas --- */}
      <div className="w-full overflow-x-auto custom-scrollbar rounded-2xl">
        <div className="relative min-w-[900px] h-72 border border-gray-800/80 rounded-2xl bg-gray-900/30 overflow-hidden backdrop-blur-md flex items-center shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] animate-[scan_8s_linear_infinite] pointer-events-none z-0" />
          
          {/* Base Track */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1="10%" y1="45%" x2="90%" y2="45%" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
            
            {/* Active / Completed Track */}
            <motion.line 
              x1="10%" y1="45%" 
              animate={{ x2: activeStageIndex === -1 ? "10%" : `${getLeftPos(activeStageIndex)}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              stroke={status === "failed" ? "#ef4444" : status === "success" ? "#22c55e" : "#06b6d4"} 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            
            {/* Flowing Data Animation overlay */}
            {(status === "running" || status === "waiting_approval") && activeStageIndex >= 0 && (
              <motion.line 
                x1="10%" y1="45%" 
                animate={{ x2: `${getLeftPos(activeStageIndex)}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                stroke="rgba(255,255,255,0.4)" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="animate-flow"
              />
            )}
          </svg>

          {/* Animated Payload Artifact */}
          {(status === "running" || status === "waiting_approval") && activeStageIndex >= 0 && (
             <motion.div
                className="absolute top-[45%] -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-gray-950 border border-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_#22d3ee] z-20"
                initial={{ left: "10%" }}
                animate={{ left: `${getLeftPos(activeStageIndex)}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 14 }}
             >
                <PackageIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
             </motion.div>
          )}

          {/* Pipeline Nodes */}
          {STAGES.map((stage, i) => {
             const isRunning = stageStatuses[i] === "running";
             const isSuccess = stageStatuses[i] === "success";
             const isFailed = stageStatuses[i] === "failed";
             const isWaiting = status === "waiting_approval" && activeStageIndex === i;

             let ringColor = "border-gray-800";
             let glowColor = "";
             let iconColor = "text-gray-600";
             let bgColor = "bg-[#0a0a0a]";

             if (isRunning) { 
               ringColor = "border-cyan-400"; 
               glowColor = "shadow-[0_0_25px_rgba(34,211,238,0.4)]"; 
               iconColor = "text-cyan-400";
             } else if (isSuccess) { 
               ringColor = "border-green-500"; 
               glowColor = "shadow-[0_0_20px_rgba(34,197,94,0.2)]"; 
               iconColor = "text-green-500";
               bgColor = "bg-green-950/20";
             } else if (isFailed) { 
               ringColor = "border-red-500"; 
               glowColor = "shadow-[0_0_25px_rgba(239,68,68,0.5)]"; 
               iconColor = "text-red-500";
               bgColor = "bg-red-950/30";
             } else if (isWaiting) { 
               ringColor = "border-yellow-400"; 
               glowColor = "shadow-[0_0_25px_rgba(250,204,21,0.5)]"; 
               iconColor = "text-yellow-400";
               bgColor = "bg-yellow-950/20";
             }

             return (
               <div 
                 key={stage.id} 
                 className="absolute top-[45%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10 w-28"
                 style={{ left: `${getLeftPos(i)}%` }}
               >
                  <motion.div 
                    className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center border-2 ${bgColor} ${ringColor} ${glowColor} transition-colors duration-500 relative`}
                    animate={{ 
                       scale: isRunning || isWaiting ? 1.05 : 1,
                       y: isRunning || isWaiting ? [0, -5, 0] : 0 
                    }}
                    transition={{ repeat: isRunning || isWaiting ? Infinity : 0, duration: 2, ease: "easeInOut" }}
                  >
                     <div className={`${iconColor} transition-colors duration-500`}>{stage.icon}</div>
                     
                     {isSuccess && (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-2 border-gray-900">
                         <CheckIcon className="w-3 h-3" />
                       </motion.div>
                     )}
                     {isFailed && (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-gray-900">
                         <XIcon className="w-3 h-3" />
                       </motion.div>
                     )}
                  </motion.div>

                  <div className="mt-5 text-sm font-semibold text-gray-300 tracking-wide text-center">
                    {stage.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-500 font-mono text-center opacity-80">
                    {(stage.duration / 1000).toFixed(1)}s
                  </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* --- Logs / Terminal --- */}
      <div className="border border-gray-800/80 rounded-2xl bg-[#0a0a0a] overflow-hidden flex flex-col h-72 shadow-xl">
         <div className="bg-[#111111] border-b border-gray-800/80 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/60" />
               <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/60" />
               <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/60" />
            </div>
            <span className="text-xs text-gray-500 font-mono">pipeline-execution.log</span>
            {status === "running" && (
               <div className="ml-auto flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Live</span>
               </div>
            )}
         </div>
         <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] custom-scrollbar flex flex-col-reverse gap-1.5">
            {logs.slice().reverse().map(log => (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={log.id} 
                 className="flex gap-4 leading-relaxed"
               >
                  <span className="text-gray-600 shrink-0 select-none">
                     [{new Date(log.id).toISOString().substring(11, 23)}]
                  </span>
                  <span className={
                     log.type === "info" ? "text-cyan-300" :
                     log.type === "error" ? "text-red-400" :
                     log.type === "success" ? "text-green-400" :
                     "text-yellow-400"
                  }>
                     {log.text}
                  </span>
               </motion.div>
            ))}
            {logs.length === 0 && (
               <div className="text-gray-600 italic">Waiting for pipeline trigger...</div>
            )}
         </div>
      </div>

    </div>
  );
}

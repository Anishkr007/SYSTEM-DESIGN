"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ServiceName = "orders" | "inventory" | "payments";

interface Step {
  id: string;
  source: string;
  target: string;
  type: "prepare" | "commit" | "rollback" | "execute" | "compensate" | "success" | "fail";
  label: string;
  progress: number;
}

export default function DistributedTxViz() {
  const [pattern, setPattern] = useState<"2pc" | "saga">("saga");
  const [failAt, setFailAt] = useState<ServiceName | "none">("none");
  const [isRunning, setIsRunning] = useState(false);
  const [activeSteps, setActiveSteps] = useState<Step[]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string, isError: boolean}[]>([]);
  
  const [serviceState, setServiceState] = useState<Record<string, "idle" | "preparing" | "locked" | "committed" | "rolled_back" | "failed" | "compensated">>({
    coordinator: "idle",
    orders: "idle",
    inventory: "idle",
    payments: "idle"
  });

  const nextStepId = useRef(0);

  const addLog = (msg: string, isError: boolean = false) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits: 2 });
    setLogs(prev => [{time, msg, isError}, ...prev].slice(0, 10));
  };

  const reset = () => {
    setIsRunning(false);
    setActiveSteps([]);
    setServiceState({ coordinator: "idle", orders: "idle", inventory: "idle", payments: "idle" });
    setLogs([]);
  };

  const runSimulation = () => {
    if (isRunning) return;
    reset();
    setIsRunning(true);
    addLog(`Starting ${pattern.toUpperCase()} transaction...`);
    
    if (pattern === "2pc") {
      run2PC();
    } else {
      runSaga();
    }
  };

  // --- 2PC LOGIC ---
  const run2PC = () => {
    setServiceState(prev => ({ ...prev, coordinator: "preparing" }));
    
    // Phase 1: Prepare
    addLog("Phase 1: Sending PREPARE to all services...");
    const prepareSteps: Step[] = [
      { id: `step-${nextStepId.current++}`, source: "coordinator", target: "orders", type: "prepare", label: "Prepare?", progress: 0 },
      { id: `step-${nextStepId.current++}`, source: "coordinator", target: "inventory", type: "prepare", label: "Prepare?", progress: 0 },
      { id: `step-${nextStepId.current++}`, source: "coordinator", target: "payments", type: "prepare", label: "Prepare?", progress: 0 },
    ];
    
    setActiveSteps(prepareSteps);
    
    // Animate Prepare
    const iv1 = setInterval(() => {
      setActiveSteps(prev => {
        let newProgress = prev[0]?.progress + 0.05;
        if (newProgress >= 1) {
          clearInterval(iv1);
          handlePrepareResults();
          return [];
        }
        return prev.map(s => ({ ...s, progress: newProgress }));
      });
    }, 50);
  };

  const handlePrepareResults = () => {
    const willFail = failAt !== "none";
    
    setServiceState(prev => ({
      ...prev,
      orders: failAt === "orders" ? "failed" : "locked",
      inventory: failAt === "inventory" ? "failed" : "locked",
      payments: failAt === "payments" ? "failed" : "locked",
    }));

    const responseSteps: Step[] = [
      { id: `step-${nextStepId.current++}`, source: "orders", target: "coordinator", type: failAt === "orders" ? "fail" : "success", label: failAt === "orders" ? "NO" : "YES", progress: 0 },
      { id: `step-${nextStepId.current++}`, source: "inventory", target: "coordinator", type: failAt === "inventory" ? "fail" : "success", label: failAt === "inventory" ? "NO" : "YES", progress: 0 },
      { id: `step-${nextStepId.current++}`, source: "payments", target: "coordinator", type: failAt === "payments" ? "fail" : "success", label: failAt === "payments" ? "NO" : "YES", progress: 0 },
    ];
    
    setActiveSteps(responseSteps);
    
    const iv2 = setInterval(() => {
      setActiveSteps(prev => {
        let newProgress = prev[0]?.progress + 0.05;
        if (newProgress >= 1) {
          clearInterval(iv2);
          if (willFail) {
            addLog(`Node ${failAt} voted NO. Aborting.`, true);
            run2PCPhase2("rollback");
          } else {
            addLog("All nodes voted YES. Committing.");
            run2PCPhase2("commit");
          }
          return [];
        }
        return prev.map(s => ({ ...s, progress: newProgress }));
      });
    }, 50);
  };

  const run2PCPhase2 = (action: "commit" | "rollback") => {
    setServiceState(prev => ({ ...prev, coordinator: action === "commit" ? "committed" : "rolled_back" }));
    addLog(`Phase 2: Sending ${action.toUpperCase()} to all services...`, action === "rollback");
    
    const actionSteps: Step[] = [
      { id: `step-${nextStepId.current++}`, source: "coordinator", target: "orders", type: action, label: action.toUpperCase(), progress: 0 },
      { id: `step-${nextStepId.current++}`, source: "coordinator", target: "inventory", type: action, label: action.toUpperCase(), progress: 0 },
      { id: `step-${nextStepId.current++}`, source: "coordinator", target: "payments", type: action, label: action.toUpperCase(), progress: 0 },
    ];
    
    setActiveSteps(actionSteps);
    
    const iv3 = setInterval(() => {
      setActiveSteps(prev => {
        let newProgress = prev[0]?.progress + 0.05;
        if (newProgress >= 1) {
          clearInterval(iv3);
          setServiceState(prev => ({
            ...prev,
            orders: action === "commit" ? "committed" : "rolled_back",
            inventory: action === "commit" ? "committed" : "rolled_back",
            payments: action === "commit" ? "committed" : "rolled_back",
          }));
          addLog(`Transaction ${action === "commit" ? "Completed Successfully" : "Aborted & Rolled Back"}`, action === "rollback");
          setTimeout(() => setIsRunning(false), 1000);
          return [];
        }
        return prev.map(s => ({ ...s, progress: newProgress }));
      });
    }, 50);
  };

  // --- SAGA LOGIC ---
  const runSaga = () => {
    setServiceState(prev => ({ ...prev, coordinator: "preparing" }));
    addLog("Executing Step 1: Create Order");
    
    const step1: Step = { id: `step-${nextStepId.current++}`, source: "coordinator", target: "orders", type: "execute", label: "Create Order", progress: 0 };
    setActiveSteps([step1]);
    
    const iv = setInterval(() => {
      setActiveSteps(prev => {
        if (prev[0]?.progress >= 1) {
          clearInterval(iv);
          if (failAt === "orders") {
            setServiceState(s => ({ ...s, orders: "failed" }));
            addLog("Create Order FAILED.", true);
            sagaCompensate([]); // Nothing to compensate
            return [];
          }
          setServiceState(s => ({ ...s, orders: "committed" }));
          addLog("Order Created. Moving to Step 2.");
          sagaStep2();
          return [];
        }
        return [{...prev[0], progress: prev[0].progress + 0.05}];
      });
    }, 50);
  };

  const sagaStep2 = () => {
    addLog("Executing Step 2: Reserve Inventory");
    const step2: Step = { id: `step-${nextStepId.current++}`, source: "orders", target: "inventory", type: "execute", label: "Reserve Inventory", progress: 0 };
    setActiveSteps([step2]);
    
    const iv = setInterval(() => {
      setActiveSteps(prev => {
        if (prev[0]?.progress >= 1) {
          clearInterval(iv);
          if (failAt === "inventory") {
            setServiceState(s => ({ ...s, inventory: "failed" }));
            addLog("Reserve Inventory FAILED.", true);
            sagaCompensate(["orders"]);
            return [];
          }
          setServiceState(s => ({ ...s, inventory: "committed" }));
          addLog("Inventory Reserved. Moving to Step 3.");
          sagaStep3();
          return [];
        }
        return [{...prev[0], progress: prev[0].progress + 0.05}];
      });
    }, 50);
  };

  const sagaStep3 = () => {
    addLog("Executing Step 3: Process Payment");
    const step3: Step = { id: `step-${nextStepId.current++}`, source: "inventory", target: "payments", type: "execute", label: "Charge Card", progress: 0 };
    setActiveSteps([step3]);
    
    const iv = setInterval(() => {
      setActiveSteps(prev => {
        if (prev[0]?.progress >= 1) {
          clearInterval(iv);
          if (failAt === "payments") {
            setServiceState(s => ({ ...s, payments: "failed" }));
            addLog("Process Payment FAILED.", true);
            sagaCompensate(["inventory", "orders"]);
            return [];
          }
          setServiceState(s => ({ ...s, payments: "committed", coordinator: "committed" }));
          addLog("Payment Processed. SAGA Complete.");
          setTimeout(() => setIsRunning(false), 1000);
          return [];
        }
        return [{...prev[0], progress: prev[0].progress + 0.05}];
      });
    }, 50);
  };

  const sagaCompensate = (targets: ServiceName[]) => {
    if (targets.length === 0) {
      addLog("SAGA Aborted. No compensations needed.", true);
      setServiceState(s => ({ ...s, coordinator: "rolled_back" }));
      setTimeout(() => setIsRunning(false), 1000);
      return;
    }
    
    const target = targets[0]; // Process one by one in reverse
    const sourceMap: Record<string, string> = { "inventory": "payments", "orders": "inventory" };
    let source = sourceMap[target] || "coordinator";
    if (source === "payments" && failAt === "payments") source = "payments"; // Failed node starts compensation
    
    addLog(`Compensating: Undoing ${target}...`, true);
    
    const compStep: Step = { id: `step-${nextStepId.current++}`, source, target, type: "compensate", label: `Undo ${target}`, progress: 0 };
    setActiveSteps([compStep]);
    
    const iv = setInterval(() => {
      setActiveSteps(prev => {
        if (prev[0]?.progress >= 1) {
          clearInterval(iv);
          setServiceState(s => ({ ...s, [target]: "compensated" }));
          sagaCompensate(targets.slice(1));
          return [];
        }
        return [{...prev[0], progress: prev[0].progress + 0.05}];
      });
    }, 50);
  };

  // Node Positions
  const coords: Record<string, {x: number, y: number}> = {
    coordinator: { x: 50, y: 15 },
    orders: { x: 20, y: 65 },
    inventory: { x: 50, y: 65 },
    payments: { x: 80, y: 65 }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "idle": return "bg-zinc-800 border-zinc-600";
      case "preparing": return "bg-purple-500/20 border-purple-500";
      case "locked": return "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]";
      case "committed": return "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
      case "rolled_back": return "bg-zinc-500/20 border-zinc-400";
      case "failed": return "bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
      case "compensated": return "bg-orange-500/20 border-orange-500";
      default: return "bg-zinc-800 border-zinc-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase mb-3">Pattern</h3>
          <div className="flex bg-black/40 rounded-lg p-1">
            <button 
              onClick={() => {if(!isRunning) {setPattern("saga"); reset();}}}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${pattern === "saga" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"}`}
              disabled={isRunning}
            >
              SAGA (Choreography)
            </button>
            <button 
              onClick={() => {if(!isRunning) {setPattern("2pc"); reset();}}}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${pattern === "2pc" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"}`}
              disabled={isRunning}
            >
              2-Phase Commit (2PC)
            </button>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase mb-3">Simulate Failure</h3>
          <div className="flex gap-2">
            {(["none", "orders", "inventory", "payments"] as const).map(f => (
              <button 
                key={f}
                onClick={() => {if(!isRunning) setFailAt(f)}}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${failAt === f ? "bg-red-500/20 border-red-500 text-red-300" : "bg-transparent border-white/10 text-zinc-400 hover:bg-white/5"}`}
                disabled={isRunning}
              >
                {f === "none" ? "No Failure" : `@ ${f}`}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${isRunning ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
          >
            {isRunning ? "Running..." : "Run Transaction"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizer Area */}
        <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-white/10 p-4 relative min-h-[400px]">
          
          {/* Edges mapping for SAGA sequential path */}
          {pattern === "saga" && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <path d={`M ${coords.coordinator.x}% ${coords.coordinator.y}% L ${coords.orders.x}% ${coords.orders.y}%`} stroke="#fff" strokeWidth="2" strokeDasharray="5 5" />
              <path d={`M ${coords.orders.x}% ${coords.orders.y}% L ${coords.inventory.x}% ${coords.inventory.y}%`} stroke="#fff" strokeWidth="2" strokeDasharray="5 5" />
              <path d={`M ${coords.inventory.x}% ${coords.inventory.y}% L ${coords.payments.x}% ${coords.payments.y}%`} stroke="#fff" strokeWidth="2" strokeDasharray="5 5" />
            </svg>
          )}

          {/* Nodes */}
          {Object.entries(coords).map(([id, pos]) => {
            const status = serviceState[id as keyof typeof serviceState];
            return (
              <div 
                key={id}
                className={`absolute w-24 h-24 -ml-12 -mt-12 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 z-10 ${getStatusColor(status)}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <span className="text-3xl mb-1">
                  {id === "coordinator" ? "👨‍✈️" : id === "orders" ? "🛒" : id === "inventory" ? "📦" : "💳"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">{id}</span>
                {status !== "idle" && (
                  <span className="absolute -bottom-6 text-[9px] bg-black/80 px-2 py-0.5 rounded border border-white/10 uppercase">
                    {status.replace("_", " ")}
                  </span>
                )}
              </div>
            );
          })}

          {/* Animated Steps */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            {activeSteps.map(step => {
              const start = coords[step.source];
              const target = coords[step.target];
              const currentX = start.x + (target.x - start.x) * step.progress;
              const currentY = start.y + (target.y - start.y) * step.progress;
              
              let color = "#3b82f6"; // default blue
              if (step.type === "commit" || step.type === "success") color = "#10b981"; // green
              if (step.type === "rollback" || step.type === "fail" || step.type === "compensate") color = "#ef4444"; // red
              if (step.type === "prepare") color = "#a855f7"; // purple
              if (step.type === "execute") color = "#f59e0b"; // amber

              return (
                <g key={step.id}>
                  {/* Packet */}
                  <circle cx={`${currentX}%`} cy={`${currentY}%`} r="6" fill={color} filter="url(#glow)" />
                  {/* Label */}
                  <text 
                    x={`${currentX}%`} y={`calc(${currentY}% - 15px)`} 
                    fill={color} fontSize="12" fontWeight="bold" textAnchor="middle"
                    className="drop-shadow-md"
                  >
                    {step.label}
                  </text>
                </g>
              );
            })}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Transaction Log */}
        <div className="bg-black/40 rounded-2xl border border-white/10 p-4 flex flex-col h-[400px]">
          <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Transaction Log</h3>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs flex flex-col-reverse">
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className={`p-2 rounded flex gap-2 ${log.isError ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-zinc-300'}`}
              >
                <span className="opacity-50 shrink-0">{log.time}</span>
                <span>{log.msg}</span>
              </motion.div>
            ))}
            {logs.length === 0 && (
              <div className="text-zinc-500 text-center mt-10 italic">Ready to run...</div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
        <h4 className="text-indigo-300 font-bold mb-2">
          {pattern === "saga" ? "SAGA Pattern (Eventual Consistency)" : "Two-Phase Commit (Strong Consistency)"}
        </h4>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {pattern === "saga" 
            ? "In a SAGA, each service completes its local transaction and triggers the next step. If a step fails, the system executes 'compensating transactions' backwards to undo the previous steps. This provides eventual consistency and high availability without locking."
            : "In 2PC, a coordinator asks all nodes to 'Prepare' (lock their rows). If all agree, it sends a 'Commit'. If any node votes 'No' or fails, it sends a 'Rollback'. This guarantees strong consistency but blocks resources during the transaction."
          }
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Request {
  id: number;
  type: "auth" | "api1" | "api2" | "billing";
  status: "pending" | "validating" | "routing" | "success" | "blocked" | "failed";
  x: number;
  y: number;
}

function Node({ label, icon, isActive, isFailed, color }: { label: string; icon: string; isActive: boolean; isFailed?: boolean; color: string }) {
  return (
    <div className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
      isFailed ? "bg-red-500/10 border-red-500/50" : 
      isActive ? `bg-${color}-500/20 border-${color}-500/50 shadow-[0_0_15px_rgba(var(--${color}-rgb),0.3)]` : 
      "bg-black/40 border-white/10"
    }`}>
      <span className="text-3xl mb-2">{isFailed ? "🔥" : icon}</span>
      <span className="text-xs font-medium text-zinc-300">{label}</span>
      
      {/* Activity pulse */}
      {isActive && !isFailed && (
        <motion.div
          className={`absolute inset-0 rounded-xl border-2 border-${color}-400`}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

export default function ApiGatewayViz() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [rateLimit, setRateLimit] = useState(10);
  const [authEnabled, setAuthEnabled] = useState(true);
  const [serviceStatus, setServiceStatus] = useState({
    auth: true,
    users: true,
    orders: true,
    billing: true
  });
  
  const [metrics, setMetrics] = useState({
    total: 0,
    success: 0,
    blocked: 0,
    failed: 0
  });

  const nextId = useRef(0);
  const activeNodes = useRef(new Set<string>());
  const [, forceRender] = useState(0);

  // Generate requests
  useEffect(() => {
    const iv = setInterval(() => {
      // Create 1-3 requests at a time
      const count = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < count; i++) {
        const types: Request["type"][] = ["api1", "api1", "api2", "billing"];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const req: Request = {
          id: nextId.current++,
          type,
          status: "pending",
          x: -20,
          y: 150 + (Math.random() * 40 - 20)
        };
        
        setRequests(prev => [...prev, req]);
        setMetrics(m => ({ ...m, total: m.total + 1 }));
      }
    }, 800); // Base rate
    
    return () => clearInterval(iv);
  }, []);

  // Process requests
  useEffect(() => {
    const iv = setInterval(() => {
      setRequests(prev => {
        let currentRate = 0;
        const now = Date.now();
        
        return prev.map(req => {
          if (req.status === "success" || req.status === "blocked" || req.status === "failed") {
            return { ...req, x: req.x + 10 }; // Move off screen
          }
          
          let newStatus: Request["status"] = req.status;
          let newX = req.x;
          let newY = req.y;
          
          // Phase 1: Arriving at Gateway
          if (req.status === "pending") {
            if (req.x < 120) {
              newX += 8;
            } else {
              currentRate++;
              // Rate limiting check
              if (currentRate > rateLimit / 5) {
                newStatus = "blocked";
                setMetrics(m => ({ ...m, blocked: m.blocked + 1 }));
              } else if (authEnabled) {
                newStatus = "validating";
              } else {
                newStatus = "routing";
              }
            }
          }
          
          // Phase 2: Auth Validation
          if (req.status === "validating") {
            activeNodes.current.add("auth");
            if (!serviceStatus.auth) {
              newStatus = "failed";
              setMetrics(m => ({ ...m, failed: m.failed + 1 }));
            } else if (Math.random() > 0.95) { // 5% auth failure
              newStatus = "blocked";
              setMetrics(m => ({ ...m, blocked: m.blocked + 1 }));
            } else {
              newStatus = "routing";
            }
            setTimeout(() => { activeNodes.current.delete("auth"); forceRender(r=>r+1); }, 200);
          }
          
          // Phase 3: Routing
          if (req.status === "routing") {
            activeNodes.current.add("gateway");
            newX += 8;
            
            // Move vertically toward target
            const targetY = req.type === "api1" ? 50 : req.type === "api2" ? 150 : 250;
            newY += (targetY - req.y) * 0.2;
            
            if (newX > 300) {
              const targetService = req.type === "api1" ? "users" : req.type === "api2" ? "orders" : "billing";
              
              if (!serviceStatus[targetService as keyof typeof serviceStatus]) {
                newStatus = "failed";
                setMetrics(m => ({ ...m, failed: m.failed + 1 }));
              } else {
                newStatus = "success";
                setMetrics(m => ({ ...m, success: m.success + 1 }));
                activeNodes.current.add(targetService);
                setTimeout(() => { activeNodes.current.delete(targetService); forceRender(r=>r+1); }, 300);
              }
            }
            setTimeout(() => { activeNodes.current.delete("gateway"); forceRender(r=>r+1); }, 200);
          }
          
          return { ...req, status: newStatus, x: newX, y: newY };
        }).filter(req => req.x < 500); // Remove old requests
      });
    }, 50);
    
    return () => clearInterval(iv);
  }, [rateLimit, authEnabled, serviceStatus]);

  const toggleService = (service: keyof typeof serviceStatus) => {
    setServiceStatus(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const getColor = (status: string) => {
    switch (status) {
      case "success": return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]";
      case "blocked": return "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]";
      case "failed": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]";
      case "validating": return "bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]";
      default: return "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Visualization */}
      <div className="bg-black/30 rounded-2xl border border-white/10 p-6 min-h-[350px] relative overflow-hidden flex">
        {/* Left: Clients */}
        <div className="w-1/4 flex flex-col justify-center border-r border-white/10 pr-4 z-10">
          <div className="text-center mb-6 text-zinc-400 font-mono text-xs">CLIENTS</div>
          <div className="space-y-4">
            <Node label="Web App" icon="💻" isActive={false} color="cyan" />
            <Node label="Mobile" icon="📱" isActive={false} color="cyan" />
          </div>
        </div>

        {/* Middle: Gateway */}
        <div className="w-2/4 flex flex-col justify-center items-center relative z-10">
          <div className="text-center mb-6 text-zinc-400 font-mono text-xs">API GATEWAY</div>
          
          {/* Auth Sidecar */}
          <div className="absolute top-10 flex flex-col items-center">
            <button onClick={() => toggleService("auth")} className="group">
              <Node label="Auth Provider" icon="🔐" isActive={activeNodes.current.has("auth")} isFailed={!serviceStatus.auth} color="purple" />
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-xs px-2 py-1 rounded text-white transition-opacity">Toggle Auth Service</div>
            </button>
            <div className="h-8 w-px bg-dashed border-l border-white/20"></div>
          </div>

          <div className="w-32 bg-indigo-900/40 border-2 border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_30px_rgba(99,102,241,0.2)] backdrop-blur-md">
            <span className="text-4xl mb-2">🚦</span>
            <span className="font-bold text-indigo-300">Kong</span>
            <div className="mt-2 w-full space-y-1">
              <div className="text-[9px] bg-black/50 px-2 py-1 rounded text-center text-zinc-300">Rate Limit</div>
              <div className="text-[9px] bg-black/50 px-2 py-1 rounded text-center text-zinc-300">Routing</div>
              <div className="text-[9px] bg-black/50 px-2 py-1 rounded text-center text-zinc-300">SSL</div>
            </div>
          </div>
        </div>

        {/* Right: Microservices */}
        <div className="w-1/4 flex flex-col justify-between border-l border-white/10 pl-4 z-10 py-4">
          <div className="text-center mb-2 text-zinc-400 font-mono text-xs">MICROSERVICES</div>
          
          <button onClick={() => toggleService("users")} className="group relative">
            <Node label="User Service" icon="👤" isActive={activeNodes.current.has("users")} isFailed={!serviceStatus.users} color="emerald" />
          </button>
          
          <button onClick={() => toggleService("orders")} className="group relative">
            <Node label="Order Service" icon="🛒" isActive={activeNodes.current.has("orders")} isFailed={!serviceStatus.orders} color="emerald" />
          </button>
          
          <button onClick={() => toggleService("billing")} className="group relative">
            <Node label="Billing API" icon="💳" isActive={activeNodes.current.has("billing")} isFailed={!serviceStatus.billing} color="emerald" />
          </button>
        </div>

        {/* Animated Requests */}
        {requests.map(req => (
          <div
            key={req.id}
            className={`absolute w-3 h-3 rounded-full z-20 transition-all duration-75 ${getColor(req.status)}`}
            style={{ 
              left: `${(req.x / 500) * 100}%`, 
              top: `${req.y}px`,
              opacity: req.x > 450 || req.status === "blocked" || req.status === "failed" ? 0 : 1
            }}
          />
        ))}
      </div>

      {/* Controls & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Gateway Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Rate Limit (req/sec)</span>
                <span className="text-white font-mono">{rateLimit}</span>
              </div>
              <input
                type="range" min="1" max="50" value={rateLimit}
                onChange={e => setRateLimit(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Require Authentication</span>
              <button 
                onClick={() => setAuthEnabled(!authEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${authEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
              >
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full absolute top-1"
                  animate={{ left: authEnabled ? '26px' : '4px' }}
                />
              </button>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <span className="text-xs text-zinc-500 block mb-2">Click any node above to simulate failure</span>
              <div className="flex gap-2">
                {Object.entries(serviceStatus).map(([key, isUp]) => (
                  <span key={key} className={`text-[10px] px-2 py-1 rounded font-mono ${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {key}: {isUp ? 'UP' : 'DOWN'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Live Traffic Metrics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Total Requests</div>
              <div className="text-2xl font-mono text-cyan-400">{metrics.total}</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Successful Route</div>
              <div className="text-2xl font-mono text-emerald-400">{metrics.success}</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Rate Limited/Auth Denied</div>
              <div className="text-2xl font-mono text-amber-400">{metrics.blocked}</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Service Failures</div>
              <div className="text-2xl font-mono text-red-400">{metrics.failed}</div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Pending</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Auth</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Success</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Blocked</div>
          </div>
        </div>
      </div>
      
      {/* Features List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">🛡️</div>
          <h4 className="text-sm font-bold text-white">Rate Limiting</h4>
          <p className="text-xs text-zinc-400 mt-1">Protects backend services from traffic spikes</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">🔐</div>
          <h4 className="text-sm font-bold text-white">Authentication</h4>
          <p className="text-xs text-zinc-400 mt-1">Centralized JWT validation at the edge</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">🔀</div>
          <h4 className="text-sm font-bold text-white">Dynamic Routing</h4>
          <p className="text-xs text-zinc-400 mt-1">Routes to appropriate microservice</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">🔌</div>
          <h4 className="text-sm font-bold text-white">Circuit Breaker</h4>
          <p className="text-xs text-zinc-400 mt-1">Fails fast when downstream is down</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Request {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  type: "miss" | "hit" | "origin-return";
  speed: number;
}

export default function CdnAdvancedViz() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [cacheStrategy, setCacheStrategy] = useState("pull"); // pull, push, bypass
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({
    us_west: false,
    us_east: false,
    eu_west: false,
    ap_south: false,
    ap_east: false
  });
  
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgLatencyEdge: 12,
    avgLatencyOrigin: 215,
    bandwidthSaved: 0
  });

  const nextId = useRef(0);
  const isPlaying = useRef(true);

  // Define locations on our "map"
  const origin = { id: "origin", x: 75, y: 35, label: "US East (Origin)" };
  
  const pops = [
    { id: "us_west", x: 15, y: 30, label: "US West" },
    { id: "us_east", x: 65, y: 40, label: "US East" },
    { id: "eu_west", x: 45, y: 25, label: "Europe" },
    { id: "ap_south", x: 70, y: 65, label: "India" },
    { id: "ap_east", x: 85, y: 45, label: "Japan" }
  ];

  // User generation zones
  const userZones = [
    { x: 10, y: 20 }, { x: 20, y: 45 }, // US West
    { x: 55, y: 30 }, { x: 70, y: 50 }, // US East
    { x: 40, y: 15 }, { x: 50, y: 35 }, // EU
    { x: 65, y: 75 }, { x: 80, y: 60 }, // India
    { x: 90, y: 35 }, { x: 95, y: 55 }  // AP East
  ];

  // Generate requests
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPlaying.current) return;
      
      const zone = userZones[Math.floor(Math.random() * userZones.length)];
      
      // Add a little randomness to user position
      const userX = zone.x + (Math.random() * 5 - 2.5);
      const userY = zone.y + (Math.random() * 5 - 2.5);
      
      // Find nearest POP
      let nearestPop = pops[0];
      let minDistance = Infinity;
      
      pops.forEach(pop => {
        const dist = Math.sqrt(Math.pow(pop.x - userX, 2) + Math.pow(pop.y - userY, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearestPop = pop;
        }
      });

      // Determine routing based on strategy
      let targetX, targetY, type: Request["type"], speed;
      
      if (cacheStrategy === "bypass") {
        targetX = origin.x;
        targetY = origin.y;
        type = "miss";
        speed = 0.02; // Slow to origin
      } else {
        targetX = nearestPop.x;
        targetY = nearestPop.y;
        
        // Cache hit or miss?
        if (cacheStatus[nearestPop.id]) {
          type = "hit";
          speed = 0.08; // Fast to edge
          setMetrics(m => ({ 
            ...m, 
            totalRequests: m.totalRequests + 1, 
            cacheHits: m.cacheHits + 1,
            bandwidthSaved: m.bandwidthSaved + 2.5 // MB
          }));
        } else {
          type = "miss";
          speed = 0.04; // Medium (edge then origin)
          setMetrics(m => ({ 
            ...m, 
            totalRequests: m.totalRequests + 1, 
            cacheMisses: m.cacheMisses + 1 
          }));
          
          // Update cache status after a delay to simulate fetching
          setTimeout(() => {
            setCacheStatus(prev => ({ ...prev, [nearestPop.id]: true }));
          }, 1000);
        }
      }

      const req: Request = {
        id: nextId.current++,
        startX: userX,
        startY: userY,
        targetX,
        targetY,
        progress: 0,
        type,
        speed
      };
      
      setRequests(prev => [...prev, req]);
      
    }, 400); // 1 request every 400ms
    
    return () => clearInterval(iv);
  }, [cacheStrategy, cacheStatus]);

  // Animate requests
  useEffect(() => {
    const iv = setInterval(() => {
      setRequests(prev => {
        return prev.map(req => {
          let newProgress = req.progress + req.speed;
          let newType = req.type;
          let newStartX = req.startX;
          let newStartY = req.startY;
          let newTargetX = req.targetX;
          let newTargetY = req.targetY;

          if (newProgress >= 1.0) {
            // If it was a miss that hit the edge, now route to origin
            if (req.type === "miss" && cacheStrategy !== "bypass") {
              newType = "origin-return";
              newProgress = 0;
              newStartX = req.targetX;
              newStartY = req.targetY;
              newTargetX = origin.x;
              newTargetY = origin.y;
              return { ...req, progress: newProgress, type: newType, startX: newStartX, startY: newStartY, targetX: newTargetX, targetY: newTargetY };
            }
            // Otherwise it's done
            return { ...req, progress: 1.1 }; // Mark for deletion
          }
          
          return { ...req, progress: newProgress };
        }).filter(req => req.progress <= 1.0); // Remove completed
      });
    }, 50);
    
    return () => clearInterval(iv);
  }, [cacheStrategy]);

  // Push strategy logic
  useEffect(() => {
    if (cacheStrategy === "push") {
      // Proactively populate all caches
      setCacheStatus({
        us_west: true,
        us_east: true,
        eu_west: true,
        ap_south: true,
        ap_east: true
      });
    }
  }, [cacheStrategy]);

  const purgeCache = () => {
    setCacheStatus({
      us_west: false,
      us_east: false,
      eu_west: false,
      ap_south: false,
      ap_east: false
    });
  };

  const getHitRatio = () => {
    if (metrics.totalRequests === 0) return 0;
    return Math.round((metrics.cacheHits / metrics.totalRequests) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Map Visualization */}
      <div className="bg-black/40 rounded-2xl border border-white/10 p-4 relative overflow-hidden aspect-[2/1] min-h-[400px]">
        {/* World Map Background (Abstract) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* North America */}
          <div className="absolute left-[10%] top-[20%] w-[25%] h-[35%] bg-white/10 rounded-[40%] blur-xl mix-blend-screen"></div>
          {/* South America */}
          <div className="absolute left-[25%] top-[55%] w-[15%] h-[35%] bg-white/10 rounded-[40%] blur-xl mix-blend-screen"></div>
          {/* Europe */}
          <div className="absolute left-[45%] top-[15%] w-[15%] h-[25%] bg-white/10 rounded-[40%] blur-xl mix-blend-screen"></div>
          {/* Africa */}
          <div className="absolute left-[45%] top-[45%] w-[20%] h-[35%] bg-white/10 rounded-[40%] blur-xl mix-blend-screen"></div>
          {/* Asia */}
          <div className="absolute left-[65%] top-[20%] w-[30%] h-[40%] bg-white/10 rounded-[40%] blur-xl mix-blend-screen"></div>
          {/* Australia */}
          <div className="absolute left-[80%] top-[70%] w-[15%] h-[20%] bg-white/10 rounded-[40%] blur-xl mix-blend-screen"></div>
        </div>

        {/* Connections from Origin to PoPs (background) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          {pops.map(pop => (
            <line 
              key={`line-${pop.id}`}
              x1={`${origin.x}%`} y1={`${origin.y}%`} 
              x2={`${pop.x}%`} y2={`${pop.y}%`} 
              stroke="url(#gradient-origin)" strokeWidth="1" strokeDasharray="4 4"
            />
          ))}
          <defs>
            <linearGradient id="gradient-origin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Origin Server */}
        <div 
          className="absolute w-12 h-12 -ml-6 -mt-6 bg-purple-500/20 border-2 border-purple-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] z-10"
          style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
        >
          <span className="text-xl">🗄️</span>
          <div className="absolute -bottom-6 whitespace-nowrap text-[10px] font-bold text-purple-300 bg-black/50 px-1 rounded">Origin</div>
        </div>

        {/* Edge POPs */}
        {pops.map(pop => {
          const isCached = cacheStatus[pop.id];
          return (
            <div 
              key={pop.id}
              className={`absolute w-8 h-8 -ml-4 -mt-4 border-2 rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${
                isCached 
                  ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  : "bg-zinc-800/50 border-zinc-500"
              }`}
              style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
            >
              <span className="text-xs">{isCached ? "⚡" : "☁️"}</span>
              <div className="absolute -bottom-5 whitespace-nowrap text-[9px] text-zinc-400 bg-black/50 px-1 rounded">{pop.label}</div>
              
              {/* Cache status indicator */}
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" style={{ opacity: isCached ? 1 : 0, transition: "opacity 0.3s" }}></div>
            </div>
          );
        })}

        {/* Animated Requests */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {requests.map(req => {
            const currentX = req.startX + (req.targetX - req.startX) * req.progress;
            const currentY = req.startY + (req.targetY - req.startY) * req.progress;
            
            let color = "#3b82f6"; // Blue default
            if (req.type === "hit") color = "#10b981"; // Green
            if (req.type === "miss" && cacheStrategy === "bypass") color = "#ef4444"; // Red
            if (req.type === "origin-return") color = "#f59e0b"; // Yellow
            
            return (
              <g key={req.id}>
                <circle cx={`${currentX}%`} cy={`${currentY}%`} r="3" fill={color} filter="url(#glow)" />
                {req.type === "hit" && (
                  <circle cx={`${currentX}%`} cy={`${currentY}%`} r="6" fill="none" stroke={color} strokeWidth="1" opacity={1 - req.progress} />
                )}
              </g>
            );
          })}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 border border-white/10 p-3 rounded-lg backdrop-blur-md z-30 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]"></div> Cache Hit (Fast)
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> Cache Miss (Fetching)
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div> Origin Fetch (Slow)
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_5px_#ef4444]"></div> Direct to Origin (Bypass)
          </div>
        </div>
      </div>

      {/* Controls & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">CDN Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400 mb-2 block">Caching Strategy</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCacheStrategy("pull"); purgeCache(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${cacheStrategy === "pull" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50" : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent"}`}
                >
                  Pull (Lazy)
                </button>
                <button 
                  onClick={() => setCacheStrategy("push")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${cacheStrategy === "push" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50" : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent"}`}
                >
                  Push (Pre-warm)
                </button>
                <button 
                  onClick={() => { setCacheStrategy("bypass"); purgeCache(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${cacheStrategy === "bypass" ? "bg-red-500/20 text-red-300 border border-red-500/50" : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent"}`}
                >
                  Bypass (Direct)
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 min-h-[30px]">
                {cacheStrategy === "pull" && "Content is fetched from origin on first request, then cached for subsequent requests. (Cold start penalty)"}
                {cacheStrategy === "push" && "Content is proactively uploaded to all edge servers before users request it. (Zero cold starts)"}
                {cacheStrategy === "bypass" && "CDN is disabled. All traffic goes directly to the origin server. (High latency, high origin load)"}
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <button 
                onClick={purgeCache}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>🗑️</span> Purge Entire Cache (Invalidate)
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Performance Impact</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Cache Hit Ratio</div>
              <div className="flex items-end gap-1">
                <div className={`text-2xl font-mono ${getHitRatio() > 80 ? 'text-emerald-400' : getHitRatio() > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {getHitRatio()}%
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${getHitRatio()}%` }}></div>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Origin Bandwidth Saved</div>
              <div className="text-2xl font-mono text-cyan-400">{(metrics.bandwidthSaved).toFixed(1)} <span className="text-sm">MB</span></div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3 border border-white/5 col-span-2 flex justify-between items-center">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Avg Response Time</div>
                <div className="text-2xl font-mono text-white">
                  {cacheStrategy === "bypass" 
                    ? metrics.avgLatencyOrigin 
                    : Math.round((metrics.avgLatencyEdge * (getHitRatio()/100)) + (metrics.avgLatencyOrigin * (1 - (getHitRatio()/100))))
                  } <span className="text-sm text-zinc-500">ms</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-400/70 uppercase">Edge: ~{metrics.avgLatencyEdge}ms</div>
                <div className="text-[10px] text-red-400/70 uppercase">Origin: ~{metrics.avgLatencyOrigin}ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">⚡</div>
          <h4 className="text-sm font-bold text-white">Edge Caching</h4>
          <p className="text-xs text-zinc-400 mt-1">Serve content close to users</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">🔄</div>
          <h4 className="text-sm font-bold text-white">Invalidation</h4>
          <p className="text-xs text-zinc-400 mt-1">Purge stale content via API</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">🛡️</div>
          <h4 className="text-sm font-bold text-white">Origin Shield</h4>
          <p className="text-xs text-zinc-400 mt-1">Absorb traffic spikes & DDoS</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-xl mb-2">💻</div>
          <h4 className="text-sm font-bold text-white">Edge Computing</h4>
          <p className="text-xs text-zinc-400 mt-1">Run serverless code at PoPs</p>
        </div>
      </div>
    </div>
  );
}

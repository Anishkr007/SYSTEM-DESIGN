"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- QuadTree Logic for Location Tracking Visualization ---
class Point {
  constructor(public x: number, public y: number, public data: any) {}
}

class Rectangle {
  constructor(public x: number, public y: number, public w: number, public h: number) {}
  contains(point: Point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.w &&
      point.y >= this.y &&
      point.y <= this.y + this.h
    );
  }
}

class QuadTree {
  points: Point[] = [];
  divided: boolean = false;
  northeast?: QuadTree;
  northwest?: QuadTree;
  southeast?: QuadTree;
  southwest?: QuadTree;

  constructor(public boundary: Rectangle, public capacity: number) {}

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;
    this.northeast = new QuadTree(new Rectangle(x + w, y, w, h), this.capacity);
    this.northwest = new QuadTree(new Rectangle(x, y, w, h), this.capacity);
    this.southeast = new QuadTree(new Rectangle(x + w, y + h, w, h), this.capacity);
    this.southwest = new QuadTree(new Rectangle(x, y + h, w, h), this.capacity);
    this.divided = true;

    for (const p of this.points) {
      this.northeast.insert(p) ||
      this.northwest.insert(p) ||
      this.southeast.insert(p) ||
      this.southwest.insert(p);
    }
    this.points = [];
  }

  insert(point: Point): boolean {
    if (!this.boundary.contains(point)) return false;
    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
      return true;
    }
    if (!this.divided) this.subdivide();
    return (
      this.northeast!.insert(point) ||
      this.northwest!.insert(point) ||
      this.southeast!.insert(point) ||
      this.southwest!.insert(point)
    );
  }

  getRectangles(): Rectangle[] {
    let rects = [this.boundary];
    if (this.divided) {
      rects = rects.concat(this.northeast!.getRectangles());
      rects = rects.concat(this.northwest!.getRectangles());
      rects = rects.concat(this.southeast!.getRectangles());
      rects = rects.concat(this.southwest!.getRectangles());
    }
    return rects;
  }
}

// --- Types & Constants ---
type Driver = {
  id: number;
  x: number;
  y: number;
  state: 'idle' | 'matched' | 'riding';
  targetRiderId?: number;
  tx?: number;
  ty?: number;
};

type Rider = {
  id: number;
  x: number;
  y: number;
  state: 'waiting' | 'matched' | 'riding';
  driverId?: number;
  dispatching?: boolean;
};

type DispatchState = {
  state: 'idle' | 'searching';
  x: number;
  y: number;
  radius: number;
  riderId: number | null;
};

type Packet = {
  id: number;
  from: string;
  to: string;
  progress: number;
  color: string;
};

type LogEntry = {
  id: string;
  msg: string;
  time: string;
};

type GameState = {
  drivers: Driver[];
  riders: Rider[];
  dispatch: DispatchState;
  packets: Packet[];
  logs: LogEntry[];
  idCounter: number;
  ridesCompleted: number;
};

const ArchNodes: Record<string, { x: number; y: number; label: string; color: string }> = {
  RiderApp:   { x: 50, y: 50, label: 'Rider App', color: '#10b981' },
  DriverApp:  { x: 250, y: 50, label: 'Driver App', color: '#3b82f6' },
  Dispatch:   { x: 150, y: 120, label: 'Dispatch', color: '#ec4899' },
  LocationDB: { x: 150, y: 220, label: 'Quadtree DB', color: '#f59e0b' },
  Payment:    { x: 250, y: 220, label: 'Payment', color: '#8b5cf6' },
};

const archLines = [
  ['RiderApp', 'Dispatch'],
  ['DriverApp', 'Dispatch'],
  ['DriverApp', 'LocationDB'],
  ['Dispatch', 'LocationDB'],
  ['Dispatch', 'Payment'],
];

// --- Main Component ---
export default function DesignUberViz() {
  const [gameState, setGameState] = useState<GameState>({
    drivers: [
      { id: 1, x: 100, y: 100, state: 'idle' },
      { id: 2, x: 300, y: 250, state: 'idle' },
      { id: 3, x: 200, y: 150, state: 'idle' },
    ],
    riders: [],
    dispatch: { state: 'idle', x: 0, y: 0, radius: 0, riderId: null },
    packets: [],
    logs: [{ id: 'init', msg: 'Uber Core Systems Initialized.', time: new Date().toLocaleTimeString() }],
    idCounter: 4,
    ridesCompleted: 0
  });

  // Main simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const nextPackets = prev.packets
          .map(p => ({ ...p, progress: p.progress + 0.12 }))
          .filter(p => p.progress < 1);
        let newLogs = [...prev.logs];
        let newRiders = prev.riders.map(r => ({ ...r }));
        let newDrivers = prev.drivers.map(d => ({ ...d }));
        let newDispatch = { ...prev.dispatch };
        let newRidesCompleted = prev.ridesCompleted;

        // 1. Move Drivers
        newDrivers = newDrivers.map(d => {
          if (d.state === 'idle') {
            // Random walk
            const dx = (Math.random() - 0.5) * 8;
            const dy = (Math.random() - 0.5) * 8;
            const nx = Math.max(10, Math.min(390, d.x + dx));
            const ny = Math.max(10, Math.min(390, d.y + dy));
            
            // Randomly stream GPS to Location Tracking
            if (Math.random() < 0.03) {
              nextPackets.push({ id: Math.random(), from: 'DriverApp', to: 'LocationDB', progress: 0, color: '#3b82f6' });
            }
            return { ...d, x: nx, y: ny };
          } else if (d.state === 'matched' && d.targetRiderId != null) {
            // Move to rider
            const rider = newRiders.find(r => r.id === d.targetRiderId);
            if (rider) {
              const dx = rider.x - d.x;
              const dy = rider.y - d.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 8) {
                rider.state = 'riding';
                return { ...d, state: 'riding', tx: Math.random() * 360 + 20, ty: Math.random() * 360 + 20 };
              } else {
                return { ...d, x: d.x + (dx / dist) * 8, y: d.y + (dy / dist) * 8 };
              }
            } else {
              return { ...d, state: 'idle', targetRiderId: undefined };
            }
          } else if (d.state === 'riding' && d.tx != null && d.ty != null) {
            // Move to destination
            const dx = d.tx - d.x;
            const dy = d.ty - d.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const riderIndex = newRiders.findIndex(r => r.id === d.targetRiderId);

            if (dist < 8) {
              // Ride Finished
              if (riderIndex > -1) newRiders.splice(riderIndex, 1);
              newLogs.push({ id: Math.random().toString(), msg: `Ride complete. Payment processing.`, time: new Date().toLocaleTimeString() });
              nextPackets.push({ id: Math.random(), from: 'Dispatch', to: 'Payment', progress: 0, color: '#8b5cf6' });
              newRidesCompleted++;
              return { ...d, state: 'idle', targetRiderId: undefined };
            } else {
              const moveX = d.x + (dx / dist) * 8;
              const moveY = d.y + (dy / dist) * 8;
              if (riderIndex > -1) {
                newRiders[riderIndex].x = moveX;
                newRiders[riderIndex].y = moveY;
              }
              return { ...d, x: moveX, y: moveY };
            }
          }
          return d;
        });

        // 2. Dispatch Logic
        if (newDispatch.state === 'idle') {
          const waitingIndex = newRiders.findIndex(r => r.state === 'waiting' && !r.dispatching);
          if (waitingIndex > -1) {
            newRiders[waitingIndex].dispatching = true;
            newDispatch = { state: 'searching', riderId: newRiders[waitingIndex].id, x: newRiders[waitingIndex].x, y: newRiders[waitingIndex].y, radius: 20 };
            newLogs.push({ id: Math.random().toString(), msg: `Rider ${newRiders[waitingIndex].id} requesting ride.`, time: new Date().toLocaleTimeString() });
            nextPackets.push({ id: Math.random(), from: 'RiderApp', to: 'Dispatch', progress: 0, color: '#10b981' });
            nextPackets.push({ id: Math.random(), from: 'Dispatch', to: 'LocationDB', progress: 0, color: '#ec4899' });
          }
        } else if (newDispatch.state === 'searching') {
          newDispatch.radius += 18;
          const idleDrivers = newDrivers.filter(d => d.state === 'idle');
          const inRadius = idleDrivers.filter(d => {
            const dist = Math.sqrt((d.x - newDispatch.x) ** 2 + (d.y - newDispatch.y) ** 2);
            return dist <= newDispatch.radius;
          });

          if (inRadius.length > 0) {
            const matchedDriver = inRadius[0];
            const matchedDriverIndex = newDrivers.findIndex(d => d.id === matchedDriver.id);
            newDrivers[matchedDriverIndex].state = 'matched';
            newDrivers[matchedDriverIndex].targetRiderId = newDispatch.riderId;

            const riderIndex = newRiders.findIndex(r => r.id === newDispatch.riderId);
            if (riderIndex > -1) {
              newRiders[riderIndex].state = 'matched';
              newRiders[riderIndex].driverId = matchedDriver.id;
            }

            newLogs.push({ id: Math.random().toString(), msg: `Driver ${matchedDriver.id} assigned. En route.`, time: new Date().toLocaleTimeString() });
            nextPackets.push({ id: Math.random(), from: 'LocationDB', to: 'Dispatch', progress: 0, color: '#f59e0b' });
            nextPackets.push({ id: Math.random(), from: 'Dispatch', to: 'DriverApp', progress: 0, color: '#ec4899' });

            newDispatch = { state: 'idle', x: 0, y: 0, radius: 0, riderId: null };
          } else if (newDispatch.radius > 500) {
            newLogs.push({ id: Math.random().toString(), msg: `No drivers found. Retrying later.`, time: new Date().toLocaleTimeString() });
            const riderIndex = newRiders.findIndex(r => r.id === newDispatch.riderId);
            if (riderIndex > -1) newRiders[riderIndex].dispatching = false;
            newDispatch = { state: 'idle', x: 0, y: 0, radius: 0, riderId: null };
          }
        }

        if (newLogs.length > 7) newLogs = newLogs.slice(-7);

        return { ...prev, drivers: newDrivers, riders: newRiders, packets: nextPackets, logs: newLogs, dispatch: newDispatch, ridesCompleted: newRidesCompleted };
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Compute QuadTree dynamically
  const quadRects = useMemo(() => {
    const qtBoundary = new Rectangle(0, 0, 400, 400);
    const qt = new QuadTree(qtBoundary, 4);
    gameState.drivers.forEach(d => qt.insert(new Point(d.x, d.y, d)));
    return qt.getRectangles();
  }, [gameState.drivers]);

  // Controls
  const spawnRider = () => {
    setGameState(prev => ({
      ...prev,
      riders: [...prev.riders, { id: prev.idCounter, x: Math.random() * 360 + 20, y: Math.random() * 360 + 20, state: 'waiting' }],
      idCounter: prev.idCounter + 1,
    }));
  };

  const spawnDriver = () => {
    setGameState(prev => ({
      ...prev,
      drivers: [...prev.drivers, { id: prev.idCounter, x: Math.random() * 360 + 20, y: Math.random() * 360 + 20, state: 'idle' }],
      idCounter: prev.idCounter + 1,
    }));
  };

  const spawnFleet = () => {
    setGameState(prev => {
      let newDrivers = [...prev.drivers];
      for (let i = 0; i < 5; i++) {
        newDrivers.push({ id: prev.idCounter + i, x: Math.random() * 360 + 20, y: Math.random() * 360 + 20, state: 'idle' });
      }
      return {
        ...prev,
        drivers: newDrivers,
        idCounter: prev.idCounter + 5,
        logs: [...prev.logs, { id: Math.random().toString(), msg: `Fleet of 5 drivers deployed.`, time: new Date().toLocaleTimeString() }].slice(-7)
      };
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-200 font-sans overflow-hidden p-6">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-6xl mx-auto z-10 flex flex-col lg:flex-row gap-6 h-full">
        
        {/* Left Column: Live Map */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-3 shadow-[0_0_8px_#34d399]"></span>
                Live Dispatch Map
              </h2>
              <div className="flex space-x-2">
                <button onClick={spawnRider} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-md border border-emerald-500/50 transition-colors">
                  + Rider
                </button>
                <button onClick={spawnDriver} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-semibold rounded-md border border-blue-500/50 transition-colors">
                  + Driver
                </button>
                <button onClick={spawnFleet} className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 text-xs font-semibold rounded-md border border-gray-600 transition-colors">
                  + Fleet
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-square max-h-[600px] flex items-center justify-center p-6 bg-gray-950/50">
              <svg viewBox="0 0 400 400" className="w-full h-full border border-gray-800/80 rounded-xl bg-gray-950 shadow-inner">
                {/* Filters */}
                <defs>
                  <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* QuadTree Grid */}
                <g opacity="0.4">
                  {quadRects.map((r, i) => (
                    <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.3" />
                  ))}
                </g>

                {/* Dispatch Ring */}
                <AnimatePresence>
                  {gameState.dispatch.state === 'searching' && (
                    <motion.circle
                      cx={gameState.dispatch.x}
                      cy={gameState.dispatch.y}
                      r={gameState.dispatch.radius}
                      fill="rgba(236, 72, 153, 0.05)"
                      stroke="#ec4899"
                      strokeWidth="2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                {/* Drivers */}
                {gameState.drivers.map(d => (
                  <motion.g key={`driver-${d.id}`} animate={{ x: d.x, y: d.y }} transition={{ type: "tween", duration: 0.15, ease: "linear" }}>
                    <circle cx={0} cy={0} r={4} fill="#3b82f6" filter="url(#glow-blue)" />
                    {d.state === 'idle' && (
                      <circle cx={0} cy={0} r={8} fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6" />
                    )}
                  </motion.g>
                ))}

                {/* Riders */}
                {gameState.riders.map(r => (
                  <motion.g key={`rider-${r.id}`} animate={{ x: r.x, y: r.y }} transition={{ type: "tween", duration: 0.15, ease: "linear" }}>
                    <circle cx={0} cy={0} r={4} fill="#10b981" filter="url(#glow-emerald)" />
                    {r.state === 'waiting' && (
                      <circle cx={0} cy={0} r={10} fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="2 2" />
                    )}
                  </motion.g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Architecture & Data */}
        <div className="w-full lg:w-[450px] flex flex-col space-y-6">
          
          {/* Metrics Panel */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-xl">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Active Drivers</div>
              <div className="text-3xl font-black text-blue-400">{gameState.drivers.length}</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-xl">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Waiting Riders</div>
              <div className="text-3xl font-black text-emerald-400">{gameState.riders.filter(r => r.state === 'waiting').length}</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-xl">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Rides Completed</div>
              <div className="text-3xl font-black text-violet-400">{gameState.ridesCompleted}</div>
            </div>
          </div>

          {/* Architecture Panel */}
          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl flex-1 flex flex-col">
            <div className="p-4 bg-gray-800/50 border-b border-gray-700">
              <h2 className="text-lg font-bold text-gray-200">System Architecture</h2>
            </div>
            <div className="flex-1 p-4 relative flex items-center justify-center min-h-[280px]">
              <svg viewBox="0 0 300 300" className="w-full h-full max-w-[300px]">
                {/* Edges */}
                {archLines.map((line, i) => {
                  const from = ArchNodes[line[0]];
                  const to = ArchNodes[line[1]];
                  return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />
                })}
                
                {/* Packets */}
                {gameState.packets.map(p => {
                  const from = ArchNodes[p.from];
                  const to = ArchNodes[p.to];
                  if (!from || !to) return null;
                  const x = from.x + (to.x - from.x) * p.progress;
                  const y = from.y + (to.y - from.y) * p.progress;
                  return (
                    <circle key={p.id} cx={x} cy={y} r={4} fill={p.color} className="drop-shadow-[0_0_5px_currentColor]" />
                  )
                })}

                {/* Nodes */}
                {Object.values(ArchNodes).map((n, i) => (
                  <g key={i}>
                    <rect x={n.x - 42} y={n.y - 17} width={84} height={34} rx={6} fill="#111827" stroke={n.color} strokeWidth="2" />
                    <text x={n.x} y={n.y + 4} fill="#e5e7eb" fontSize="10" textAnchor="middle" fontWeight="bold">{n.label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl h-[220px] flex flex-col shadow-2xl">
            <div className="p-3 border-b border-gray-800 flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
              <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">System Event Logs</h3>
            </div>
            <div className="p-4 overflow-hidden flex-1 flex flex-col justify-end space-y-2">
              <AnimatePresence>
                {gameState.logs.map(log => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-xs font-mono flex items-start space-x-3"
                  >
                    <span className="text-gray-500 shrink-0">[{log.time}]</span>
                    <span className="text-gray-300">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

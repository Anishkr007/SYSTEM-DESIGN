"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: number;
  value: number;
  timestamp: number; // Simulated event time
  x: number;
  y: number;
  status: "producing" | "queued" | "processing" | "aggregated";
}

interface WindowResult {
  id: number;
  startTime: number;
  endTime: number;
  sum: number;
  count: number;
}

export default function StreamProcessingViz() {
  const [windowType, setWindowType] = useState<"tumbling" | "sliding">("tumbling");
  const [windowSize, setWindowSize] = useState(5); // seconds
  const [slideSize, setSlideSize] = useState(2); // seconds (for sliding only)
  
  const [events, setEvents] = useState<Event[]>([]);
  const [results, setResults] = useState<WindowResult[]>([]);
  const [currentTime, setCurrentTime] = useState(0); // Simulated time in seconds
  
  const [metrics, setMetrics] = useState({
    eventsProcessed: 0,
    currentThroughput: 0,
    windowsEmitted: 0
  });

  const isPlaying = useRef(true);
  const nextEventId = useRef(0);
  const nextResultId = useRef(0);
  const throughputCounter = useRef(0);

  // Time progression (1 second simulated = 1 second real)
  useEffect(() => {
    const iv = setInterval(() => {
      if (isPlaying.current) {
        setCurrentTime(t => t + 1);
        
        // Calculate throughput
        setMetrics(m => ({
          ...m,
          currentThroughput: throughputCounter.current
        }));
        throughputCounter.current = 0;
      }
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Event Generation (Producers)
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPlaying.current) return;
      
      // Generate 1-3 events
      const numEvents = Math.floor(Math.random() * 3) + 1;
      
      for(let i=0; i<numEvents; i++) {
        const newEvent: Event = {
          id: nextEventId.current++,
          value: Math.floor(Math.random() * 50) + 10,
          timestamp: currentTime, // Event time is close to current time
          x: 0,
          y: 40 + (Math.random() * 20 - 10), // Random vertical jitter
          status: "producing"
        };
        
        setEvents(prev => [...prev, newEvent]);
      }
    }, 300); // Fast generation
    return () => clearInterval(iv);
  }, [currentTime]);

  // Event Movement & Processing Pipeline
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPlaying.current) return;
      
      setEvents(prev => {
        return prev.map(ev => {
          let newX = ev.x;
          let newStatus = ev.status;
          
          if (ev.status === "producing") {
            newX += 2;
            if (newX > 30) newStatus = "queued"; // Hit Kafka
          } else if (ev.status === "queued") {
            newX += 1.5;
            if (newX > 60) newStatus = "processing"; // Hit Flink
          } else if (ev.status === "processing") {
            newX += 0.5; // Slow down in processor
            // Window logic is handled in the time effect, this just moves it visually
            if (newX > 80) {
              newStatus = "aggregated"; // Used in a window
              throughputCounter.current++;
              setMetrics(m => ({ ...m, eventsProcessed: m.eventsProcessed + 1 }));
            }
          }
          
          return { ...ev, x: newX, status: newStatus };
        }).filter(ev => ev.x < 100 && ev.status !== "aggregated"); // Remove once done
      });
    }, 50);
    return () => clearInterval(iv);
  }, []);

  // Windowing Logic
  useEffect(() => {
    // Check if a window should close at the current simulated time
    let shouldEmit = false;
    let windowStart = 0;
    let windowEnd = 0;

    if (windowType === "tumbling") {
      if (currentTime > 0 && currentTime % windowSize === 0) {
        shouldEmit = true;
        windowEnd = currentTime;
        windowStart = currentTime - windowSize;
      }
    } else {
      // Sliding window
      if (currentTime > 0 && currentTime % slideSize === 0) {
        shouldEmit = true;
        windowEnd = currentTime;
        windowStart = currentTime - windowSize;
      }
    }

    if (shouldEmit) {
      // Find all events that fall into this window
      // Note: In reality, Flink uses event timestamps. We kept them around in state or reconstruct based on generated data.
      // For visual simplicity, we'll just take a random aggregate based on the throughput
      
      const count = Math.floor(Math.random() * 10) + 5;
      const sum = count * (Math.floor(Math.random() * 40) + 20);
      
      const result: WindowResult = {
        id: nextResultId.current++,
        startTime: windowStart,
        endTime: windowEnd,
        sum,
        count
      };
      
      setResults(prev => [result, ...prev].slice(0, 5));
      setMetrics(m => ({ ...m, windowsEmitted: m.windowsEmitted + 1 }));
      
      // Visually "consume" events in the processing area
      setEvents(prev => prev.filter(ev => ev.status !== "processing" || ev.x < 75));
    }
  }, [currentTime, windowType, windowSize, slideSize]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Windowing Strategy</h3>
            <div className="flex bg-black/40 rounded-lg p-1 mb-4">
              <button 
                onClick={() => setWindowType("tumbling")}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${windowType === "tumbling" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Tumbling
              </button>
              <button 
                onClick={() => setWindowType("sliding")}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${windowType === "sliding" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Sliding
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 text-zinc-400">
                  <span>Window Size</span>
                  <span className="text-white font-mono">{windowSize}s</span>
                </div>
                <input
                  type="range" min="2" max="10" step="1" value={windowSize}
                  onChange={e => setWindowSize(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500"
                />
              </div>
              
              {windowType === "sliding" && (
                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Slide Interval</span>
                    <span className="text-white font-mono">{slideSize}s</span>
                  </div>
                  <input
                    type="range" min="1" max={windowSize - 1} step="1" value={slideSize}
                    onChange={e => setSlideSize(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-[10px] text-zinc-300">
                {windowType === "tumbling" 
                  ? "Tumbling windows do not overlap. Events are grouped into fixed-size buckets based on their timestamp. E.g., hourly reports."
                  : "Sliding windows overlap. A window of size X slides forward every Y seconds. An event can belong to multiple windows. E.g., trailing 5-minute average updated every minute."
                }
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Pipeline Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-2 rounded border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase">Throughput</div>
                <div className="text-lg font-mono text-cyan-400">{metrics.currentThroughput} <span className="text-[10px] text-zinc-500">ev/s</span></div>
              </div>
              <div className="bg-black/30 p-2 rounded border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase">Processed</div>
                <div className="text-lg font-mono text-emerald-400">{metrics.eventsProcessed}</div>
              </div>
              <div className="bg-black/30 p-2 rounded border border-white/5 col-span-2">
                <div className="text-[9px] text-zinc-500 uppercase">Windows Emitted</div>
                <div className="text-lg font-mono text-purple-400">{metrics.windowsEmitted}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualizer Pipeline */}
        <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-white/10 p-6 relative flex flex-col justify-between min-h-[400px]">
          
          {/* Top Info Bar */}
          <div className="flex justify-between items-center bg-black/50 px-4 py-2 rounded-lg border border-white/5 text-xs font-mono mb-4">
            <span className="text-zinc-400">Stream Processing Pipeline</span>
            <span className="text-white">Time: <span className="text-emerald-400">T+{currentTime}s</span></span>
          </div>

          {/* Pipeline Diagram */}
          <div className="relative flex-1 flex items-center mb-6 py-10 overflow-hidden">
            
            {/* Background Blocks */}
            <div className="absolute inset-0 flex items-center justify-between px-4 z-0 pointer-events-none">
              {/* Source */}
              <div className="w-[25%] h-32 border-2 border-dashed border-zinc-600 rounded-xl flex flex-col justify-end p-2 opacity-50">
                <span className="text-xs font-bold text-zinc-500 text-center uppercase tracking-wider">Producers</span>
              </div>
              {/* Message Broker */}
              <div className="w-[30%] h-32 border border-blue-500/30 bg-blue-500/5 rounded-xl flex flex-col justify-end p-2 opacity-80">
                <span className="text-xs font-bold text-blue-400/50 text-center uppercase tracking-wider">Apache Kafka</span>
              </div>
              {/* Stream Processor */}
              <div className="w-[35%] h-32 border border-purple-500/50 bg-purple-500/10 rounded-xl flex flex-col justify-end p-2">
                <span className="text-xs font-bold text-purple-400 text-center uppercase tracking-wider mb-1">Apache Flink</span>
                <div className="w-full h-2 bg-purple-500/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(currentTime % (windowType === "tumbling" ? windowSize : slideSize)) / (windowType === "tumbling" ? windowSize : slideSize) * 100}%` }}
                  />
                </div>
                <div className="text-[8px] text-center mt-1 text-purple-300/50">Next Window Close</div>
              </div>
            </div>

            {/* Event Particles */}
            {events.map(ev => {
              let color = "bg-zinc-400";
              if (ev.status === "queued") color = "bg-blue-400 shadow-[0_0_8px_#3b82f6]";
              if (ev.status === "processing") color = "bg-purple-400 shadow-[0_0_10px_#a855f7]";
              
              return (
                <div 
                  key={ev.id}
                  className={`absolute w-3 h-3 rounded-full z-10 ${color}`}
                  style={{ left: `${ev.x}%`, top: `${ev.y}%` }}
                >
                  <div className="absolute -top-4 -left-1 text-[8px] font-mono text-white/70">
                    {ev.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aggregated Output Sink */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2 border-t border-white/10 pt-4">Output Sink (Database / Dashboard)</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <AnimatePresence>
                {results.length === 0 && (
                  <div className="text-sm text-zinc-600 italic py-4">Waiting for first window to close...</div>
                )}
                {results.map((res) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="shrink-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-lg p-3 min-w-[140px]"
                  >
                    <div className="text-[10px] text-emerald-400/70 font-mono mb-1">
                      Window [{res.startTime}s - {res.endTime}s]
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[9px] text-zinc-400 uppercase">Sum</div>
                        <div className="text-lg font-bold text-white">{res.sum}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-zinc-400 uppercase">Events</div>
                        <div className="text-sm font-mono text-emerald-300">{res.count}</div>
                      </div>
                    </div>
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

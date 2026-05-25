"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────
interface Packet {
  id: number;
  status: "allowed" | "rejected" | "pending";
  x: number;
}

interface LogEntry {
  id: number;
  timestamp: number;
  status: "allowed" | "rejected";
}

interface MetricPoint {
  allowed: number;
  rejected: number;
}

type AlgoTab = "token-bucket" | "leaky-bucket" | "fixed-window" | "sliding-counter" | "sliding-log";

const TABS: { id: AlgoTab; label: string; icon: string }[] = [
  { id: "token-bucket", label: "Token Bucket", icon: "🪣" },
  { id: "leaky-bucket", label: "Leaky Bucket", icon: "💧" },
  { id: "fixed-window", label: "Fixed Window", icon: "⏱️" },
  { id: "sliding-counter", label: "Sliding Counter", icon: "📊" },
  { id: "sliding-log", label: "Sliding Log", icon: "📜" },
];

// ─── Sparkline SVG ───────────────────────────────────────
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 160;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * (height - 4)}`).join(" ");
  return (
    <svg width={w} height={height} className="opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Slider Control ──────────────────────────────────────
function Slider({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-mono">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.8)]"
      />
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────
function MetricCard({ label, value, color, sparkData }: { label: string; value: string | number; color: string; sparkData?: number[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
      {sparkData && <div className="mt-2"><Sparkline data={sparkData} color={color} height={24} /></div>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// TOKEN BUCKET
// ═════════════════════════════════════════════════════════
function TokenBucketViz() {
  const [bucketSize, setBucketSize] = useState(10);
  const [refillRate, setRefillRate] = useState(3);
  const [requestRate, setRequestRate] = useState(5);
  const [tokens, setTokens] = useState(10);
  const [allowed, setAllowed] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const [running, setRunning] = useState(true);
  const nextId = useRef(0);
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  // Refill tokens
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setTokens(t => Math.min(t + 1, bucketSize));
    }, 1000 / refillRate);
    return () => clearInterval(iv);
  }, [refillRate, bucketSize, running]);

  // Generate requests
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const id = nextId.current++;
      if (tokensRef.current > 0) {
        setTokens(t => t - 1);
        setAllowed(a => a + 1);
        setPackets(p => [...p.slice(-15), { id, status: "allowed", x: 0 }]);
      } else {
        setRejected(r => r + 1);
        setPackets(p => [...p.slice(-15), { id, status: "rejected", x: 0 }]);
      }
    }, 1000 / requestRate);
    return () => clearInterval(iv);
  }, [requestRate, running]);

  // History
  useEffect(() => {
    const iv = setInterval(() => {
      setHistory(h => [...h.slice(-19), { allowed, rejected }]);
    }, 1000);
    return () => clearInterval(iv);
  }, [allowed, rejected]);

  const tokenFill = (tokens / bucketSize) * 100;

  return (
    <div className="space-y-6">
      {/* Visualization */}
      <div className="relative bg-black/30 rounded-2xl border border-white/10 p-6 min-h-[280px] overflow-hidden">
        {/* Request stream */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <div className="text-xs text-zinc-500">Requests</div>
          <div className="text-2xl">📡</div>
        </div>

        {/* Animated packets */}
        <AnimatePresence>
          {packets.slice(-8).map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 60, y: 120, opacity: 1, scale: 1 }}
              animate={p.status === "allowed"
                ? { x: 220, y: 120, opacity: 0.3, scale: 0.5 }
                : { x: 60, y: 60, opacity: 0, scale: 1.5 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute"
            >
              <div className={`w-3 h-3 rounded-full ${
                p.status === "allowed"
                  ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              }`} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Token Bucket */}
        <div className="mx-auto w-40 relative flex flex-col items-center">
          <div className="text-xs text-zinc-400 mb-2 font-mono">BUCKET ({tokens}/{bucketSize})</div>
          <div className="w-32 h-44 rounded-b-2xl rounded-t-lg border-2 border-cyan-500/40 relative overflow-hidden bg-black/50">
            {/* Fill level */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500/60 to-indigo-500/30"
              animate={{ height: `${tokenFill}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            {/* Token dots */}
            <div className="absolute inset-0 flex flex-wrap content-end justify-center gap-1 p-2">
              {Array.from({ length: tokens }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] border border-cyan-300/50"
                />
              ))}
            </div>
          </div>
          {/* Refill indicator */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 / refillRate }}
            className="mt-2 text-xs text-cyan-400 font-mono"
          >
            ↓ +1 token / {(1000 / refillRate).toFixed(0)}ms
          </motion.div>
        </div>

        {/* Output */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <div className="text-xs text-zinc-500">API Server</div>
          <div className="text-2xl">🖥️</div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-4">
        <Slider label="Bucket Size" value={bucketSize} onChange={setBucketSize} min={1} max={20} unit=" tokens" />
        <Slider label="Refill Rate" value={refillRate} onChange={setRefillRate} min={1} max={10} unit="/sec" />
        <Slider label="Request Rate" value={requestRate} onChange={setRequestRate} min={1} max={15} unit="/sec" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Tokens" value={tokens} color="#22d3ee" sparkData={history.map(h => h.allowed)} />
        <MetricCard label="Allowed" value={allowed} color="#34d399" />
        <MetricCard label="Rejected" value={rejected} color="#f87171" />
        <MetricCard label="Allow Rate" value={allowed + rejected > 0 ? `${Math.round((allowed / (allowed + rejected)) * 100)}%` : "—"} color="#a78bfa" sparkData={history.map(h => h.allowed)} />
      </div>

      <button onClick={() => setRunning(r => !r)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${running ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"}`}>
        {running ? "⏸ Pause" : "▶ Resume"}
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// LEAKY BUCKET
// ═════════════════════════════════════════════════════════
function LeakyBucketViz() {
  const [capacity, setCapacity] = useState(10);
  const [leakRate, setLeakRate] = useState(3);
  const [incomingRate, setIncomingRate] = useState(5);
  const [queueSize, setQueueSize] = useState(0);
  const [outputCount, setOutputCount] = useState(0);
  const [overflowCount, setOverflowCount] = useState(0);
  const [running, setRunning] = useState(true);
  const queueRef = useRef(0);
  queueRef.current = queueSize;

  // Incoming
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      if (queueRef.current < capacity) {
        setQueueSize(q => q + 1);
      } else {
        setOverflowCount(o => o + 1);
      }
    }, 1000 / incomingRate);
    return () => clearInterval(iv);
  }, [incomingRate, capacity, running]);

  // Leak
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setQueueSize(q => {
        if (q > 0) {
          setOutputCount(o => o + 1);
          return q - 1;
        }
        return 0;
      });
    }, 1000 / leakRate);
    return () => clearInterval(iv);
  }, [leakRate, running]);

  const fillPercent = (queueSize / capacity) * 100;
  const isOverloaded = fillPercent > 90;

  return (
    <div className="space-y-6">
      <div className="relative bg-black/30 rounded-2xl border border-white/10 p-6 min-h-[300px] flex items-center justify-center">
        {/* Incoming drops */}
        <div className="absolute left-8 top-8 text-center">
          <div className="text-xs text-zinc-500 mb-1">Incoming</div>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-2xl">💧</motion.div>
          <div className="text-xs font-mono text-blue-400 mt-1">{incomingRate}/sec</div>
        </div>

        {/* Bucket */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-zinc-400 mb-2 font-mono">QUEUE ({queueSize}/{capacity})</div>
          <div className={`w-36 h-48 rounded-b-3xl rounded-t-lg border-2 relative overflow-hidden bg-black/50 transition-colors ${
            isOverloaded ? "border-red-500/60" : "border-blue-500/40"
          }`}>
            <motion.div
              className={`absolute bottom-0 left-0 right-0 ${
                isOverloaded
                  ? "bg-gradient-to-t from-red-500/60 to-orange-500/30"
                  : "bg-gradient-to-t from-blue-500/60 to-cyan-500/20"
              }`}
              animate={{ height: `${fillPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
            {/* Water bubbles */}
            {Array.from({ length: Math.min(queueSize, 12) }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -3, 0], x: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 + Math.random(), delay: Math.random() }}
                className="absolute w-2 h-2 rounded-full bg-blue-300/60"
                style={{ bottom: `${(i / 12) * 80 + 5}%`, left: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>

          {/* Drip output */}
          <motion.div
            animate={{ opacity: queueSize > 0 ? [1, 0.3, 1] : 0.2 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="mt-1 text-lg"
          >💧</motion.div>
          <div className="text-xs font-mono text-emerald-400">↓ {leakRate}/sec (constant)</div>
        </div>

        {/* Output */}
        <div className="absolute right-8 bottom-8 text-center">
          <div className="text-2xl">🖥️</div>
          <div className="text-xs text-zinc-500 mt-1">Output</div>
        </div>

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <div className="absolute right-8 top-8 text-center">
            <div className="text-2xl">🚫</div>
            <div className="text-xs text-red-400 font-mono">{overflowCount} dropped</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Slider label="Bucket Capacity" value={capacity} onChange={setCapacity} min={3} max={20} unit=" req" />
        <Slider label="Leak Rate" value={leakRate} onChange={setLeakRate} min={1} max={10} unit="/sec" />
        <Slider label="Incoming Rate" value={incomingRate} onChange={setIncomingRate} min={1} max={15} unit="/sec" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Queue Size" value={queueSize} color="#60a5fa" />
        <MetricCard label="Processed" value={outputCount} color="#34d399" />
        <MetricCard label="Overflowed" value={overflowCount} color="#f87171" />
      </div>

      <button onClick={() => setRunning(r => !r)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${running ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"}`}>
        {running ? "⏸ Pause" : "▶ Resume"}
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// FIXED WINDOW COUNTER
// ═════════════════════════════════════════════════════════
function FixedWindowViz() {
  const [windowDuration, setWindowDuration] = useState(5);
  const [maxRequests, setMaxRequests] = useState(10);
  const [requestRate, setRequestRate] = useState(3);
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [totalAllowed, setTotalAllowed] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [windowNumber, setWindowNumber] = useState(1);
  const [running, setRunning] = useState(true);
  const [flashRed, setFlashRed] = useState(false);
  const countRef = useRef(0);
  countRef.current = count;

  // Timer countdown
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          setCount(0);
          countRef.current = 0;
          setWindowNumber(w => w + 1);
          return windowDuration;
        }
        return Math.max(0, t - 0.1);
      });
    }, 100);
    return () => clearInterval(iv);
  }, [windowDuration, running]);

  // Requests
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      if (countRef.current < maxRequests) {
        setCount(c => c + 1);
        countRef.current += 1;
        setTotalAllowed(a => a + 1);
      } else {
        setTotalRejected(r => r + 1);
        setFlashRed(true);
        setTimeout(() => setFlashRed(false), 200);
      }
    }, 1000 / requestRate);
    return () => clearInterval(iv);
  }, [requestRate, maxRequests, running]);

  const progress = ((windowDuration - timeLeft) / windowDuration) * 100;

  return (
    <div className="space-y-6">
      <div className={`relative bg-black/30 rounded-2xl border p-6 min-h-[240px] flex flex-col items-center justify-center transition-colors ${
        flashRed ? "border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "border-white/10"
      }`}>
        {/* Window info */}
        <div className="text-xs text-zinc-500 font-mono mb-2">WINDOW #{windowNumber}</div>

        {/* Timer bar */}
        <div className="w-full max-w-md h-10 bg-black/50 rounded-xl border border-white/10 relative overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600/60 to-purple-600/40 rounded-xl"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-white">
            {timeLeft.toFixed(1)}s remaining
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <motion.div
              key={count}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-bold font-mono ${count >= maxRequests ? "text-red-400" : "text-white"}`}
            >
              {count}
            </motion.div>
            <div className="text-xs text-zinc-500 mt-1">/ {maxRequests} max</div>
          </div>
        </div>

        {/* Edge burst warning */}
        {count >= maxRequests && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs"
          >
            ⚠️ Edge Burst Risk: Requests at boundary can cause 2x spike when window resets
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Slider label="Window Duration" value={windowDuration} onChange={v => { setWindowDuration(v); setTimeLeft(v); }} min={2} max={10} unit="s" />
        <Slider label="Max Requests" value={maxRequests} onChange={setMaxRequests} min={3} max={20} unit="" />
        <Slider label="Request Rate" value={requestRate} onChange={setRequestRate} min={1} max={10} unit="/sec" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Window Count" value={count} color="#818cf8" />
        <MetricCard label="Total Allowed" value={totalAllowed} color="#34d399" />
        <MetricCard label="Total Rejected" value={totalRejected} color="#f87171" />
      </div>

      <button onClick={() => setRunning(r => !r)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${running ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"}`}>
        {running ? "⏸ Pause" : "▶ Resume"}
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// SLIDING WINDOW COUNTER
// ═════════════════════════════════════════════════════════
function SlidingCounterViz() {
  const [windowSize, setWindowSize] = useState(5);
  const [maxRequests, setMaxRequests] = useState(10);
  const [requestRate, setRequestRate] = useState(4);
  const [prevCount, setPrevCount] = useState(0);
  const [currCount, setCurrCount] = useState(0);
  const [overlap, setOverlap] = useState(0.5);
  const [totalAllowed, setTotalAllowed] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [running, setRunning] = useState(true);

  const weightedCount = Math.floor(currCount + prevCount * overlap);

  // Simulate sliding overlap
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setOverlap(o => {
        const next = o - 0.02;
        if (next <= 0) {
          setPrevCount(currCount);
          setCurrCount(0);
          return 1;
        }
        return next;
      });
    }, windowSize * 20);
    return () => clearInterval(iv);
  }, [windowSize, currCount, running]);

  // Requests
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const weighted = Math.floor(currCount + prevCount * overlap);
      if (weighted < maxRequests) {
        setCurrCount(c => c + 1);
        setTotalAllowed(a => a + 1);
      } else {
        setTotalRejected(r => r + 1);
      }
    }, 1000 / requestRate);
    return () => clearInterval(iv);
  }, [requestRate, maxRequests, currCount, prevCount, overlap, running]);

  return (
    <div className="space-y-6">
      <div className="bg-black/30 rounded-2xl border border-white/10 p-6 min-h-[260px]">
        {/* Windows visualization */}
        <div className="flex items-center gap-4 mb-6">
          {/* Previous window */}
          <div className="flex-1">
            <div className="text-xs text-zinc-500 mb-1">Previous Window</div>
            <div className="h-16 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-purple-500/20"
                animate={{ width: `${overlap * 100}%` }}
                transition={{ duration: 0.1 }}
              />
              <span className="relative font-mono text-purple-400 text-lg font-bold">{prevCount}</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-1 font-mono">× {overlap.toFixed(2)} weight</div>
          </div>

          <div className="text-2xl text-zinc-600">+</div>

          {/* Current window */}
          <div className="flex-1">
            <div className="text-xs text-zinc-500 mb-1">Current Window</div>
            <div className="h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
              <span className="font-mono text-indigo-400 text-lg font-bold">{currCount}</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-1 font-mono">× 1.00 weight</div>
          </div>

          <div className="text-2xl text-zinc-600">=</div>

          {/* Result */}
          <div className="flex-1">
            <div className="text-xs text-zinc-500 mb-1">Weighted Total</div>
            <div className={`h-16 rounded-lg flex items-center justify-center border ${
              weightedCount >= maxRequests
                ? "bg-red-500/10 border-red-500/20"
                : "bg-emerald-500/10 border-emerald-500/20"
            }`}>
              <span className={`font-mono text-2xl font-bold ${
                weightedCount >= maxRequests ? "text-red-400" : "text-emerald-400"
              }`}>{weightedCount}</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-1 font-mono">/ {maxRequests} max</div>
          </div>
        </div>

        {/* Formula */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-center">
          <span className="text-zinc-500">count = </span>
          <span className="text-indigo-400">{currCount}</span>
          <span className="text-zinc-500"> + </span>
          <span className="text-purple-400">{prevCount}</span>
          <span className="text-zinc-500"> × </span>
          <span className="text-amber-400">{overlap.toFixed(2)}</span>
          <span className="text-zinc-500"> = </span>
          <span className={weightedCount >= maxRequests ? "text-red-400" : "text-emerald-400"}>{weightedCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Slider label="Window Size" value={windowSize} onChange={setWindowSize} min={2} max={10} unit="s" />
        <Slider label="Max Requests" value={maxRequests} onChange={setMaxRequests} min={3} max={20} unit="" />
        <Slider label="Request Rate" value={requestRate} onChange={setRequestRate} min={1} max={10} unit="/sec" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Weighted Count" value={weightedCount} color="#818cf8" />
        <MetricCard label="Allowed" value={totalAllowed} color="#34d399" />
        <MetricCard label="Rejected" value={totalRejected} color="#f87171" />
      </div>

      <button onClick={() => setRunning(r => !r)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${running ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"}`}>
        {running ? "⏸ Pause" : "▶ Resume"}
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// SLIDING WINDOW LOG
// ═════════════════════════════════════════════════════════
function SlidingLogViz() {
  const [windowDuration, setWindowDuration] = useState(5);
  const [maxRequests, setMaxRequests] = useState(8);
  const [requestRate, setRequestRate] = useState(3);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalAllowed, setTotalAllowed] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [running, setRunning] = useState(true);
  const nextId = useRef(0);

  // Cleanup old logs
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const cutoff = Date.now() - windowDuration * 1000;
      setLogs(l => l.filter(e => e.timestamp > cutoff));
    }, 200);
    return () => clearInterval(iv);
  }, [windowDuration, running]);

  // Incoming requests
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const now = Date.now();
      const cutoff = now - windowDuration * 1000;
      setLogs(prev => {
        const active = prev.filter(e => e.timestamp > cutoff && e.status === "allowed");
        if (active.length < maxRequests) {
          setTotalAllowed(a => a + 1);
          return [...prev, { id: nextId.current++, timestamp: now, status: "allowed" as const }].slice(-50);
        } else {
          setTotalRejected(r => r + 1);
          return [...prev, { id: nextId.current++, timestamp: now, status: "rejected" as const }].slice(-50);
        }
      });
    }, 1000 / requestRate);
    return () => clearInterval(iv);
  }, [requestRate, maxRequests, windowDuration, running]);

  const activeLogs = logs.filter(l => l.status === "allowed" && l.timestamp > Date.now() - windowDuration * 1000);
  const memoryBytes = logs.length * 16;

  return (
    <div className="space-y-6">
      <div className="bg-black/30 rounded-2xl border border-white/10 p-6 min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-zinc-400">Request Log <span className="text-zinc-600">({logs.length} entries)</span></div>
          <div className="text-xs font-mono text-amber-400">Memory: ~{memoryBytes} bytes</div>
        </div>

        {/* Log entries */}
        <div className="h-[220px] overflow-y-auto custom-scrollbar space-y-1 pr-2">
          <AnimatePresence>
            {[...logs].reverse().slice(0, 25).map(entry => {
              const age = (Date.now() - entry.timestamp) / 1000;
              const isExpiring = age > windowDuration * 0.8;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isExpiring ? 0.3 : 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono ${
                    entry.status === "allowed"
                      ? "bg-emerald-500/5 border border-emerald-500/10"
                      : "bg-red-500/5 border border-red-500/10"
                  }`}
                >
                  <span className="text-zinc-500">{new Date(entry.timestamp).toLocaleTimeString()}.{String(entry.timestamp % 1000).padStart(3, "0")}</span>
                  <span className={entry.status === "allowed" ? "text-emerald-400" : "text-red-400"}>
                    {entry.status === "allowed" ? "✓ ALLOWED" : "✕ REJECTED"}
                  </span>
                  <span className="text-zinc-600">{age.toFixed(1)}s ago</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Slider label="Window Duration" value={windowDuration} onChange={setWindowDuration} min={2} max={10} unit="s" />
        <Slider label="Max Requests" value={maxRequests} onChange={setMaxRequests} min={3} max={15} unit="" />
        <Slider label="Request Rate" value={requestRate} onChange={setRequestRate} min={1} max={8} unit="/sec" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Active Logs" value={activeLogs.length} color="#60a5fa" />
        <MetricCard label="Allowed" value={totalAllowed} color="#34d399" />
        <MetricCard label="Rejected" value={totalRejected} color="#f87171" />
        <MetricCard label="Memory" value={`${memoryBytes}B`} color="#fbbf24" />
      </div>

      <button onClick={() => setRunning(r => !r)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${running ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"}`}>
        {running ? "⏸ Pause" : "▶ Resume"}
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// COMPARISON TABLE
// ═════════════════════════════════════════════════════════
function ComparisonTable() {
  const algorithms = [
    { name: "Token Bucket", accuracy: 4, memory: "Low", burst: "Excellent", complexity: "O(1)", bestFor: "API Gateways, burst traffic" },
    { name: "Leaky Bucket", accuracy: 3, memory: "Low", burst: "Poor", complexity: "O(1)", bestFor: "Traffic shaping, constant output" },
    { name: "Fixed Window", accuracy: 2, memory: "Low", burst: "Poor", complexity: "O(1)", bestFor: "Simple counters, low precision" },
    { name: "Sliding Counter", accuracy: 4, memory: "Medium", burst: "Good", complexity: "O(1)", bestFor: "Balanced accuracy & memory" },
    { name: "Sliding Log", accuracy: 5, memory: "High", burst: "Excellent", complexity: "O(N)", bestFor: "High precision, audit trails" },
  ];

  const memColor: Record<string, string> = { Low: "text-emerald-400 bg-emerald-500/10", Medium: "text-amber-400 bg-amber-500/10", High: "text-red-400 bg-red-500/10" };
  const burstColor: Record<string, string> = { Excellent: "text-emerald-400", Good: "text-blue-400", Poor: "text-red-400" };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">Algorithm Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-zinc-400 font-medium">Algorithm</th>
              <th className="text-left p-3 text-zinc-400 font-medium">Accuracy</th>
              <th className="text-left p-3 text-zinc-400 font-medium">Memory</th>
              <th className="text-left p-3 text-zinc-400 font-medium">Burst</th>
              <th className="text-left p-3 text-zinc-400 font-medium">Complexity</th>
              <th className="text-left p-3 text-zinc-400 font-medium">Best For</th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((a, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-3 text-white font-medium">{a.name}</td>
                <td className="p-3"><span className="text-amber-400">{"★".repeat(a.accuracy)}{"☆".repeat(5 - a.accuracy)}</span></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${memColor[a.memory]}`}>{a.memory}</span></td>
                <td className={`p-3 ${burstColor[a.burst]}`}>{a.burst}</td>
                <td className="p-3 font-mono text-zinc-400">{a.complexity}</td>
                <td className="p-3 text-zinc-400 text-xs">{a.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// ARCHITECTURE DIAGRAM
// ═════════════════════════════════════════════════════════
function ArchitectureDiagram() {
  const nodes = [
    { label: "Client", icon: "💻", x: 0 },
    { label: "API Gateway", icon: "🌐", x: 1 },
    { label: "Rate Limiter", icon: "🚦", x: 2 },
    { label: "Redis", icon: "⚡", x: 2.5 },
    { label: "Load Balancer", icon: "⚖️", x: 3 },
    { label: "Services", icon: "🖥️", x: 4 },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Production Architecture</h3>
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, type: "spring" }}
              className="flex flex-col items-center p-4 bg-black/40 border border-white/10 rounded-xl min-w-[90px] hover:border-indigo-500/50 transition-colors"
            >
              <span className="text-2xl mb-2">{node.icon}</span>
              <span className="text-xs text-zinc-400 text-center">{node.label}</span>
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.15 + 0.1 }}
                className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════
export default function RateLimitingViz() {
  const [activeTab, setActiveTab] = useState<AlgoTab>("token-bucket");

  const vizMap: Record<AlgoTab, React.ReactNode> = {
    "token-bucket": <TokenBucketViz />,
    "leaky-bucket": <LeakyBucketViz />,
    "fixed-window": <FixedWindowViz />,
    "sliding-counter": <SlidingCounterViz />,
    "sliding-log": <SlidingLogViz />,
  };

  return (
    <div className="space-y-8">
      {/* Algorithm tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-indigo-500/20 border border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {vizMap[activeTab]}
        </motion.div>
      </AnimatePresence>

      {/* Architecture */}
      <ArchitectureDiagram />

      {/* Comparison */}
      <ComparisonTable />
    </div>
  );
}

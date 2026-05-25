"use client";

import { useMetricsStore } from "@/store/useMetricsStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";

export default function LiveMetricsPanel() {
  const { isOpen, togglePanel, metrics, history, updateMetrics } = useMetricsStore();

  useEffect(() => {
    const interval = setInterval(updateMetrics, 1500);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      
      {/* Toggle Button */}
      <button 
        onClick={togglePanel}
        className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0f] border border-white/10 rounded-full shadow-lg text-sm font-medium text-zinc-300 hover:text-white hover:border-primary/50 transition-colors mb-4"
      >
        <Activity size={16} className="text-primary" />
        {isOpen ? "Hide Live Metrics" : "Show Live Metrics"}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[800px] bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl origin-bottom-left grid grid-cols-4 gap-4"
          >
            <MetricCard title="QPS" value={Math.round(metrics.qps)} history={history.qps} suffix="req/s" color="#6366f1" />
            <MetricCard title="Throughput" value={metrics.throughputMB.toFixed(1)} history={history.throughputMB} suffix="MB/s" color="#06b6d4" />
            <MetricCard title="P99 Latency" value={Math.round(metrics.p99Latency)} history={history.p99Latency} suffix="ms" color="#f59e0b" inverted />
            <MetricCard title="Cache Hit %" value={metrics.cacheHitPercent.toFixed(1)} history={history.cacheHitPercent} suffix="%" color="#10b981" />
            <MetricCard title="Active Conns" value={Math.round(metrics.activeConnections)} history={history.activeConnections} color="#8b5cf6" />
            <MetricCard title="DB Load" value={metrics.dbLoadPercent.toFixed(1)} history={history.dbLoadPercent} suffix="%" color="#f43f5e" inverted />
            <MetricCard title="Queue Depth" value={Math.round(metrics.queueDepth)} history={history.queueDepth} color="#eab308" inverted />
            <MetricCard title="Error Rate" value={metrics.errorRatePercent.toFixed(2)} history={history.errorRatePercent} suffix="%" color="#ef4444" inverted />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ title, value, history, suffix = "", color, inverted = false }: { title: string, value: string | number, history: number[], suffix?: string, color: string, inverted?: boolean }) {
  // Calculate trend
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const diff = last - prev;
  
  let isGood = diff > 0;
  if (inverted) isGood = diff < 0;
  
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
  const trendColor = diff === 0 ? "text-zinc-500" : isGood ? "text-green-400" : "text-red-400";

  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
      <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{title}</div>
      <div className="flex items-end justify-between mb-4">
        <div className="text-2xl font-mono font-bold text-white flex items-baseline gap-1">
          {value} <span className="text-sm font-sans text-zinc-500 font-normal">{suffix}</span>
        </div>
        <div className={`text-xs font-bold ${trendColor}`}>{arrow}</div>
      </div>
      <div className="h-8 w-full mt-auto relative">
        <Sparkline data={history} color={color} />
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const min = Math.min(...data) * 0.9;
    const max = Math.max(...data) * 1.1;
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * rect.width;
      const y = rect.height - ((val - min) / range) * rect.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Fill gradient
    ctx.lineTo(rect.width, rect.height);
    ctx.lineTo(0, rect.height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
    grad.addColorStop(0, `${color}40`);
    grad.addColorStop(1, `${color}00`);
    ctx.fillStyle = grad;
    ctx.fill();
    
  }, [data, color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

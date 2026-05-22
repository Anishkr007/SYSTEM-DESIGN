"use client";

import { useState } from "react";
import AnimatedCounter from "../ui/AnimatedCounter";

export default function EnvelopeCalcViz() {
  const [inputs, setInputs] = useState({
    dau: 10_000_000,
    requestsPerUser: 5,
    sizePerRequestKB: 50,
    cacheHitRatio: 80,
  });

  // Calculations
  const dauNum = inputs.dau;
  const requestsPerDay = dauNum * inputs.requestsPerUser;
  const qps = Math.ceil(requestsPerDay / 86400);
  const peakQps = qps * 2;
  
  const dailyDataGB = (requestsPerDay * inputs.sizePerRequestKB) / (1024 * 1024);
  const bandwidthMbps = Math.ceil((dailyDataGB * 1024 * 8) / 86400);
  
  const storage1YearTB = Math.ceil((dailyDataGB * 365) / 1024);
  const storage5YearTB = storage1YearTB * 5;

  const cacheMemGB = Math.ceil((dailyDataGB * 0.2 * (inputs.cacheHitRatio / 100))); // 20% rule of thumb

  const formatNum = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl mx-auto p-6 bg-black/20 rounded-2xl border border-white/10">
      
      {/* Inputs Section */}
      <div className="flex-1 space-y-6 p-6 bg-white/5 rounded-xl border border-white/5">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>⚙️</span> Assumptions
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Daily Active Users (DAU)</label>
              <span className="text-sm font-mono text-primary">{formatNum(inputs.dau)}</span>
            </div>
            <input 
              type="range" min="100000" max="100000000" step="100000" 
              value={inputs.dau} 
              onChange={(e) => setInputs({...inputs, dau: Number(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Requests / User / Day</label>
              <span className="text-sm font-mono text-primary">{inputs.requestsPerUser}</span>
            </div>
            <input 
              type="range" min="1" max="100" step="1" 
              value={inputs.requestsPerUser} 
              onChange={(e) => setInputs({...inputs, requestsPerUser: Number(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Size per Request (KB)</label>
              <span className="text-sm font-mono text-primary">{inputs.sizePerRequestKB} KB</span>
            </div>
            <input 
              type="range" min="1" max="1000" step="10" 
              value={inputs.sizePerRequestKB} 
              onChange={(e) => setInputs({...inputs, sizePerRequestKB: Number(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Cache Hit Ratio (%)</label>
              <span className="text-sm font-mono text-primary">{inputs.cacheHitRatio}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5" 
              value={inputs.cacheHitRatio} 
              onChange={(e) => setInputs({...inputs, cacheHitRatio: Number(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Outputs Section */}
      <div className="flex-[1.5] grid grid-cols-2 gap-4">
        
        <div className="col-span-2 md:col-span-1 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="text-blue-400 text-sm font-medium mb-1">Avg QPS</div>
          <div className="text-3xl font-mono font-bold text-white">
            <AnimatedCounter value={qps} />
          </div>
          <div className="text-xs text-zinc-500 mt-2">req / second</div>
        </div>

        <div className="col-span-2 md:col-span-1 p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="text-red-400 text-sm font-medium mb-1">Peak QPS (2x)</div>
          <div className="text-3xl font-mono font-bold text-white">
            <AnimatedCounter value={peakQps} />
          </div>
          <div className="text-xs text-zinc-500 mt-2">req / second</div>
        </div>

        <div className="col-span-2 md:col-span-1 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="text-green-400 text-sm font-medium mb-1">Bandwidth</div>
          <div className="text-3xl font-mono font-bold text-white">
            <AnimatedCounter value={bandwidthMbps} /> <span className="text-xl">Mbps</span>
          </div>
          <div className="text-xs text-zinc-500 mt-2">Peak network load</div>
        </div>

        <div className="col-span-2 md:col-span-1 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="text-yellow-400 text-sm font-medium mb-1">Cache RAM</div>
          <div className="text-3xl font-mono font-bold text-white">
            <AnimatedCounter value={cacheMemGB} /> <span className="text-xl">GB</span>
          </div>
          <div className="text-xs text-zinc-500 mt-2">To cache 20% of daily reads</div>
        </div>

        <div className="col-span-2 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-purple-400 text-sm font-medium mb-1">Storage Capacity</div>
            <div className="text-xs text-zinc-500">Assuming no deletion</div>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <div className="text-sm text-zinc-400 mb-1">1 Year</div>
              <div className="text-2xl font-mono font-bold text-white">
                <AnimatedCounter value={storage1YearTB} /> TB
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-1">5 Years</div>
              <div className="text-2xl font-mono font-bold text-white">
                <AnimatedCounter value={storage5YearTB} /> TB
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

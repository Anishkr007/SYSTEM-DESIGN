"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConsistentHashingViz() {
  const [nodes, setNodes] = useState([0, 120, 240]); // degrees on the circle
  const [keys] = useState([30, 80, 150, 200, 280, 330]);
  const [radius] = useState(150);
  const center = 200;

  const addNode = () => {
    if (nodes.length >= 8) return;
    // Find biggest gap
    const sortedNodes = [...nodes].sort((a, b) => a - b);
    let maxGap = 0;
    let maxGapStart = 0;

    for (let i = 0; i < sortedNodes.length; i++) {
      const current = sortedNodes[i];
      const next = sortedNodes[(i + 1) % sortedNodes.length];
      let gap = next - current;
      if (gap < 0) gap += 360;
      
      if (gap > maxGap) {
        maxGap = gap;
        maxGapStart = current;
      }
    }

    const newNodePos = (maxGapStart + maxGap / 2) % 360;
    setNodes([...nodes, newNodePos]);
  };

  const removeNode = () => {
    if (nodes.length <= 1) return;
    setNodes(nodes.slice(0, -1));
  };

  // Find which node owns a key (first node clockwise)
  const getOwningNode = (keyPos: number) => {
    const sortedNodes = [...nodes].sort((a, b) => a - b);
    for (const node of sortedNodes) {
      if (keyPos <= node) return node;
    }
    return sortedNodes[0]; // Wrap around
  };

  const getCoordinates = (angle: number, offset: number = 0) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + (radius + offset) * Math.cos(rad),
      y: center + (radius + offset) * Math.sin(rad)
    };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 bg-black/20 rounded-2xl border border-white/10">
      
      <div className="flex gap-4 mb-8">
        <button onClick={addNode} disabled={nodes.length >= 8} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-neon-primary disabled:opacity-50">
          Add Server Node
        </button>
        <button onClick={removeNode} disabled={nodes.length <= 1} className="px-6 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50">
          Remove Server Node
        </button>
      </div>

      <div className="relative w-[400px] h-[400px]">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Base Ring */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          
          {/* Key assignments (Lines from key to node) */}
          <AnimatePresence>
            {keys.map((key, i) => {
              const owner = getOwningNode(key);
              const keyCoord = getCoordinates(key);
              const ownerCoord = getCoordinates(owner);
              
              // Draw arc from key to owner
              let diff = owner - key;
              if (diff < 0) diff += 360;
              
              return (
                <motion.path
                  key={`arc-${i}-${owner}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  d={`M ${keyCoord.x} ${keyCoord.y} A ${radius} ${radius} 0 ${diff > 180 ? 1 : 0} 1 ${ownerCoord.x} ${ownerCoord.y}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                />
              );
            })}
          </AnimatePresence>

          {/* Keys (Data) */}
          {keys.map((key, i) => {
            const coord = getCoordinates(key);
            return (
              <circle
                key={`key-${i}`}
                cx={coord.x}
                cy={coord.y}
                r="6"
                fill="#22c55e"
                className="shadow-[0_0_10px_#22c55e]"
              />
            );
          })}

          {/* Server Nodes */}
          <AnimatePresence>
            {nodes.map((node, i) => {
              const coord = getCoordinates(node, 10);
              return (
                <motion.g
                  key={`node-${node}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <rect
                    x={coord.x - 15}
                    y={coord.y - 15}
                    width="30"
                    height="30"
                    rx="4"
                    fill="#1e1b4b"
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                  <text x={coord.x} y={coord.y + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">S{i}</text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Legend */}
        <div className="absolute top-0 right-0 flex flex-col gap-2 bg-white/5 p-3 rounded-lg border border-white/10 text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-primary bg-[#1e1b4b]"></div>
            <span>Server Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Data Key</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-2xl text-zinc-400 text-sm">
        <p>Notice how adding or removing a server node only affects the keys in the adjacent arc. With traditional modulo hashing, almost all keys would need to be remapped.</p>
      </div>
    </div>
  );
}

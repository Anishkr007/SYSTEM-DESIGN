"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ArchPlayground() {
  const [nodes, setNodes] = useState<{id: string, type: string, x: number, y: number, label: string}[]>([
    { id: "1", type: "client", x: 100, y: 150, label: "Client" },
    { id: "2", type: "lb", x: 300, y: 150, label: "Load Balancer" },
    { id: "3", type: "server", x: 500, y: 100, label: "API Server" },
    { id: "4", type: "server", x: 500, y: 200, label: "API Server" },
    { id: "5", type: "db", x: 700, y: 150, label: "Primary DB" },
  ]);

  const [connections] = useState<{source: string, target: string}[]>([
    { source: "1", target: "2" },
    { source: "2", target: "3" },
    { source: "2", target: "4" },
    { source: "3", target: "5" },
    { source: "4", target: "5" },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);

  const nodeTypes = {
    client: { icon: "💻", color: "border-blue-500", bg: "bg-blue-500/10" },
    lb: { icon: "⚖️", color: "border-purple-500", bg: "bg-purple-500/10" },
    server: { icon: "🖥️", color: "border-green-500", bg: "bg-green-500/10" },
    db: { icon: "🗄️", color: "border-yellow-500", bg: "bg-yellow-500/10" },
    cache: { icon: "⚡", color: "border-red-500", bg: "bg-red-500/10" },
    queue: { icon: "📨", color: "border-cyan-500", bg: "bg-cyan-500/10" },
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }, id: string) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        return { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y };
      }
      return n;
    }));
  };

  return (
    <div className="w-full flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-black/20">
      
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
        <div className="flex gap-2">
          {Object.entries(nodeTypes).map(([type, config]) => (
            <div key={type} className={`px-3 py-1.5 rounded bg-black/40 border ${config.color} text-xs font-medium cursor-not-allowed opacity-50 flex items-center gap-2`} title="Drag & drop coming soon">
              <span>{config.icon}</span>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isSimulating 
              ? "bg-red-500/20 text-red-400 border border-red-500/50" 
              : "bg-primary text-white shadow-neon-primary"
          }`}
        >
          {isSimulating ? "Stop Simulation" : "Simulate Traffic"}
        </button>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[500px] overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-background to-background">
        
        {/* Grid Background */}
        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connections */}
        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
          {connections.map((conn, i) => {
            const sourceNode = nodes.find(n => n.id === conn.source);
            const targetNode = nodes.find(n => n.id === conn.target);
            
            if (!sourceNode || !targetNode) return null;
            
            // Adjust coordinates to point to center of nodes (assuming 80x80 node size)
            const sx = sourceNode.x + 40;
            const sy = sourceNode.y + 40;
            const tx = targetNode.x + 40;
            const ty = targetNode.y + 40;

            return (
              <g key={`conn-${i}`}>
                <path 
                  d={`M ${sx} ${sy} L ${tx} ${ty}`} 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="2" 
                  fill="none" 
                />
                
                {isSimulating && (
                  <>
                    {/* Flow animation */}
                    <circle r="4" fill="#06b6d4">
                      <animateMotion 
                        dur="2s" 
                        repeatCount="indefinite"
                        path={`M ${sx} ${sy} L ${tx} ${ty}`} 
                      />
                    </circle>
                    {/* Return flow animation */}
                    <circle r="3" fill="#6366f1">
                      <animateMotion 
                        dur="2s" 
                        repeatCount="indefinite"
                        begin="1s"
                        path={`M ${tx} ${ty} L ${sx} ${sy}`} 
                      />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const config = nodeTypes[node.type as keyof typeof nodeTypes];
          
          return (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => handleDragEnd(e, info, node.id)}
              className={`absolute w-20 h-20 rounded-xl border-2 ${config.color} ${config.bg} backdrop-blur-md flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10`}
              style={{ x: node.x, y: node.y }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl pointer-events-none">{config.icon}</span>
              <div className="absolute -bottom-8 bg-black/60 px-2 py-1 rounded text-xs text-white whitespace-nowrap border border-white/10 pointer-events-none">
                {node.label}
              </div>
            </motion.div>
          );
        })}
        
        {/* Overlay for beta notice */}
        <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 pointer-events-none">
          <span className="font-bold text-white">Interactive Sandbox:</span> Try dragging the nodes around!
        </div>
      </div>
    </div>
  );
}

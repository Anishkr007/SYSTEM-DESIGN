"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Zone = "CA" | "CP" | "AP" | null;

export default function CAPTheoremViz() {
  const [activeZone, setActiveZone] = useState<Zone>(null);

  const zoneContent = {
    CA: {
      title: "Consistency + Availability",
      description: "Systems that choose CA must sacrifice Partition Tolerance. In reality, since network partitions in distributed systems are inevitable, true CA systems don't exist in a distributed context. They are typically single-node relational databases.",
      examples: "PostgreSQL, MySQL, Oracle (single node)",
      color: "bg-blue-500",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/50"
    },
    CP: {
      title: "Consistency + Partition Tolerance",
      description: "When a partition occurs, the system halts operations (sacrifices Availability) to ensure all nodes maintain the exact same data state. Perfect for financial transactions where correctness is non-negotiable.",
      examples: "HBase, MongoDB, Redis, Zookeeper",
      color: "bg-purple-500",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/50"
    },
    AP: {
      title: "Availability + Partition Tolerance",
      description: "When a partition occurs, nodes continue to accept requests (sacrificing Consistency) meaning users might see stale data. The system will eventually become consistent once the partition heals.",
      examples: "Cassandra, DynamoDB, CouchDB",
      color: "bg-green-500",
      textColor: "text-green-400",
      borderColor: "border-green-500/50"
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-5xl mx-auto p-6 gap-12 bg-black/20 rounded-2xl border border-white/10">
      
      {/* Triangle Visualization */}
      <div className="relative w-80 h-80 flex-shrink-0">
        <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
          {/* Main Triangle */}
          <polygon 
            points="200,50 350,310 50,310" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="4" 
            strokeLinejoin="round"
          />
          
          {/* CA Zone (Top) */}
          <motion.path
            d="M 200,50 L 275,180 L 125,180 Z"
            fill={activeZone === "CA" ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.1)"}
            stroke={activeZone === "CA" ? "rgba(59, 130, 246, 0.8)" : "none"}
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveZone(activeZone === "CA" ? null : "CA")}
            whileHover={{ scale: 1.05, transformOrigin: "200px 150px" }}
            className="transition-colors duration-300"
          />
          <text x="200" y="140" textAnchor="middle" fill="white" className="font-bold text-xl pointer-events-none">CA</text>
          
          {/* AP Zone (Bottom Right) */}
          <motion.path
            d="M 275,180 L 350,310 L 200,310 Z"
            fill={activeZone === "AP" ? "rgba(34, 197, 94, 0.4)" : "rgba(34, 197, 94, 0.1)"}
            stroke={activeZone === "AP" ? "rgba(34, 197, 94, 0.8)" : "none"}
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveZone(activeZone === "AP" ? null : "AP")}
            whileHover={{ scale: 1.05, transformOrigin: "275px 260px" }}
            className="transition-colors duration-300"
          />
          <text x="275" y="270" textAnchor="middle" fill="white" className="font-bold text-xl pointer-events-none">AP</text>
          
          {/* CP Zone (Bottom Left) */}
          <motion.path
            d="M 125,180 L 200,310 L 50,310 Z"
            fill={activeZone === "CP" ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.1)"}
            stroke={activeZone === "CP" ? "rgba(168, 85, 247, 0.8)" : "none"}
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveZone(activeZone === "CP" ? null : "CP")}
            whileHover={{ scale: 1.05, transformOrigin: "125px 260px" }}
            className="transition-colors duration-300"
          />
          <text x="125" y="270" textAnchor="middle" fill="white" className="font-bold text-xl pointer-events-none">CP</text>

          {/* Labels */}
          <text x="200" y="30" textAnchor="middle" fill="#9ca3af" className="font-bold">CONSISTENCY</text>
          <text x="20" y="340" textAnchor="start" fill="#9ca3af" className="font-bold">PARTITION TOLERANCE</text>
          <text x="380" y="340" textAnchor="end" fill="#9ca3af" className="font-bold">AVAILABILITY</text>

          {/* Center pick 2 */}
          <circle cx="200" cy="220" r="35" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <text x="200" y="215" textAnchor="middle" fill="white" className="font-bold text-sm">PICK</text>
          <text x="200" y="235" textAnchor="middle" fill="white" className="font-bold text-xl">2</text>
        </svg>
      </div>

      {/* Details Panel */}
      <div className="flex-1 min-h-[250px]">
        {activeZone ? (
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-xl bg-white/5 border ${zoneContent[activeZone].borderColor} shadow-lg backdrop-blur-md h-full flex flex-col justify-center`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-md text-sm font-bold ${zoneContent[activeZone].color} text-white`}>
                {activeZone}
              </span>
              <h3 className={`text-xl font-bold ${zoneContent[activeZone].textColor}`}>
                {zoneContent[activeZone].title}
              </h3>
            </div>
            <p className="text-zinc-300 leading-relaxed mb-6">
              {zoneContent[activeZone].description}
            </p>
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Examples</span>
              <div className="flex gap-2">
                {zoneContent[activeZone].examples.split(', ').map(ex => (
                  <span key={ex} className="px-2 py-1 bg-white/10 rounded text-sm text-zinc-300">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 border border-white/5 border-dashed rounded-xl text-zinc-500">
            <span className="text-4xl mb-4">👆</span>
            <p className="text-center">Click any of the three zones on the triangle to explore the trade-offs.</p>
          </div>
        )}
      </div>

    </div>
  );
}

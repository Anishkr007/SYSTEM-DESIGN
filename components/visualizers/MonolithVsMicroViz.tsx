"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MonolithVsMicroViz() {
  const [isExploded, setIsExploded] = useState(false);

  const services = [
    { id: "ui", name: "UI Service", icon: "🖥️", color: "bg-blue-500", border: "border-blue-500", text: "text-blue-400" },
    { id: "api", name: "API Gateway", icon: "🚪", color: "bg-purple-500", border: "border-purple-500", text: "text-purple-400" },
    { id: "auth", name: "Auth Service", icon: "🔐", color: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-400" },
    { id: "db", name: "Database", icon: "🗄️", color: "bg-green-500", border: "border-green-500", text: "text-green-400" },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-6 bg-black/20 rounded-2xl border border-white/10">
      
      <div className="flex justify-center mb-12">
        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
            isExploded 
              ? "bg-secondary hover:bg-secondary/80 shadow-neon-secondary" 
              : "bg-primary hover:bg-primary/80 shadow-neon-primary"
          }`}
        >
          {isExploded ? "Assemble Monolith" : "Explode to Microservices"}
        </button>
      </div>

      <div className="relative w-full h-[500px] flex items-center justify-center">
        
        <AnimatePresence mode="wait">
          {!isExploded ? (
            <motion.div
              key="monolith"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-80 h-[400px] bg-white/5 border-2 border-white/20 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-md"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background px-4 font-bold text-zinc-300 border border-white/10 rounded-full">
                Monolithic App
              </div>
              
              <div className="flex-1 border border-white/10 rounded-xl bg-black/40 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                
                {/* Tightly coupled services inside monolith */}
                <div className="grid grid-cols-2 gap-4 w-full h-full relative z-10">
                  {services.map((svc) => (
                    <motion.div 
                      key={svc.id} 
                      layoutId={`svc-${svc.id}`}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border border-white/10 bg-white/5`}
                    >
                      <span className="text-3xl mb-2">{svc.icon}</span>
                      <span className="text-xs font-medium text-zinc-300 text-center">{svc.name}</span>
                    </motion.div>
                  ))}
                </div>
                
                {/* Visualizing tight coupling with intersecting lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
                  <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="25%" y1="25%" x2="75%" y2="25%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="25%" y1="75%" x2="75%" y2="75%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
              </div>

              <div className="mt-4 h-24 border border-green-500/30 rounded-xl bg-green-500/10 flex flex-col items-center justify-center relative">
                <span className="absolute -top-3 bg-background px-2 text-xs text-green-400">Shared DB</span>
                <span className="text-3xl">🛢️</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="microservices"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full max-w-3xl"
            >
              {/* Network / Service Mesh background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50 rounded-full blur-3xl"></div>
              
              {/* API Gateway */}
              <motion.div 
                layoutId={`svc-api`}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-white/5 border-2 border-purple-500/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)] z-20 backdrop-blur-md"
              >
                <span className="text-4xl mb-2">🚪</span>
                <span className="font-bold text-purple-400 text-center">API Gateway</span>
              </motion.div>

              {/* Connecting lines from API Gateway to Services */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  d="M 50% 120 Q 20% 200 20% 280" 
                  fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5 5" 
                />
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  d="M 50% 120 Q 50% 200 50% 280" 
                  fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5 5" 
                />
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  d="M 50% 120 Q 80% 200 80% 280" 
                  fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5 5" 
                />
              </svg>

              {/* UI Service */}
              <motion.div 
                layoutId={`svc-ui`}
                className="absolute top-[280px] left-[10%] w-48 h-32 bg-white/5 border-2 border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] z-20 backdrop-blur-md"
              >
                <span className="text-4xl mb-2">🖥️</span>
                <span className="font-bold text-blue-400 text-center">UI Service</span>
              </motion.div>

              {/* Auth Service */}
              <motion.div 
                layoutId={`svc-auth`}
                className="absolute top-[280px] left-1/2 -translate-x-1/2 w-48 h-32 bg-white/5 border-2 border-yellow-500/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] z-20 backdrop-blur-md"
              >
                <span className="text-4xl mb-2">🔐</span>
                <span className="font-bold text-yellow-400 text-center">Auth Service</span>
                <div className="absolute -bottom-8 bg-yellow-500/20 px-2 py-1 rounded text-xs text-yellow-300 border border-yellow-500/30">Redis Cache</div>
              </motion.div>

              {/* DB / User Service */}
              <motion.div 
                layoutId={`svc-db`}
                className="absolute top-[280px] right-[10%] w-48 h-32 bg-white/5 border-2 border-green-500/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)] z-20 backdrop-blur-md"
              >
                <span className="text-4xl mb-2">🗄️</span>
                <span className="font-bold text-green-400 text-center">Data Service</span>
                <div className="absolute -bottom-8 bg-green-500/20 px-2 py-1 rounded text-xs text-green-300 border border-green-500/30">PostgreSQL DB</div>
              </motion.div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-8 text-center max-w-2xl text-zinc-400 text-sm">
        <p>{isExploded 
          ? "In Microservices, each component is independently deployable, scales on its own, and manages its own database. Communication happens over network boundaries." 
          : "In a Monolith, all services share the same codebase, run in the same process, and share a single database. Communication is via fast in-memory function calls."}</p>
      </div>
    </div>
  );
}

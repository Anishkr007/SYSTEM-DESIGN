"use client";

import Link from "next/link";
import GlowCard from "@/components/ui/GlowCard";

export default function ArchitecturePlayground() {
  return (
    <section className="py-24 relative z-10 border-t border-white/10 bg-gradient-to-b from-transparent to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-xl">🛠️</span>
            <span className="text-sm font-medium text-zinc-300">Beta Feature</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Architecture Playground
          </h2>
          
          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
            Design, simulate, and analyze complete system architectures in an interactive drag-and-drop environment. Test your designs against simulated traffic loads.
          </p>
          
          <GlowCard className="p-8 md:p-12 mb-10 text-center flex flex-col items-center justify-center border-dashed border-2 bg-black/20" hoverEffect={false}>
            <div className="w-24 h-24 mb-6 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center text-4xl shadow-neon-primary animate-pulse-slow">
              🏗️
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Canvas Simulator</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Drag components like Load Balancers, API Gateways, Microservices, and Databases to build your system topology.
            </p>
            <Link 
              href="/playground" 
              className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-neon-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center gap-2"
            >
              Launch Playground
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </Link>
          </GlowCard>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium text-white">Live Traffic Simulation</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-white">Bottleneck Analysis</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">💾</div>
              <div className="font-medium text-white">Export Diagrams</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">🧩</div>
              <div className="font-medium text-white">30+ Components</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

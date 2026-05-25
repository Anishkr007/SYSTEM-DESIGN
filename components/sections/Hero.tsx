"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// Dynamic import for Three.js components to avoid SSR issues
const HeroCanvas = dynamic(() => import("@/components/3d/HeroCanvas"), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-background/50 flex items-center justify-center">Loading 3D Engine...</div>
});

export default function Hero() {
  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center pt-8 pb-16 lg:py-0 overflow-hidden">
      {/* Background 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <HeroCanvas />
      </div>

      {/* Foreground Content */}
      <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="flex flex-col items-start max-w-2xl"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-mono text-zinc-300">v2.0 — AI-Powered Learning Platform</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-[1.1]">
              <span className="block text-gradient">SYSTEM DESIGN</span>
              <span className="block text-zinc-300 text-4xl md:text-6xl mt-2">BY ANISH</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-400 mb-8 max-w-xl leading-relaxed">
              Interactive visual learning platform for mastering scalable distributed systems. 
              Understand complex architectures through 3D visualization and simulation.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="#topics" 
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-neon-primary hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] text-center"
              >
                Explore Topics
              </Link>
              <Link 
                href="/playground" 
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors text-center backdrop-blur-md"
              >
                Architecture Playground
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8 w-full">
              <div>
                <div className="text-3xl font-bold text-white mb-1 font-mono">
                  <AnimatedCounter value={37} />
                </div>
                <div className="text-sm text-zinc-500 font-medium">Topics</div>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div>
                <div className="text-3xl font-bold text-white mb-1 font-mono">
                  <AnimatedCounter value={39} />
                </div>
                <div className="text-sm text-zinc-500 font-medium">Visualizers</div>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
              <div className="hidden sm:block">
                <div className="text-3xl font-bold text-white mb-1 font-mono">AI</div>
                <div className="text-sm text-zinc-500 font-medium">Powered</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Scroll</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 border-2 border-zinc-600 rounded-full flex justify-center p-1"
        >
          <div className="w-1 h-2 bg-primary rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { topics } from "@/data/topics";
import GlowCard from "@/components/ui/GlowCard";
import NeonBadge from "@/components/ui/NeonBadge";
import Link from "next/link";
import { SidebarCategory } from "@/types";

const filters: { label: string; value: SidebarCategory | "all" }[] = [
  { label: "All Topics", value: "all" },
  { label: "Basics", value: "basics" },
  { label: "Database", value: "database" },
  { label: "Load Balancing", value: "load-balancing" },
  { label: "Microservices", value: "microservices" },
  { label: "Distributed Systems", value: "distributed-systems" },
];

export default function TopicsGrid() {
  const [activeFilter, setActiveFilter] = useState<SidebarCategory | "all">("all");

  const filteredTopics = topics.filter(
    (topic) => activeFilter === "all" || topic.category === activeFilter
  );

  return (
    <section id="topics" className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">All Topics</h2>
              <NeonBadge variant="secondary" className="ml-2 font-mono">{topics.length}</NeonBadge>
            </div>
            <p className="text-zinc-400 max-w-xl">
              Master the core concepts of system design through interactive visualizations and real-world examples.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.value
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20"
                    : "bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTopics.map((topic) => (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Link href={`/topics/${topic.slug}`} className="block h-full">
                  <GlowCard className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                        {topic.emoji}
                      </div>
                      <NeonBadge 
                        variant={
                          topic.difficulty === "beginner" ? "success" : 
                          topic.difficulty === "intermediate" ? "warning" : "danger"
                        }
                      >
                        {topic.difficulty}
                      </NeonBadge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                    
                    <p className="text-sm text-zinc-400 mb-6 flex-grow line-clamp-2">
                      {topic.summary}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary group-hover:text-white transition-colors flex items-center gap-1">
                        Explore Topic
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                      
                      {topic.visualizerType !== 'none' && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                          Visualizer
                        </div>
                      )}
                    </div>
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredTopics.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl border-dashed"
          >
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white mb-2">No topics found</h3>
            <p className="text-zinc-500">More topics are being added for this category soon.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

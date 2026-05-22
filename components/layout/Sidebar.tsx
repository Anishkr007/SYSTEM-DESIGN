"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/store/useSidebarStore";
import { sidebarSections } from "@/data/topics";
import { cn } from "@/lib/cn";
import { useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { 
    isOpen, 
    toggleCategory, 
    isCategoryExpanded, 
    setSidebarOpen 
  } = useSidebarStore();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  const totalTopics = sidebarSections.reduce((acc, section) => acc + section.topics.length, 0);
  const learnedTopics = 2; // Mock progress

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed inset-y-0 left-0 z-40 pt-16 w-[260px] glass bg-background/95 lg:relative lg:pt-0 lg:flex-shrink-0 flex flex-col border-r border-border h-full lg:h-[calc(100vh-4rem)]"
          )}
        >
          <div className="p-4 border-b border-border">
            <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Progress</div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{learnedTopics} / {totalTopics} topics</span>
              <span className="text-primary font-medium">{Math.round((learnedTopics/totalTopics)*100)}%</span>
            </div>
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out" 
                style={{ width: `${(learnedTopics/totalTopics)*100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {sidebarSections.map((section) => {
              const expanded = isCategoryExpanded(section.id);
              return (
                <div key={section.id} className="mb-1">
                  <button
                    onClick={() => toggleCategory(section.id)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-surface-hover text-sm font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{section.icon}</span>
                      <span>{section.label}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        "text-zinc-500 transition-transform duration-200",
                        expanded ? "rotate-90" : ""
                      )}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && section.topics.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col py-1 pl-10 pr-4">
                          {section.topics.map((topic) => {
                            const isActive = pathname === `/topics/${topic.slug}`;
                            return (
                              <Link
                                key={topic.slug}
                                href={`/topics/${topic.slug}`}
                                className={cn(
                                  "py-1.5 px-3 rounded-md text-sm transition-all duration-200 flex items-center gap-2 border-l-2",
                                  isActive
                                    ? "bg-primary/10 border-primary text-white shadow-[inset_2px_0_10px_rgba(99,102,241,0.1)]"
                                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-surface-hover"
                                )}
                              >
                                <span>{topic.emoji}</span>
                                <span className="truncate">{topic.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {expanded && section.topics.length === 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-11 py-1 text-xs text-zinc-500 italic"
                    >
                      Coming soon...
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

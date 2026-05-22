"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebarStore } from "@/store/useSidebarStore";
import { cn } from "@/lib/cn";

const links = [
  { name: "Home", href: "/" },
  { name: "Topics", href: "/topics/back-of-envelope-calculation" },
  { name: "Architecture Visualizer", href: "/playground" },
  { name: "Notes", href: "#" },
  { name: "About", href: "#" },
];

export default function Navbar() {
  const pathname = usePathname();
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 lg:hidden rounded-md hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <span className="text-primary font-bold">SD</span>
            </div>
            <span className="hidden sm:inline-block">System Design</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith('/topics') && link.href.includes('/topics'));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-white" : "text-zinc-400"
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white">
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

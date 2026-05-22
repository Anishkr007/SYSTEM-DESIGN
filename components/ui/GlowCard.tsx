"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function GlowCard({ children, className, onClick, hoverEffect = true }: GlowCardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl overflow-hidden group text-left",
        hoverEffect && "cursor-pointer",
        className
      )}
      whileHover={hoverEffect ? { y: -4 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={cn(
        "absolute -inset-[1px] rounded-xl border border-transparent z-[-1] transition-all duration-500",
        hoverEffect && "group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
      )} />
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </Component>
  );
}

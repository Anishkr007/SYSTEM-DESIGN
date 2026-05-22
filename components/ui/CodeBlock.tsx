"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export default function CodeBlock({ code, language = "typescript", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg overflow-hidden border border-white/10 bg-[#0d0d12]", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-zinc-400">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 p-1 rounded hover:bg-white/10"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre font-[family-name:var(--font-geist-mono)]">
        {code}
      </div>
    </div>
  );
}

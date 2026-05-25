"use client";

import { useState, useEffect, useRef } from "react";

export default function KafkaClusterViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setMessages] = useState<{x: number, y: number, color: string, id: number}[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simplified canvas animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Brokers
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      
      // Broker 1
      ctx.beginPath(); ctx.roundRect(150, 50, 100, 200, 10); ctx.fill(); ctx.stroke();
      // Broker 2
      ctx.beginPath(); ctx.roundRect(350, 50, 100, 200, 10); ctx.fill(); ctx.stroke();
      
      // Partitions inside brokers
      ctx.fillStyle = "rgba(168, 85, 247, 0.5)"; // Leader P0
      ctx.fillRect(160, 60, 80, 40);
      ctx.fillStyle = "rgba(6, 182, 212, 0.5)"; // Leader P1
      ctx.fillRect(360, 120, 80, 40);

      // Add messages
      if (frame % 30 === 0) {
        setMessages(prev => [...prev, {
          x: 50, 
          y: Math.random() > 0.5 ? 80 : 140, 
          color: Math.random() > 0.5 ? "#a855f7" : "#06b6d4",
          id: Date.now()
        }]);
      }

      // Draw and move messages
      setMessages(prev => prev.map(m => {
        const targetX = m.color === "#a855f7" ? 160 : 360;
        if (m.x < targetX) m.x += 3;
        
        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        return m;
      }).filter(m => m.x < 360)); // Remove when they reach broker 2 for simplicity

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-white font-bold tracking-wider">KAFKA CLUSTER SIMULATOR</h3>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${isPlaying ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"}`}
        >
          {isPlaying ? "Stop Producer" : "Start Producer"}
        </button>
      </div>
      
      <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background flex items-center justify-center">
        
        {/* We use a mix of DOM elements for labels and Canvas for particles for performance */}
        <canvas ref={canvasRef} width={600} height={300} className="absolute inset-0 m-auto" />
        
        {/* Overlays */}
        <div className="absolute w-[600px] h-[300px] pointer-events-none">
          <div className="absolute left-0 top-[70px] text-zinc-400 text-xs font-bold uppercase">Producer</div>
          <div className="absolute left-0 top-[130px] text-zinc-400 text-xs font-bold uppercase">Producer</div>
          
          <div className="absolute left-[150px] -top-6 text-white text-sm font-bold">Broker 0</div>
          <div className="absolute left-[350px] -top-6 text-white text-sm font-bold">Broker 1</div>

          <div className="absolute right-0 top-[100px] bg-white/5 border border-white/20 p-2 rounded-lg backdrop-blur-md">
            <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Consumer Group A</div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center text-xs text-purple-300">C1</div>
              <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center text-xs text-cyan-300">C2</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

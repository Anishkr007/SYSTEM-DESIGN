"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

type NodeId = 'alice' | 'bob' | 'chat' | 'presence' | 'media' | 'queue' | 'db';

interface NodeDef {
  x: number;
  y: number;
  label: string;
  icon: string;
}

type Message = {
  id: string;
  type: 'text' | 'image';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  text?: string;
};

type Packet = {
  id: string;
  from: NodeId;
  to: NodeId;
  color: string;
  label: string;
  duration: number;
};

const nodes: Record<NodeId, NodeDef> = {
  alice: { x: 30, y: 50, label: 'Alice (Client)', icon: '👩' },
  bob: { x: 70, y: 50, label: 'Bob (Client)', icon: '👨' },
  chat: { x: 50, y: 50, label: 'Chat Servers', icon: '🖥️' },
  presence: { x: 50, y: 15, label: 'Presence', icon: '🟢' },
  media: { x: 50, y: 85, label: 'Media Store', icon: '🗄️' },
  queue: { x: 38, y: 25, label: 'Message Queue', icon: '✉️' },
  db: { x: 38, y: 75, label: 'Cassandra DB', icon: '💽' },
};

const connections: [NodeId, NodeId][] = [
  ['alice', 'chat'],
  ['bob', 'chat'],
  ['chat', 'presence'],
  ['chat', 'queue'],
  ['chat', 'db'],
  ['alice', 'media'],
  ['bob', 'presence'],
  ['bob', 'media'],
];

const randomTexts = [
  "Hey Bob, how's it going?",
  "System design is awesome!",
  "Is the database scaling?",
  "Cassandra reads are fast!",
  "Low latency achieved 🚀",
  "Sending a test packet..."
];

export default function DesignWhatsAppViz() {
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  // State
  const [messagesState, setMessagesState] = useState<Message[]>([
    { id: 'initial', type: 'text', status: 'read', text: 'Hey Bob! 👋' }
  ]);
  const messagesRef = useRef<Message[]>(messagesState);

  const [queueSizeState, setQueueSizeState] = useState(0);
  const queueSizeRef = useRef(0);

  const [bobOnlineState, setBobOnlineState] = useState(true);
  const bobOnlineRef = useRef(true);

  const [packetsState, setPacketsState] = useState<Packet[]>([]);
  const packetsRef = useRef<Packet[]>([]);
  const [renderTick, setRenderTick] = useState(0);

  const isProcessingQueue = useRef(false);

  // Setters that also update refs
  const setMessages = (updater: (prev: Message[]) => Message[]) => {
    const newVal = updater(messagesRef.current);
    messagesRef.current = newVal;
    setMessagesState(newVal);
  };

  const setQueueSize = (updater: (prev: number) => number) => {
    const newVal = updater(queueSizeRef.current);
    queueSizeRef.current = newVal;
    setQueueSizeState(newVal);
  };

  const setBobOnline = (val: boolean) => {
    bobOnlineRef.current = val;
    setBobOnlineState(val);
  };

  const addMsg = (type: 'text' | 'image', text?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages(prev => [...prev, { id, type, status: 'sending', text }]);
    return id;
  };

  const updateMsgStatus = (id: string, status: 'sent' | 'delivered' | 'read') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const addPacket = async (from: NodeId, to: NodeId, color: string, label: string, duration = 800) => {
    if (!isMounted.current) return;
    const id = Math.random().toString(36).substring(2, 9);
    const packet = { id, from, to, color, label, duration };
    
    packetsRef.current.push(packet);
    setRenderTick(t => t + 1);
    
    await new Promise(r => setTimeout(r, duration));
    
    if (!isMounted.current) return;
    packetsRef.current = packetsRef.current.filter(p => p.id !== id);
    setRenderTick(t => t + 1);
  };

  const processQueue = async () => {
    if (isProcessingQueue.current) return;
    isProcessingQueue.current = true;
    
    try {
      while (bobOnlineRef.current && isMounted.current) {
        if (queueSizeRef.current <= 0) break;
        
        const msg = messagesRef.current.find(m => m.status === 'sent');
        if (!msg) break;

        setQueueSize(s => Math.max(0, s - 1));
        
        await addPacket('queue', 'chat', '#a855f7', 'Pop', 600);
        await addPacket('chat', 'bob', '#0ea5e9', 'Deliver', 600);
        
        if (msg.type === 'image') {
          await addPacket('bob', 'media', '#ec4899', 'Fetch', 600);
          await addPacket('media', 'bob', '#ec4899', 'Image', 600);
        }
        
        updateMsgStatus(msg.id, 'delivered');
        await addPacket('bob', 'chat', '#22c55e', 'ACK Deliver', 500);
        await addPacket('chat', 'alice', '#22c55e', 'ACK Deliver', 500);
        
        await new Promise(r => setTimeout(r, 300));
        
        await addPacket('bob', 'chat', '#3b82f6', 'Read', 500);
        await addPacket('chat', 'alice', '#3b82f6', 'Read', 500);
        updateMsgStatus(msg.id, 'read');
      }
    } finally {
      isProcessingQueue.current = false;
    }
  };

  const sendTextMessage = async () => {
    const text = randomTexts[Math.floor(Math.random() * randomTexts.length)];
    const msgId = addMsg('text', text);
    
    await addPacket('alice', 'chat', '#0ea5e9', 'Msg', 800);
    
    addPacket('chat', 'db', '#eab308', 'Save', 800);
    await addPacket('chat', 'queue', '#a855f7', 'Enqueue', 800);
    
    updateMsgStatus(msgId, 'sent');
    setQueueSize(s => s + 1);
    
    processQueue();
  };

  const sendImageMessage = async () => {
    const msgId = addMsg('image');
    
    await addPacket('alice', 'media', '#ec4899', 'Upload', 1000);
    await addPacket('media', 'alice', '#ec4899', 'URL', 800);
    
    await addPacket('alice', 'chat', '#0ea5e9', 'Msg(URL)', 800);
    
    addPacket('chat', 'db', '#eab308', 'Save', 800);
    await addPacket('chat', 'queue', '#a855f7', 'Enqueue', 800);
    
    updateMsgStatus(msgId, 'sent');
    setQueueSize(s => s + 1);
    
    processQueue();
  };

  const toggleBob = async () => {
    const isOnline = !bobOnlineRef.current;
    setBobOnline(isOnline);
    
    if (isOnline) {
      await addPacket('bob', 'presence', '#10b981', 'Online', 600);
      await addPacket('presence', 'chat', '#10b981', 'Broadcast', 600);
      await addPacket('chat', 'alice', '#10b981', 'Bob Online', 600);
      processQueue();
    } else {
      await addPacket('bob', 'presence', '#ef4444', 'Offline', 600);
      await addPacket('presence', 'chat', '#ef4444', 'Broadcast', 600);
      await addPacket('chat', 'alice', '#ef4444', 'Bob Offline', 600);
    }
  };

  return (
    <div className="relative w-full h-[800px] bg-slate-950 text-white overflow-hidden rounded-xl border border-cyan-900/50 font-sans shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">WhatsApp Architecture</h1>
        <p className="text-slate-400 text-xs mt-1 w-72 leading-relaxed">
          Interactive visualization of 1-on-1 chat, presence tracking, media upload, and message queuing.
        </p>
      </div>

      {/* Metrics Panel */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-6 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 shadow-xl z-30">
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Messages Sent</span>
            <span className="text-lg font-bold text-cyan-400">{messagesState.length}</span>
         </div>
         <div className="w-px bg-slate-700"></div>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Queue Size</span>
            <span className="text-lg font-bold text-purple-400">{queueSizeState}</span>
         </div>
         <div className="w-px bg-slate-700"></div>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Bob Status</span>
            <span className={`text-lg font-bold ${bobOnlineState ? 'text-green-400' : 'text-red-400'}`}>
               {bobOnlineState ? 'ONLINE' : 'OFFLINE'}
            </span>
         </div>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {connections.map(([a, b], i) => {
          const nodeA = nodes[a];
          const nodeB = nodes[b];
          return (
            <line
              key={i}
              x1={`${nodeA.x}%`}
              y1={`${nodeA.y}%`}
              x2={`${nodeB.x}%`}
              y2={`${nodeB.y}%`}
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth="2"
              strokeDasharray="5 5"
              filter="url(#glow)"
            />
          );
        })}
      </svg>

      {/* Network Nodes */}
      {Object.entries(nodes).map(([id, node]) => (
        <div
          key={id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-24 h-24 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-[0_0_20px_rgba(0,255,255,0.05)] z-10"
        >
          <div className="text-3xl mb-1 drop-shadow-md">{node.icon}</div>
          <div className="text-[10px] font-semibold text-cyan-100 text-center uppercase tracking-wider">{node.label}</div>
          
          {/* Queue Size Indicator */}
          {id === 'queue' && queueSizeState > 0 && (
             <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_#9333ea] border border-purple-400">
               {queueSizeState}
             </div>
          )}
        </div>
      ))}

      {/* Animated Packets */}
      {packetsRef.current.map(packet => {
        const fromNode = nodes[packet.from];
        const toNode = nodes[packet.to];
        return (
          <motion.div
            key={packet.id}
            initial={{ left: `${fromNode.x}%`, top: `${fromNode.y}%`, x: '-50%', y: '-50%' }}
            animate={{ left: `${toNode.x}%`, top: `${toNode.y}%`, x: '-50%', y: '-50%' }}
            transition={{ duration: packet.duration / 1000, ease: 'linear' }}
            className="absolute w-3 h-3 rounded-full z-20 flex items-center justify-center"
            style={{ 
              backgroundColor: packet.color, 
              boxShadow: `0 0 12px 2px ${packet.color}`
            }}
          >
            <span className="absolute -top-5 text-[10px] whitespace-nowrap font-bold bg-slate-900/50 px-1 rounded backdrop-blur-sm" style={{ color: packet.color }}>
              {packet.label}
            </span>
          </motion.div>
        );
      })}

      {/* Alice Phone */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-56 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl z-30 ring-4 ring-slate-950 h-[400px]">
        <div className="bg-slate-800/80 text-xs font-bold px-4 py-3 flex items-center gap-2 text-slate-200 border-b border-slate-700/50">
           <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
           Alice
        </div>
        <div className="flex-1 p-3 overflow-y-auto bg-slate-900/50 custom-scrollbar">
           <div className="flex flex-col gap-3 min-h-full justify-end">
              {messagesState.map(m => (
                 <div key={m.id} className="bg-cyan-900/40 border border-cyan-700/30 text-cyan-100 text-[10px] sm:text-xs p-2 rounded-xl rounded-tr-sm self-end max-w-[85%] relative shadow-sm">
                    {m.type === 'image' ? (
                       <div className="flex flex-col gap-1">
                          <div className="w-full h-16 bg-slate-800 rounded flex items-center justify-center text-xl border border-slate-700">📸</div>
                          <span>Image sent</span>
                       </div>
                    ) : m.text}
                    <div className="text-[10px] text-right mt-1 opacity-70 flex justify-end tracking-tighter">
                       {m.status === 'sending' && <span className="text-slate-400">🕒</span>}
                       {m.status === 'sent' && <span className="text-slate-300">✓</span>}
                       {m.status === 'delivered' && <span className="text-slate-300">✓✓</span>}
                       {m.status === 'read' && <span className="text-blue-400 font-bold">✓✓</span>}
                    </div>
                 </div>
              ))}
           </div>
        </div>
        <div className="bg-slate-800/80 p-3 flex gap-2 border-t border-slate-700/50">
           <button onClick={sendTextMessage} className="flex-1 bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs rounded-lg py-2 transition-colors border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-semibold active:scale-95">Text</button>
           <button onClick={sendImageMessage} className="flex-1 bg-pink-600/80 hover:bg-pink-500 text-white text-xs rounded-lg py-2 transition-colors border border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.3)] font-semibold active:scale-95">Image</button>
        </div>
      </div>

      {/* Bob Phone */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-56 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl z-30 ring-4 ring-slate-950 h-[400px]">
        <div className="bg-slate-800/80 text-xs font-bold px-4 py-3 flex justify-between items-center text-slate-200 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${bobOnlineState ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></span>
            Bob
          </div>
          <button 
            onClick={toggleBob} 
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all border active:scale-95 ${
              bobOnlineState ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
            }`}
          >
             {bobOnlineState ? 'Online' : 'Offline'}
          </button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto bg-slate-900/50 custom-scrollbar relative">
           {/* If offline, show a prominent overlay warning */}
           {!bobOnlineState && (
              <div className="absolute inset-0 bg-red-900/10 z-10 flex items-center justify-center pointer-events-none">
                 <div className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    CONNECTION LOST
                 </div>
              </div>
           )}
           <div className="flex flex-col gap-3 min-h-full justify-end">
              {messagesState.filter(m => m.status === 'delivered' || m.status === 'read').map(m => (
                 <div key={m.id} className="bg-slate-800/80 border border-slate-600/50 text-slate-200 text-[10px] sm:text-xs p-2 rounded-xl rounded-tl-sm self-start max-w-[85%] shadow-sm">
                    {m.type === 'image' ? (
                       <div className="flex flex-col gap-1">
                          <div className="w-full h-16 bg-slate-700 rounded flex items-center justify-center text-xl border border-slate-600">🖼️</div>
                          <span>Image received</span>
                       </div>
                    ) : m.text}
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Footer Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-lg">
          💡 Try toggling Bob offline and send a few messages to see the queue in action!
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}

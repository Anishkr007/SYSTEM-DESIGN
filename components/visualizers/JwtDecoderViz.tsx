"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function JwtDecoderViz() {
  const [role, setRole] = useState("user");
  const [isTampered, setIsTampered] = useState(false);
  
  const header = `{"alg": "HS256", "typ": "JWT"}`;
  const payloadStr = `{\n  "sub": "user123",\n  "role": "${role}",\n  "iat": 1704153600,\n  "exp": 1735689600\n}`;
  const signatureValid = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  const signatureInvalid = "TAMPERED_INVALID_SIGNATURE_8fwpMeJf36POk6";

  const handleTamper = () => {
    setRole("ADMIN"); // Hacker modifies payload
    setIsTampered(true); // Signature breaks because secret is unknown
  };

  const reset = () => {
    setRole("user");
    setIsTampered(false);
  };

  return (
    <div className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
      
      {/* Left side: JWT String */}
      <div className="flex-1 flex flex-col gap-2 font-mono text-sm break-all">
        <h4 className="text-zinc-400 font-bold uppercase text-xs tracking-wider mb-2 font-sans">Encoded Token</h4>
        <div className="bg-black/50 p-4 rounded-xl border border-white/5 leading-relaxed">
          <span className="text-red-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>
          <span className="text-white">.</span>
          <motion.span animate={{ color: isTampered ? "#fcd34d" : "#38bdf8" }} className="text-sky-400">
            {isTampered ? "eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6IkFETUlOIn0" : "eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6InVzZXIifQ"}
          </motion.span>
          <span className="text-white">.</span>
          <motion.span animate={{ color: isTampered ? "#ef4444" : "#a855f7" }} className="text-purple-400">
            {isTampered ? signatureInvalid : signatureValid}
          </motion.span>
        </div>
        
        <div className="mt-8 flex gap-4">
          <button onClick={handleTamper} disabled={isTampered} className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-500/30 disabled:opacity-50 font-sans">
            Tamper Payload to &quot;ADMIN&quot;
          </button>
          {isTampered && (
             <button onClick={reset} className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 font-sans">
               Reset
             </button>
          )}
        </div>
      </div>

      {/* Right side: Decoded */}
      <div className="flex-1 flex flex-col gap-4 font-mono text-sm">
        <h4 className="text-zinc-400 font-bold uppercase text-xs tracking-wider mb-2 font-sans">Decoded Context</h4>
        
        <div className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg">
          <div className="text-red-400 text-xs font-bold mb-1 font-sans">HEADER: ALGORITHM & TOKEN TYPE</div>
          <div className="text-white">{header}</div>
        </div>

        <motion.div animate={{ backgroundColor: isTampered ? "rgba(252,211,77,0.1)" : "rgba(56,189,248,0.1)", borderLeftColor: isTampered ? "#fcd34d" : "#38bdf8" }} className="border-l-4 p-3 rounded-r-lg">
          <div className="text-xs font-bold mb-1 font-sans" style={{ color: isTampered ? "#fcd34d" : "#38bdf8" }}>PAYLOAD: DATA</div>
          <pre className="text-white whitespace-pre-wrap">{payloadStr}</pre>
        </motion.div>

        <motion.div animate={{ backgroundColor: isTampered ? "rgba(239,68,68,0.1)" : "rgba(168,85,247,0.1)", borderLeftColor: isTampered ? "#ef4444" : "#a855f7" }} className="border-l-4 p-3 rounded-r-lg">
          <div className="text-xs font-bold mb-1 font-sans" style={{ color: isTampered ? "#ef4444" : "#a855f7" }}>VERIFY SIGNATURE</div>
          <div className="text-zinc-400 text-xs mb-2 break-normal">HMACSHA256(base64UrlEncode(header) + &quot;.&quot; + base64UrlEncode(payload), secret)</div>
          {isTampered ? (
            <div className="text-red-500 font-bold font-sans bg-red-500/20 px-2 py-1 rounded inline-block">❌ Signature Invalid! Token Rejected</div>
          ) : (
            <div className="text-green-400 font-bold font-sans bg-green-500/20 px-2 py-1 rounded inline-block">✓ Signature Valid</div>
          )}
        </motion.div>

      </div>

    </div>
  );
}

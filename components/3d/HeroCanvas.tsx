"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, PresentationControls } from "@react-three/drei";
import ServerNode from "./ServerNode";
import NetworkLines from "./NetworkLines";
import ParticleField from "./ParticleField";

export default function HeroCanvas() {
  // Pre-define server positions for a nice cluster arrangement
  const serverPositions: [number, number, number][] = useMemo(() => [
    [0, 1, 0],
    [-2, 0, -1],
    [2.5, -0.5, 1],
    [-1, -2, 2],
    [1.5, 2, -2],
    [-3, 1.5, 1],
    [3, 0.5, -1.5],
  ], []);

  return (
    <div className="w-full h-full absolute inset-0 z-0 pointer-events-auto">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <color attach="background" args={["#0a0a0f"]} />
        <fog attach="fog" args={["#0a0a0f", 5, 20]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />

        <PresentationControls 
          global 
          rotation={[0, 0, 0]} 
          polar={[-0.1, 0.1]} 
          azimuth={[-0.2, 0.2]} 
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <group position={[2, 0, 0]}>
            {serverPositions.map((pos, i) => (
              <ServerNode 
                key={i} 
                position={pos} 
                delay={i * 0.5}
                glowColor={i % 2 === 0 ? "#6366f1" : "#06b6d4"} 
              />
            ))}
            
            <NetworkLines nodes={serverPositions} />
            <ParticleField count={1500} />
          </group>
        </PresentationControls>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

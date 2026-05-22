"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

interface ServerNodeProps {
  position: [number, number, number];
  color?: string;
  glowColor?: string;
  delay?: number;
}

export default function ServerNode({ 
  position, 
  color = "#1e1b4b", 
  glowColor = "#6366f1",
  delay = 0 
}: ServerNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Random offset for organic floating movement
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Gentle floating
    meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + offset + delay) * 0.2;
    
    // Slight rotation
    meshRef.current.rotation.y = Math.sin(time * 0.2 + offset) * 0.1;
    meshRef.current.rotation.x = Math.cos(time * 0.3 + offset) * 0.05;

    // Pulsing light
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(time * 2 + offset) * 0.5;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[1.5, 0.5, 1.2]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial 
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>
      <pointLight 
        ref={lightRef}
        color={glowColor} 
        distance={4} 
        intensity={1} 
        position={[0, 0, 0.8]} 
      />
      {/* Front panel lights / details */}
      <mesh position={[-0.5, 0, 0.61]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[-0.3, 0, 0.61]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

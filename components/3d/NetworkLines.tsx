"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NetworkLinesProps {
  nodes: [number, number, number][];
}

export default function NetworkLines({ nodes }: NetworkLinesProps) {
  const linesRef = useRef<THREE.LineSegments>(null);

  // Create connections between all nodes
  const { positions, colors } = useMemo(() => {
    const pos = [];
    const col = [];
    const colorPrimary = new THREE.Color("#6366f1");
    const colorSecondary = new THREE.Color("#06b6d4");

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Only connect if distance is relatively close to form a web, not a complete graph
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < 6) {
          pos.push(...nodes[i]);
          pos.push(...nodes[j]);
          
          col.push(colorPrimary.r, colorPrimary.g, colorPrimary.b);
          col.push(colorSecondary.r, colorSecondary.g, colorSecondary.b);
        }
      }
    }
    return { 
      positions: new Float32Array(pos),
      colors: new Float32Array(col)
    };
  }, [nodes]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => {
    return new THREE.LineDashedMaterial({
      vertexColors: true,
      linewidth: 1,
      scale: 1,
      dashSize: 0.1,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.4,
    });
  }, []);

  useFrame((state) => {
    if (linesRef.current && linesRef.current.material) {
      const mat = linesRef.current.material as THREE.LineDashedMaterial;
      // @ts-expect-error - dashOffset is missing from TS definitions but works at runtime
      mat.dashOffset = -state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry} material={material} onUpdate={self => self.computeLineDistances()} />
  );
}

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagneticFieldProps {
  radius: number;
  visible: boolean;
  strength: number; // 0-100, based on mass and rotation
}

export function MagneticField({ radius, visible, strength }: MagneticFieldProps) {
  const fieldLinesRef = useRef<THREE.Group>(null);

  // Aurora colors - various purple, blue, green combinations
  const auroraColors = [
    "#00ff88", // Bright green
    "#00ffff", // Cyan
    "#4a90e2", // Blue
    "#9966ff", // Purple
    "#ff00ff", // Magenta
    "#00ccff", // Light blue
    "#66ff66", // Light green
  ];

  // Generate magnetic field line points following dipole field geometry
  const fieldLines = useMemo(() => {
    const lines: Array<{ points: THREE.Vector3[]; color: string; randomOffset: number }> = [];
    // Number of lines scales with magnetic field strength (20-100 lines)
    const numLines = Math.floor(20 + (strength / 100) * 80);
    const pointsPerLine = 50; // Points along each line

    for (let i = 0; i < numLines; i++) {
      const phi = (i / numLines) * Math.PI * 2 + (Math.random() - 0.5) * 0.3; // Add random variation
      const line: THREE.Vector3[] = [];

      // Random color from aurora palette
      const color = auroraColors[Math.floor(Math.random() * auroraColors.length)];

      // Random size variation (0.8 to 1.2)
      const sizeVariation = 0.8 + Math.random() * 0.4;

      // Random starting point variation
      const randomOffset = (Math.random() - 0.5) * 0.2;

      // Field lines follow dipole equation: r = r0 * sin²(theta)
      // where theta is the polar angle from the magnetic axis
      for (let j = 0; j < pointsPerLine; j++) {
        const t = j / (pointsPerLine - 1);

        // Theta ranges from north pole (0) to south pole (π) with slight randomization
        const theta = t * Math.PI + randomOffset; // 0 to π

        // Dipole field line equation with size variation
        // Keep lines narrow but tall by using smaller r0
        const r0 = radius * 1.3 * sizeVariation;
        const r = r0 * Math.pow(Math.sin(theta), 2);

        // Don't draw lines inside the planet
        if (r < radius * 1.05) continue;

        // Limit outer extent at equator - keep narrow
        const maxExtent = radius * 1.7;
        if (r > maxExtent) continue;

        // Convert spherical to Cartesian coordinates
        // Add vertical stretch to make lines taller
        const verticalStretch = 1.5 + (strength / 100) * 0.5; // 1.5 to 2.0x
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta) * verticalStretch; // Stretch Y axis
        const z = r * Math.sin(theta) * Math.sin(phi);

        line.push(new THREE.Vector3(x, y, z));
      }

      if (line.length > 2) {
        lines.push({ points: line, color, randomOffset: Math.random() });
      }
    }

    return lines;
  }, [radius, strength]);

  // Animate field lines with subtle pulsing and color shifting
  useFrame((state) => {
    if (fieldLinesRef.current && visible) {
      const time = state.clock.elapsedTime;
      fieldLinesRef.current.children.forEach((child, i) => {
        const material = (child as THREE.Line).material as THREE.LineBasicMaterial;
        const lineData = fieldLines[i];
        // Subtle pulsing opacity based on each line's random offset
        material.opacity = 0.2 + Math.sin(time * 0.5 + lineData.randomOffset * 10) * 0.1;
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={fieldLinesRef}>
      {fieldLines.map((lineData, i) => {
        const curve = new THREE.CatmullRomCurve3(lineData.points);
        const linePoints = curve.getPoints(lineData.points.length * 2);
        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);

        const material = new THREE.LineBasicMaterial({
          color: lineData.color,
          transparent: true,
          opacity: 0.2,
          linewidth: 1,
          blending: THREE.AdditiveBlending,
        });

        const line = new THREE.Line(geometry, material);

        return <primitive key={i} object={line} />;
      })}
    </group>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GPUParticles } from "./GPUParticles";
import * as THREE from "three";

function ParticleSystem() {
  // Create GPU particle system once using useMemo
  const particles = useMemo(() => {
    return new GPUParticles({
      count: 20000,
      radius: 2.5,
      color: new THREE.Color(0x6096fa),
      size: 1.5, // Increased from 0.8 for better visibility
      noiseScale: 0.5,
      curlAmplitude: 1.2,
      swirl: 0.3,
      attract: 0.15,
      spinBias: 1.5,
    });
  }, []);

  useFrame((state, delta) => {
    particles.update(delta);
  });

  return <primitive object={particles} />;
}

interface GPUParticleSceneProps {
  particleDensity?: number;
  luminosity?: number;
  cloudColor?: string;
}

export function GPUParticleScene({
  particleDensity = 1,
  luminosity = 1,
  cloudColor = "#6096fa",
}: GPUParticleSceneProps) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#000" }}>
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 50,
        }}
        style={{ background: "#000000" }}
      >
        {/* Ambient light based on star luminosity */}
        <ambientLight intensity={0.2 * luminosity} />

        {/* Point light representing the star */}
        <pointLight
          position={[10, 10, 10]}
          intensity={luminosity * 2}
          color="#ffffff"
        />

        {/* GPU Particle System */}
        <ParticleSystem />

        {/* Camera controls - rotation only, no zoom */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />
      </Canvas>
    </div>
  );
}

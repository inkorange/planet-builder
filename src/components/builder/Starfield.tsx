"use client";

import { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export function Starfield() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load the stars texture
  const starsTexture = useLoader(THREE.TextureLoader, "/stars.jpg");

  return (
    <mesh ref={meshRef}>
      {/* Large inverted sphere to wrap the scene */}
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial
        map={starsTexture}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

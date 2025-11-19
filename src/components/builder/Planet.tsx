"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetClassification } from "@/utils/planetSimulation";
import { EarthLikeMaterial } from "./materials/EarthLikeMaterial";
import { WaterWorldMaterial } from "./materials/WaterWorldMaterial";
import { LavaWorldMaterial } from "./materials/LavaWorldMaterial";
import { IceWorldMaterial } from "./materials/IceWorldMaterial";
import { GasGiantMaterial } from "./materials/GasGiantMaterial";
import { RockyTerrainMaterial } from "./materials/RockyTerrainMaterial";
import { CloudLayer } from "./CloudLayer";

interface PlanetProps {
  classification: PlanetClassification;
  isVisible: boolean;
}

export function Planet({ classification, isVisible }: PlanetProps) {
  const planetRef = useRef<THREE.Group>(null);

  // Rotate planet slowly
  useFrame(() => {
    if (planetRef.current && isVisible) {
      planetRef.current.rotation.y += 0.001; // Slow rotation
    }
  });

  if (!isVisible) return null;

  // Create planet material based on type
  const getPlanetMaterial = () => {
    const color = classification.color;

    switch (classification.type) {
      case "gas-giant":
        return <GasGiantMaterial color={color} />;

      case "ice-giant":
        // Ice giant with smooth appearance (use custom shader later if needed)
        return <GasGiantMaterial color={color} />;

      case "lava-world":
        return <LavaWorldMaterial color={color} />;

      case "venus-like":
        // Venus with thick atmosphere
        return (
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.1}
          />
        );

      case "ice-world":
        return <IceWorldMaterial color={color} />;

      case "water-world":
        return <WaterWorldMaterial color={color} />;

      case "earth-like":
        return <EarthLikeMaterial color={color} />;

      case "rocky-terrestrial":
        return <RockyTerrainMaterial color={color} />;

      default:
        // Barren
        return <RockyTerrainMaterial color={color} />;
    }
  };

  // Determine if planet should have clouds
  const shouldHaveClouds = () => {
    return ["earth-like", "water-world", "venus-like", "gas-giant", "ice-giant"].includes(
      classification.type
    );
  };

  return (
    <group ref={planetRef}>
      {/* Main planet sphere - 25% larger (2 -> 2.5) */}
      <mesh>
        <sphereGeometry args={[2.5, 128, 128]} />
        {getPlanetMaterial()}
      </mesh>

      {/* Cloud layer for planets with atmospheres */}
      {shouldHaveClouds() && (
        <CloudLayer planetType={classification.type} radius={2.56} />
      )}
    </group>
  );
}

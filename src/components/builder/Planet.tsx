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
import { MagneticField } from "./MagneticField";
import { AtmosphericHaze } from "./AtmosphericHaze";

interface PlanetProps {
  classification: PlanetClassification;
  isVisible: boolean;
  atmosphereScore: number;
  rotationSpeed: number; // hours per day
}

export function Planet({ classification, isVisible, atmosphereScore, rotationSpeed }: PlanetProps) {
  const planetRef = useRef<THREE.Group>(null);

  // Rotate planet based on rotation period
  // Earth rotates once every 24 hours (1 day)
  // Faster rotation (fewer hours) = faster visual spin
  // Slower rotation (more hours) = slower visual spin
  useFrame(() => {
    if (planetRef.current && isVisible) {
      // Base rotation speed for 24 hours (Earth)
      const baseSpeed = 0.001;
      // Invert the relationship: fewer hours = faster rotation
      const speedMultiplier = 24 / rotationSpeed;
      planetRef.current.rotation.y += baseSpeed * speedMultiplier;
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
      {/* Main planet sphere - optimized polygon count for performance */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        {getPlanetMaterial()}
      </mesh>

      {/* Cloud layer for planets with atmospheres */}
      {shouldHaveClouds() && (
        <CloudLayer planetType={classification.type} radius={2.56} />
      )}

      {/* Atmospheric haze effect */}
      <AtmosphericHaze
        radius={2.5}
        atmosphereScore={atmosphereScore}
        atmosphereType={classification.atmosphereType}
      />

      {/* Magnetic field visualization */}
      <MagneticField
        radius={2.5}
        visible={classification.hasMagneticField}
        strength={classification.magneticFieldStrength}
      />
    </group>
  );
}

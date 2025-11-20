"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PrimordialGasCloud } from "./PrimordialGasCloud";
import { ElementParticleEffects } from "./ElementParticleEffects";
import { PlanetFormationAnimation } from "./PlanetFormationAnimation";
import { Planet } from "./Planet";
import { Starfield } from "./Starfield";
import type { PlanetClassification } from "@/utils/planetSimulation";
import { getStarColor } from "@/utils/starColors";
import { calculateHabitabilityScore } from "@/utils/habitabilityScore";
import styles from "./PlanetScene.module.scss";

interface PlanetSceneProps {
  particleDensity?: number;
  luminosity?: number;
  cloudColor?: string;
  starType?: string;
  elementChanges?: Array<{
    symbol: string;
    color: string;
    change: number;
  }>;
  isBuilding?: boolean;
  isBuilt?: boolean;
  onFormationComplete?: () => void;
  planetClassification?: PlanetClassification | null;
  elementParts?: Record<string, number>;
}

export function PlanetScene({
  particleDensity = 1,
  luminosity = 1,
  cloudColor = "#6096fa",
  starType = "G",
  elementChanges = [],
  isBuilding = false,
  isBuilt = false,
  onFormationComplete,
  planetClassification,
  elementParts = {},
}: PlanetSceneProps) {
  // Track when to show planet behind flash
  const [showPlanetBehindFlash, setShowPlanetBehindFlash] = useState(false);

  // Get star color based on spectral type
  const starColorData = getStarColor(starType);

  return (
    <div className={styles.container}>
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 50,
        }}
        className={styles.canvas}
        resize={{ scroll: false, debounce: 0 }}
      >
        {/* Starfield background */}
        <Starfield />

        {/* Ambient light - much brighter for gas cloud, normal for planet */}
        <ambientLight
          intensity={isBuilt ? 0.5 * luminosity : 1.4 * luminosity}
          color={starColorData.color}
        />

        {/* Directional light - centered for gas cloud, angled for planet */}
        <directionalLight
          position={isBuilt ? [10, 3, 5] : [0, 0, 8]}
          intensity={isBuilt ? luminosity * 8 : luminosity * 20}
          color={starColorData.color}
        />

        {/* Primordial gas cloud - hide when planet is built */}
        {!isBuilt && (
          <PrimordialGasCloud
            particleDensity={particleDensity}
            luminosity={luminosity}
            cloudColor={cloudColor}
            isBuilding={isBuilding}
          />
        )}

        {/* Planet - show after formation OR during flash */}
        {(isBuilt || showPlanetBehindFlash) && planetClassification && (
          <Planet
            classification={planetClassification}
            isVisible={isBuilt || showPlanetBehindFlash}
            atmosphereScore={
              calculateHabitabilityScore(planetClassification, elementParts).factors.atmosphere.score
            }
          />
        )}

        {/* Element particle effects (comets and ejections) */}
        {!isBuilding && !isBuilt && (
          <ElementParticleEffects elementChanges={elementChanges} />
        )}

        {/* Formation animation */}
        {isBuilding && onFormationComplete && (
          <PlanetFormationAnimation
            isActive={isBuilding}
            onComplete={onFormationComplete}
            onFlashStart={() => setShowPlanetBehindFlash(true)}
            cloudColor={cloudColor}
            particleDensity={particleDensity}
          />
        )}

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

        {/* Post-processing effects disabled for testing */}
        {/* <EffectComposer>
          <Bloom
            intensity={1.5} // Reduced from 3.0 to prevent burnout
            luminanceThreshold={0.2} // Increased from 0.1 to reduce bloom trigger
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={1.2} // Reduced from 1.5
          />
        </EffectComposer> */}
      </Canvas>
    </div>
  );
}

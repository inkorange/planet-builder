"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PrimordialGasCloud } from "./PrimordialGasCloud";
import { ElementParticleEffects } from "./ElementParticleEffects";
import { PlanetFormationAnimation } from "./PlanetFormationAnimation";
import { Planet } from "./Planet";
import type { PlanetClassification } from "@/utils/planetSimulation";
import { getStarColor } from "@/utils/starColors";
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
}: PlanetSceneProps) {
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
        {/* Ambient light for overall scene brightness */}
        <ambientLight intensity={0.5 * luminosity} color={starColorData.color} />

        {/* Directional light representing the star for realistic day/night terminator */}
        <directionalLight
          position={[10, 3, 5]}
          intensity={luminosity * 8}
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

        {/* Planet - show after formation */}
        {isBuilt && planetClassification && (
          <Planet
            classification={planetClassification}
            isVisible={isBuilt}
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

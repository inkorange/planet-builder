"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PrimordialGasCloud } from "./PrimordialGasCloud";
import styles from "./PlanetScene.module.scss";

interface PlanetSceneProps {
  particleDensity?: number;
  luminosity?: number;
  cloudColor?: string;
}

export function PlanetScene({
  particleDensity = 1,
  luminosity = 1,
  cloudColor = "#6096fa",
}: PlanetSceneProps) {
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
        {/* Ambient light based on star luminosity */}
        <ambientLight intensity={0.3 * luminosity} />

        {/* Point light representing the star - positioned at center of gas cloud */}
        <pointLight
          position={[0, 0, 0]}
          intensity={luminosity * 50}
          distance={50}
          decay={2}
          color="#ffffff"
        />

        {/* Primordial gas cloud */}
        <PrimordialGasCloud
          particleDensity={particleDensity}
          luminosity={luminosity}
          cloudColor={cloudColor}
        />

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

        {/* Post-processing effects for motion blur and glow */}
        <EffectComposer>
          <Bloom
            intensity={1.5} // Reduced from 3.0 to prevent burnout
            luminanceThreshold={0.2} // Increased from 0.1 to reduce bloom trigger
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={1.2} // Reduced from 1.5
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

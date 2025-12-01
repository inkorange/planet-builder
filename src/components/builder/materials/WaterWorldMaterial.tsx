"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

interface WaterWorldMaterialProps {
  color: string;
  waterScore?: number; // 0-100, where 100 = abundant water
}

export function WaterWorldMaterial({ color, waterScore = 100 }: WaterWorldMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Calculate island threshold based on water score
  // Adjusted for procedural noise distribution
  // Score 100 -> threshold 0.92 (92-95% ocean, tiny scattered islands)
  // Score 75 -> threshold 0.85 (85% ocean, small islands)
  // Score 50 -> threshold 0.78 (78% ocean - water worlds are still very watery)
  // Score 25 -> threshold 0.71 (71% ocean, more substantial islands)
  // Score 0 -> threshold 0.64 (64% ocean, large landmasses)
  const islandThreshold = useMemo(() => {
    return 0.64 + (waterScore / 100) * 0.28;
  }, [waterScore]);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      oceanColor: { value: new THREE.Color(color) },
      islandColor: { value: new THREE.Color("#8b7355") },
      beachColor: { value: new THREE.Color("#d4a574") },
      islandThreshold: { value: islandThreshold },
    }),
    [color, islandThreshold]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.05;
    }
  });

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    ${noiseShaderChunk}

    uniform vec3 oceanColor;
    uniform vec3 islandColor;
    uniform vec3 beachColor;
    uniform float time;
    uniform float islandThreshold;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 pos = normalize(vPosition);

      // Generate scattered islands
      float islandNoise = fbm(pos * 6.0, 5);
      float islandMask = step(islandThreshold, islandNoise); // Dynamic island coverage

      // Beach transition - slightly below island threshold
      float beachMask = smoothstep(islandThreshold - 0.02, islandThreshold, islandNoise);

      // Animated wave pattern on ocean
      float wavePattern = sin(pos.x * 20.0 + time) * cos(pos.z * 20.0 + time) * 0.5 + 0.5;
      wavePattern *= 0.05;

      // Calculate color
      vec3 finalColor;

      if (islandMask > 0.5) {
        // Island terrain - blend from beach to rocky island based on elevation
        finalColor = mix(beachColor, islandColor, smoothstep(islandThreshold, islandThreshold + 0.05, islandNoise));
      } else {
        // Ocean with depth and wave variation
        float depth = 1.0 - islandNoise / islandThreshold;
        vec3 deepOcean = oceanColor * 0.6;
        vec3 shallowOcean = oceanColor * 1.3;

        finalColor = mix(shallowOcean, deepOcean, depth);
        finalColor += vec3(wavePattern) * 0.3;
      }

      // Lighting
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float diffuse = max(dot(vNormal, lightDir), 0.0);
      diffuse = diffuse * 0.6 + 0.4;

      finalColor *= diffuse;

      // Very subtle specular highlights on water (realistic ocean)
      if (islandMask < 0.5) {
        vec3 viewDir = normalize(vPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);
        finalColor += vec3(spec * 0.05);
      }

      // Subtle atmospheric glow
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      finalColor = mix(finalColor, vec3(0.4, 0.6, 1.0), fresnel * 0.08);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  );
}

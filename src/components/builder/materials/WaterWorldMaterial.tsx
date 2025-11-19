"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

export function WaterWorldMaterial({ color }: { color: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      oceanColor: { value: new THREE.Color(color) },
      islandColor: { value: new THREE.Color("#8b7355") },
      beachColor: { value: new THREE.Color("#d4a574") },
    }),
    [color]
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

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 pos = normalize(vPosition);

      // Generate scattered islands
      float islandNoise = fbm(pos * 6.0, 5);
      float islandMask = step(0.75, islandNoise); // Only highest elevation becomes islands

      // Beach transition
      float beachMask = smoothstep(0.74, 0.76, islandNoise);

      // Animated wave pattern on ocean
      float wavePattern = sin(pos.x * 20.0 + time) * cos(pos.z * 20.0 + time) * 0.5 + 0.5;
      wavePattern *= 0.05;

      // Calculate color
      vec3 finalColor;

      if (islandMask > 0.5) {
        // Island terrain
        finalColor = mix(beachColor, islandColor, smoothstep(0.76, 0.8, islandNoise));
      } else {
        // Ocean with depth and wave variation
        float depth = 1.0 - islandNoise / 0.75;
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

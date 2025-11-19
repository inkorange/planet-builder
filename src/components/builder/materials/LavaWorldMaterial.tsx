"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

export function LavaWorldMaterial({ color }: { color: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      lavaColor: { value: new THREE.Color(color) },
      crustColor: { value: new THREE.Color("#1a1a1a") },
      glowColor: { value: new THREE.Color("#ff6600") },
    }),
    [color]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.2;
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

    uniform vec3 lavaColor;
    uniform vec3 crustColor;
    uniform vec3 glowColor;
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 pos = normalize(vPosition);

      // Animated lava flows
      float lavaPattern1 = fbm(pos * 5.0 + time * 0.1, 4);
      float lavaPattern2 = fbm(pos * 3.0 - time * 0.15, 3);

      // Combine patterns for flowing effect
      float lavaFlow = lavaPattern1 * lavaPattern2;

      // Create cracks and fissures
      float cracks = ridgedNoise(pos * 10.0, 5);
      cracks = smoothstep(0.4, 0.6, cracks);

      // Determine if pixel is molten lava or cooled crust
      float moltenMask = smoothstep(0.3, 0.7, lavaFlow);

      // Pulsing glow intensity
      float pulse = sin(time * 2.0) * 0.2 + 0.8;

      // Calculate base color
      vec3 finalColor;
      if (moltenMask > 0.4) {
        // Molten lava with varying intensity
        float heat = moltenMask * pulse;
        finalColor = mix(lavaColor * 0.8, glowColor, heat);

        // Add intense glow to cracks
        finalColor += cracks * glowColor * 0.5;
      } else {
        // Cooled crust
        finalColor = crustColor;

        // Faint glow from cracks
        finalColor += cracks * lavaColor * 0.2;
      }

      // Add lighting (less prominent due to self-illumination)
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float diffuse = max(dot(vNormal, lightDir), 0.0);
      diffuse = diffuse * 0.3 + 0.7; // Mostly self-lit

      finalColor *= diffuse;

      // Strong emissive glow for lava areas
      if (moltenMask > 0.4) {
        finalColor += lavaColor * moltenMask * 0.5;
      }

      // Edge glow from internal heat
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      finalColor += glowColor * fresnel * 0.3;

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

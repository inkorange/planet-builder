"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

export function GasGiantMaterial({ color }: { color: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      baseColor: { value: new THREE.Color(color) },
      band1Color: { value: new THREE.Color("#d4a574") },
      band2Color: { value: new THREE.Color("#8b7355") },
      stormColor: { value: new THREE.Color("#ff6347") },
    }),
    [color]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.1;
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

    uniform vec3 baseColor;
    uniform vec3 band1Color;
    uniform vec3 band2Color;
    uniform vec3 stormColor;
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 pos = normalize(vPosition);

      // Latitude-based banding (parallel to equator)
      float latitude = pos.y;

      // Create multiple bands with varying widths
      float bandPattern = sin(latitude * 15.0) * 0.5 + 0.5;

      // Add turbulence to bands for realistic gas flow
      float turbulence = fbm(vec3(pos.x * 10.0 + time, latitude * 5.0, pos.z * 10.0), 4);
      bandPattern += turbulence * 0.3;

      // Create alternating band colors
      vec3 bandColor = mix(band1Color, band2Color, smoothstep(0.4, 0.6, bandPattern));

      // Add Great Red Spot-like storm
      vec2 stormCenter = vec2(0.3, 0.2);
      float stormDist = length(vec2(pos.x, pos.y) - stormCenter);
      float storm = smoothstep(0.3, 0.1, stormDist);

      // Swirling pattern in storm
      float stormSwirl = fbm(vec3(pos.xz * 20.0, time * 0.5), 5);
      storm *= stormSwirl;

      // Combine band colors with storm
      vec3 finalColor = mix(bandColor, stormColor, storm * 0.7);

      // Add atmospheric turbulence
      float atmosphericNoise = fbm(pos * 8.0 + time * 0.05, 3);
      finalColor += (atmosphericNoise - 0.5) * 0.1;

      // Softer lighting for gaseous appearance
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float diffuse = max(dot(vNormal, lightDir), 0.0);
      diffuse = diffuse * 0.5 + 0.5; // Very soft lighting

      finalColor *= diffuse;

      // Subtle edge glow for thick atmosphere
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      finalColor += baseColor * fresnel * 0.2;

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

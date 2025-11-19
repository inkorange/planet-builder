"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

interface CloudLayerProps {
  planetType: string;
  radius?: number;
}

export function CloudLayer({ planetType, radius = 2.05 }: CloudLayerProps) {
  const cloudRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      cloudColor: { value: new THREE.Color("#ffffff") },
      opacity: { value: planetType === "gas-giant" ? 1.0 : 0.85 },
    }),
    [planetType]
  );

  useFrame((state) => {
    if (cloudRef.current) {
      // Rotate clouds independently from planet
      cloudRef.current.rotation.y += 0.0005;
      if (uniforms) {
        uniforms.time.value = state.clock.elapsedTime * 0.1;
      }
    }
  });

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    ${noiseShaderChunk}

    uniform vec3 cloudColor;
    uniform float time;
    uniform float opacity;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldNormal;

    void main() {
      vec3 pos = normalize(vPosition);

      // Cloud formation using multiple noise layers for more coverage
      float clouds1 = fbm(vec3(pos.x * 5.0 + time * 0.1, pos.y * 5.0, pos.z * 5.0), 5);
      float clouds2 = fbm(vec3(pos.x * 3.0 - time * 0.05, pos.y * 3.0, pos.z * 3.0), 4);
      float clouds3 = fbm(vec3(pos.x * 7.0 + time * 0.08, pos.y * 7.0, pos.z * 7.0), 3);

      // Combine cloud layers with more detail
      float cloudPattern = (clouds1 * 0.5 + clouds2 * 0.3 + clouds3 * 0.2);

      // Lighter cloud coverage - higher threshold for less coverage
      float cloudDensity = smoothstep(0.45, 0.75, cloudPattern);

      // Make clouds more transparent at edges (atmosphere thinning)
      float edgeFade = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
      cloudDensity *= edgeFade;

      // Apply directional lighting to clouds (day/night terminator)
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float cloudLighting = max(dot(vNormal, lightDir), 0.0);

      // Sharp terminator on clouds
      cloudLighting = cloudLighting * 0.9 + 0.1;

      // Final cloud color with lighting and opacity
      vec3 finalColor = cloudColor * cloudLighting;
      float finalAlpha = cloudDensity * opacity;

      // Discard very transparent fragments for performance
      if (finalAlpha < 0.02) discard;

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  return (
    <mesh ref={cloudRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

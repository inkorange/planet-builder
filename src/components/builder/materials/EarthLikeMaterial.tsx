"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

interface EarthLikeMaterialProps {
  color: string;
  waterScore?: number; // 0-100, where 100 = abundant water
}

export function EarthLikeMaterial({ color, waterScore = 100 }: EarthLikeMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Calculate water level based on water score
  // Adjusted for procedural noise distribution (centered around 0.4-0.6)
  // Score 100 -> waterLevel 0.85 (85-90% ocean coverage, water world)
  // Score 75 -> waterLevel 0.7 (70-75% ocean)
  // Score 50 -> waterLevel 0.55 (50% ocean, Earth-like balance)
  // Score 25 -> waterLevel 0.4 (25% ocean, 75% land)
  // Score 0 -> waterLevel 0.25 (minimal ocean, mostly land/desert)
  const waterLevel = useMemo(() => {
    return 0.25 + (waterScore / 100) * 0.6;
  }, [waterScore]);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      baseColor: { value: new THREE.Color(color) },
      oceanColor: { value: new THREE.Color("#0077be") },
      landColor: { value: new THREE.Color("#2e8b57") },
      mountainColor: { value: new THREE.Color("#8b7355") },
      snowColor: { value: new THREE.Color("#ffffff") },
      waterLevel: { value: waterLevel },
    }),
    [color, waterLevel]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.1;
    }
  });

  const vertexShader = `
    ${noiseShaderChunk}

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vPosition = position;
      vec3 pos = normalize(position);

      // Calculate elevation using same noise as fragment shader
      // Large-scale continental plates
      float continents = fbm(pos * 1.5, 4);
      float terrain = fbm(pos * 4.0, 4) * 0.3;
      float mountains = ridgedNoise(pos * 8.0, 3) * 0.2;
      float elevation = continents * 0.7 + terrain + mountains * 0.3;
      vElevation = elevation;

      // Displace vertices for 3D topography
      float displacementAmount = 0.1; // Increased for more dramatic relief
      vec3 displacedPosition = position + normal * (elevation - 0.5) * displacementAmount;

      // Recalculate normal for better lighting
      vNormal = normalize(normalMatrix * normalize(displacedPosition));
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    }
  `;

  const fragmentShader = `
    ${noiseShaderChunk}

    uniform vec3 baseColor;
    uniform vec3 oceanColor;
    uniform vec3 landColor;
    uniform vec3 mountainColor;
    uniform vec3 snowColor;
    uniform float time;
    uniform float waterLevel;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    // Function to calculate elevation at any point
    float getElevation(vec3 p) {
      // Large-scale continental plates (lower frequency = bigger features)
      float continents = fbm(p * 1.5, 4);

      // Medium-scale terrain variation
      float terrain = fbm(p * 4.0, 4) * 0.3;

      // Mountain ranges (only on land)
      float mountains = ridgedNoise(p * 8.0, 3) * 0.2;

      // Combine: continents dominate, terrain adds detail, mountains are accents
      return continents * 0.7 + terrain + mountains * 0.3;
    }

    void main() {
      vec3 pos = normalize(vPosition);

      // Get elevation at this point
      float elevation = getElevation(pos);

      // For terrain coloring - recalculate components
      float continents = fbm(pos * 1.5, 4);
      float terrain = fbm(pos * 4.0, 4) * 0.3;
      float mountains = ridgedNoise(pos * 8.0, 3) * 0.2;

      // Water level is dynamic based on water score
      // Lower = more ocean, Higher = more land
      bool isOcean = elevation < waterLevel;

      // Calculate color based on elevation
      vec3 finalColor;

      if (isOcean) {
        // Ocean with depth variation
        float depth = (waterLevel - elevation) / waterLevel;
        finalColor = mix(oceanColor * 1.2, oceanColor * 0.6, depth);
      } else {
        // Land with elevation-based coloring
        float landHeight = (elevation - waterLevel) / (1.0 - waterLevel);

        if (landHeight < 0.3) {
          // Low land - green
          finalColor = mix(landColor * 0.8, landColor, landHeight / 0.3);
        } else if (landHeight < 0.7) {
          // Mid elevation - mountains
          float mountainBlend = (landHeight - 0.3) / 0.4;
          finalColor = mix(landColor, mountainColor, mountainBlend);
        } else {
          // High elevation - snow caps
          float snowBlend = (landHeight - 0.7) / 0.3;
          finalColor = mix(mountainColor, snowColor, smoothstep(0.0, 1.0, snowBlend));
        }
      }

      // Lighting with realistic day/night terminator
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float diffuse = max(dot(vNormal, lightDir), 0.0);

      // Cast shadow calculation - ray march towards light
      float shadow = 1.0;
      if (diffuse > 0.0) {
        float stepSize = 0.02;
        float currentElevation = elevation;

        // March towards the light source
        for (int i = 1; i < 6; i++) {
          vec3 samplePos = normalize(pos + lightDir * stepSize * float(i));
          float sampleElevation = getElevation(samplePos);

          // Calculate expected elevation along the ray
          float expectedElevation = currentElevation - float(i) * stepSize * 1.5;

          // If sample is higher than expected, we're in shadow
          if (sampleElevation > expectedElevation + 0.08) {
            shadow = 0.6; // Softer shadows
            break;
          }
        }
      }

      // Apply shadow and lighting with sharper terminator
      diffuse = diffuse * 0.9 + 0.1; // Sharper contrast
      diffuse *= shadow;

      finalColor *= diffuse;

      // Atmospheric scattering
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      vec3 atmosphereColor = vec3(0.4, 0.6, 1.0);
      finalColor = mix(finalColor, atmosphereColor, fresnel * 0.2);

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

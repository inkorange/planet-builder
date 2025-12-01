"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

interface RockyTerrainMaterialProps {
  color: string;
  waterScore?: number; // 0-100, where 100 = abundant water
}

export function RockyTerrainMaterial({ color, waterScore = 0 }: RockyTerrainMaterialProps) {
  // Calculate water level based on water score
  // Adjusted for the noise distribution which centers around 0.4-0.6
  const waterLevel = useMemo(() => {
    if (waterScore <= 0) return 0; // No water at all
    // Map water score to terrain threshold:
    // Score 100 -> 0.85 (covers most terrain, ~85% ocean)
    // Score 50 -> 0.6 (balanced, ~50% ocean)
    // Score 20 -> 0.45 (limited water, ~20% ocean)
    // Score 5 -> 0.35 (very dry, ~5% ocean)
    return 0.3 + (waterScore / 100) * 0.55;
  }, [waterScore]);

  const uniforms = useMemo(
    () => ({
      rockColor: { value: new THREE.Color(color) },
      darkRockColor: { value: new THREE.Color(color).multiplyScalar(0.6) },
      dustColor: { value: new THREE.Color(color).multiplyScalar(0.8) },
      oceanColor: { value: new THREE.Color("#0077be") },
      waterLevel: { value: waterLevel },
    }),
    [color, waterLevel]
  );

  const vertexShader = `
    ${noiseShaderChunk}

    varying vec3 vNormal;
    varying vec3 vObjectPosition;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      // Use object-space position for stable texture coordinates
      vObjectPosition = position;
      vec3 pos = normalize(position);

      // Calculate elevation using same noise functions as fragment shader
      float terrain = fbm(pos * 10.0, 6);
      float craterNoise = fbm(pos * 20.0, 4);
      float craterDepth = smoothstep(0.7, 0.75, craterNoise);
      float mountains = ridgedNoise(pos * 6.0, 5) * 0.5;

      // Combine features for displacement
      float elevation = terrain + mountains - craterDepth * 0.3;
      vElevation = elevation;

      // Displace vertices along normal direction
      float displacementAmount = 0.15; // Controls height of features
      vec3 displacedPosition = position + normal * elevation * displacementAmount;

      // Recalculate normal for lighting (approximate using displaced position)
      vNormal = normalize(normalMatrix * normalize(displacedPosition));
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    }
  `;

  const fragmentShader = `
    ${noiseShaderChunk}

    uniform vec3 rockColor;
    uniform vec3 darkRockColor;
    uniform vec3 dustColor;
    uniform vec3 oceanColor;
    uniform float waterLevel;

    varying vec3 vNormal;
    varying vec3 vObjectPosition;
    varying vec2 vUv;

    // Function to calculate elevation at any point
    float getElevation(vec3 p) {
      float terrain = fbm(p * 10.0, 6);
      float craterNoise = fbm(p * 20.0, 4);
      float craterDepth = smoothstep(0.7, 0.75, craterNoise);
      float mountains = ridgedNoise(p * 6.0, 5) * 0.5;
      return terrain + mountains - craterDepth * 0.3;
    }

    void main() {
      // Use object-space position for stable, rotation-independent texture coordinates
      vec3 pos = normalize(vObjectPosition);

      // Get elevation at this point
      float elevation = getElevation(pos);

      // For coloring
      float terrain = fbm(pos * 10.0, 6);
      float craterNoise = fbm(pos * 20.0, 4);
      float craters = step(0.7, craterNoise);
      float craterDepth = smoothstep(0.7, 0.75, craterNoise);
      float mountains = ridgedNoise(pos * 6.0, 5) * 0.5;

      // Check for ocean based on water level
      bool isOcean = waterLevel > 0.0 && elevation < waterLevel;

      // Color based on elevation and features
      vec3 finalColor;

      if (isOcean) {
        // Ocean with depth variation
        float depth = (waterLevel - elevation) / waterLevel;
        finalColor = mix(oceanColor * 1.2, oceanColor * 0.6, depth);
      } else if (craters > 0.5) {
        // Crater interiors are darker
        finalColor = mix(darkRockColor, rockColor, craterDepth);
      } else if (elevation > 0.6) {
        // Mountain peaks
        finalColor = rockColor;
      } else {
        // Plains with dust
        finalColor = mix(dustColor, rockColor, elevation);
      }

      // Add surface detail variation
      float surfaceDetail = fbm(pos * 30.0, 3);
      finalColor += (surfaceDetail - 0.5) * 0.1;

      // Lighting with realistic day/night terminator
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float diffuse = max(dot(vNormal, lightDir), 0.0);

      // Cast shadow calculation - ray march towards light
      float shadow = 1.0;
      if (diffuse > 0.0) {
        float stepSize = 0.03;
        float currentElevation = elevation;

        // March towards the light source
        for (int i = 1; i < 8; i++) {
          vec3 samplePos = normalize(pos + lightDir * stepSize * float(i));
          float sampleElevation = getElevation(samplePos);

          // Calculate expected elevation along the ray
          float expectedElevation = currentElevation - float(i) * stepSize * 2.0;

          // If sample is higher than expected, we're in shadow
          if (sampleElevation > expectedElevation + 0.1) {
            shadow = 0.5; // Softer shadows
            break;
          }
        }
      }

      // Enhance shadows in craters
      if (craters > 0.5) {
        diffuse *= 0.5;
      }

      // Apply shadow and lighting with sharper terminator
      diffuse = diffuse * 0.9 + 0.1; // Sharper contrast
      diffuse *= shadow;
      finalColor *= diffuse;

      // Very subtle specular on rocky minerals
      vec3 viewDir = normalize(vObjectPosition);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
      finalColor += vec3(spec * 0.05);

      // Atmospheric haze
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      finalColor = mix(finalColor, vec3(0.8, 0.9, 1.0), fresnel * 0.1);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  );
}

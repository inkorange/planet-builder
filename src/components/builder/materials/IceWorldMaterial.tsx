"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";

export function IceWorldMaterial({ color }: { color: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      iceColor: { value: new THREE.Color(color) },
      snowColor: { value: new THREE.Color("#ffffff") },
      crackColor: { value: new THREE.Color("#a0c8e8") },
    }),
    [color]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.02;
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

    uniform vec3 iceColor;
    uniform vec3 snowColor;
    uniform vec3 crackColor;
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 pos = normalize(vPosition);

      // Ice sheet patterns
      float icePattern = fbm(pos * 8.0, 5);

      // Ice cracks and rifts
      float cracks = ridgedNoise(pos * 15.0, 4);
      cracks = smoothstep(0.45, 0.55, cracks);

      // Polar caps (brighter at poles)
      float polarIntensity = abs(pos.y);
      float isPolar = smoothstep(0.6, 0.9, polarIntensity);

      // Calculate color
      vec3 baseIce = mix(iceColor, snowColor, icePattern * 0.3);
      vec3 polarSnow = mix(baseIce, snowColor, isPolar);

      // Add crack details
      vec3 finalColor = mix(polarSnow, crackColor, cracks * 0.3);

      // Lighting with high specular for icy surface
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
      float diffuse = max(dot(vNormal, lightDir), 0.0);
      diffuse = diffuse * 0.7 + 0.3;

      finalColor *= diffuse;

      // Strong specular reflection on ice
      vec3 viewDir = normalize(vPosition);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
      finalColor += vec3(spec * 0.8);

      // Subsurface scattering effect (ice translucency)
      float sss = pow(max(dot(vNormal, lightDir), 0.0), 2.0);
      finalColor += iceColor * sss * 0.2;

      // Atmospheric haze
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      finalColor = mix(finalColor, vec3(0.8, 0.9, 1.0), fresnel * 0.1);

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

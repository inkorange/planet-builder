"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AtmosphericHazeProps {
  radius: number;
  atmosphereScore: number; // 0-100
  atmosphereType: string;
}

export function AtmosphericHaze({ radius, atmosphereScore, atmosphereType }: AtmosphericHazeProps) {
  const hazeRef = useRef<THREE.Mesh>(null);

  // Determine atmosphere color based on type
  const getAtmosphereColor = () => {
    const type = atmosphereType.toLowerCase();

    // No atmosphere
    if (atmosphereScore < 10) {
      return new THREE.Color(0x000000);
    }

    // Nitrogen-oxygen (Earth-like)
    if (type.includes("nitrogen") && type.includes("oxygen")) {
      return new THREE.Color(0x87ceeb); // Sky blue
    }

    // CO2 dominated (Venus-like)
    if (type.includes("co₂") || type.includes("carbon dioxide")) {
      return new THREE.Color(0xffa500); // Orange
    }

    // Hydrogen-helium (Gas giants)
    if (type.includes("hydrogen") && type.includes("helium")) {
      return new THREE.Color(0xffe4b5); // Moccasin/tan
    }

    // Methane (Ice giants)
    if (type.includes("methane")) {
      return new THREE.Color(0x4682b4); // Steel blue
    }

    // Water vapor
    if (type.includes("water vapor")) {
      return new THREE.Color(0xb0e0e6); // Powder blue
    }

    // Vaporized rock/metals (Lava worlds)
    if (type.includes("vaporized") || type.includes("rock")) {
      return new THREE.Color(0xff6347); // Tomato red
    }

    // Default - pale blue
    return new THREE.Color(0xadd8e6);
  };

  // Animate atmospheric shimmer
  useFrame((state) => {
    if (hazeRef.current) {
      const time = state.clock.elapsedTime;
      const material = hazeRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = time;
    }
  });

  // Don't render if no atmosphere
  if (atmosphereScore < 10) return null;

  const atmosphereColor = getAtmosphereColor();

  // Opacity scales with atmosphere score - increased for better visibility
  const atmosphereOpacity = 0.35 + (atmosphereScore / 100) * 0.5;

  // Thickness scales with atmosphere score - reduced to stay closer to planet
  const atmosphereThickness = 0.08 + (atmosphereScore / 100) * 0.12;

  // Custom shader for atmospheric haze with Fresnel effect
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Volumetric atmosphere shader - denser near planet, fades into space
  const fragmentShader = `
    uniform vec3 atmosphereColor;
    uniform float opacity;
    uniform float time;
    uniform float planetRadius;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

      // Fresnel effect for edge glow
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.5);

      // Calculate radial distance from planet center
      float currentRadius = length(vPosition);
      float atmosphereOuterRadius = currentRadius; // We're on the outer sphere

      // Calculate how deep we are into the atmosphere (0 at outer edge, 1 at planet surface)
      // When viewing through the atmosphere, we see different depths
      float viewDot = abs(dot(viewDirection, vNormal));

      // Depth through atmosphere increases as we look more perpendicular to surface
      float atmosphereDepth = 1.0 - viewDot;

      // Enhance the depth curve for more realistic falloff
      atmosphereDepth = pow(atmosphereDepth, 0.8);

      // Gentle fade at the extreme limb to prevent hard edges
      float viewAngle = dot(normalize(vWorldPosition), viewDirection);
      float limbFade = smoothstep(-0.6, 0.1, viewAngle);

      // Atmospheric scattering effect
      float scatter = sin(time * 0.3 + vPosition.x * 1.5 + vPosition.z * 1.5) * 0.1 + 0.9;

      // Combine: deeper atmosphere = more opacity, plus fresnel edge enhancement
      float alpha = (atmosphereDepth * 0.7 + fresnel * 0.4) * opacity * scatter * limbFade;

      gl_FragColor = vec4(atmosphereColor, alpha);
    }
  `;

  return (
    <mesh ref={hazeRef}>
      <sphereGeometry args={[radius + atmosphereThickness, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          atmosphereColor: { value: atmosphereColor },
          opacity: { value: atmosphereOpacity },
          time: { value: 0 },
          planetRadius: { value: radius },
        }}
        transparent={true}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

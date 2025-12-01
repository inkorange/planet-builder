"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseShaderChunk } from "@/utils/proceduralNoise";
import { ELEMENTS } from "@/data/elements";

interface GasGiantMaterialProps {
  color: string;
  elementParts?: Record<string, number>;
}

export function GasGiantMaterial({ color, elementParts = {} }: GasGiantMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Calculate band colors from element composition
  const bandColors = useMemo(() => {
    const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);
    if (totalParts === 0) {
      return [
        new THREE.Color("#d4a574"), // Default tan
        new THREE.Color("#8b7355"), // Default brown
        new THREE.Color("#c19a6b"), // Default beige
        new THREE.Color("#a0826d"), // Default rust
      ];
    }

    // Get top 4 elements by composition
    const topElements = Object.entries(elementParts)
      .filter(([, parts]) => parts > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([symbol]) => {
        const element = ELEMENTS.find((el) => el.symbol === symbol);
        return element?.color || "#888888";
      });

    // Ensure we have at least 4 colors by repeating/blending
    while (topElements.length < 4) {
      topElements.push(topElements[topElements.length - 1] || "#888888");
    }

    // Desaturate and mute the colors for softer appearance
    return topElements.map(c => {
      const color = new THREE.Color(c);
      // Convert to HSL, reduce saturation by 65% and adjust brightness
      const hsl = { h: 0, s: 0, l: 0 };
      color.getHSL(hsl);
      color.setHSL(hsl.h, hsl.s * 0.35, hsl.l * 0.75);
      return color;
    });
  }, [elementParts]);

  // Generate random-ish values based on element composition for consistent variation
  const bandParams = useMemo(() => {
    const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);
    const seed = totalParts > 0
      ? Object.entries(elementParts).reduce((acc, [symbol, parts]) => {
          return acc + symbol.charCodeAt(0) * parts;
        }, 0)
      : 12345;

    // Pseudo-random number generator based on seed
    const random = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    return {
      bandFrequency: 12 + random(1) * 10, // 12-22 bands (less variation)
      bandWarp: 0.15 + random(2) * 0.15, // 0.15-0.3 warp (reduced chaos)
      turbulenceScale: 6 + random(3) * 6, // 6-12 turbulence (calmer)
      stormX: -0.5 + random(4) * 1.0, // Random storm position
      stormY: -0.3 + random(5) * 0.6,
      stormSize: 0.15 + random(6) * 0.1, // 0.15-0.25 (smaller range)
    };
  }, [elementParts]);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      baseColor: { value: new THREE.Color(color) },
      band1Color: { value: bandColors[0] },
      band2Color: { value: bandColors[1] },
      band3Color: { value: bandColors[2] },
      band4Color: { value: bandColors[3] },
      bandFrequency: { value: bandParams.bandFrequency },
      bandWarp: { value: bandParams.bandWarp },
      turbulenceScale: { value: bandParams.turbulenceScale },
      stormPos: { value: new THREE.Vector2(bandParams.stormX, bandParams.stormY) },
      stormSize: { value: bandParams.stormSize },
    }),
    [color, bandColors, bandParams]
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
    uniform vec3 band3Color;
    uniform vec3 band4Color;
    uniform float bandFrequency;
    uniform float bandWarp;
    uniform float turbulenceScale;
    uniform vec2 stormPos;
    uniform float stormSize;
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 pos = normalize(vPosition);

      // Latitude-based banding (parallel to equator)
      float latitude = pos.y;

      // Add gentle horizontal flow/warp to bands
      float flowNoise = fbm(vec3(pos.x * 3.0 + time * 0.2, latitude * 2.0, pos.z * 3.0), 2);
      float warpedLatitude = latitude + flowNoise * bandWarp;

      // Create smoother bands with varying widths
      float bandPattern = sin(warpedLatitude * bandFrequency) * 0.5 + 0.5;

      // Add subtle secondary band patterns for depth
      float secondaryBands = sin(warpedLatitude * (bandFrequency * 0.7)) * 0.5 + 0.5;
      bandPattern = mix(bandPattern, secondaryBands, 0.2);

      // Add gentle turbulence for realistic gas flow
      float turbulence = fbm(vec3(pos.x * turbulenceScale + time * 0.5, latitude * 3.0, pos.z * turbulenceScale), 3);
      bandPattern += turbulence * 0.15; // Reduced turbulence influence

      // Create smooth color gradients using 4 colors
      vec3 bandColor;
      float bp = fract(bandPattern); // Create repeating pattern

      // Smoother transitions with longer blend ranges
      if (bp < 0.3) {
        bandColor = mix(band1Color, band2Color, smoothstep(0.0, 0.3, bp));
      } else if (bp < 0.55) {
        bandColor = mix(band2Color, band3Color, smoothstep(0.3, 0.55, bp));
      } else if (bp < 0.8) {
        bandColor = mix(band3Color, band4Color, smoothstep(0.55, 0.8, bp));
      } else {
        bandColor = mix(band4Color, band1Color, smoothstep(0.8, 1.0, bp));
      }

      // Blend adjacent colors for even softer transitions
      float blendFactor = smoothstep(0.4, 0.6, fract(bandPattern * 4.0));
      vec3 blendedColor = mix(band2Color, band3Color, blendFactor);
      bandColor = mix(bandColor, blendedColor, 0.15);

      // Add Great Red Spot-like storm at variable position
      float stormDist = length(vec2(pos.x, pos.y) - stormPos);
      float storm = smoothstep(stormSize + 0.1, stormSize * 0.3, stormDist);

      // Swirling pattern in storm
      float stormSwirl = fbm(vec3(pos.xz * 20.0, time * 0.5), 5);
      storm *= stormSwirl;

      // Storm color is a blend of the band colors (darker/redder)
      vec3 stormColor = mix(band1Color, band3Color, 0.5) * vec3(1.2, 0.7, 0.6);

      // Combine band colors with storm
      vec3 finalColor = mix(bandColor, stormColor, storm * 0.6);

      // Add subtle atmospheric variation
      float atmosphericNoise = fbm(pos * 6.0 + time * 0.03, 2);
      finalColor += (atmosphericNoise - 0.5) * 0.05; // Reduced atmospheric noise

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

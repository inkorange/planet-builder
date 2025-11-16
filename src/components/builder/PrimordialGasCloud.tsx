"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface PrimordialGasCloudProps {
  particleDensity?: number; // 0.1 to 100 (Earth masses)
  luminosity?: number; // 0.1 to 2 (based on star proximity/type)
  cloudColor?: string; // Hex color based on element composition
}

export function PrimordialGasCloud({
  particleDensity = 1,
  luminosity = 1,
  cloudColor = "#6096fa",
}: PrimordialGasCloudProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const rotationSpeed = useRef(0.001);

  // Use a fixed maximum particle count to avoid buffer resizing issues
  const maxParticleCount = 54000; // Increased by 25% from 43200

  // Calculate active particle count based on density (mass)
  const activeParticleCount = Math.floor(13500 + particleDensity * 405); // Increased by 25%

  // Create a sprite texture for soft, cloud-like particles
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // Create radial gradient for soft, glowing particle
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Generate particle positions in a volumetric cloud pattern
  const { positions, velocities, sizes, opacities, colors, trails } = useMemo(() => {
    const positions = new Float32Array(maxParticleCount * 3);
    const velocities = new Float32Array(maxParticleCount * 3);
    const sizes = new Float32Array(maxParticleCount);
    const opacities = new Float32Array(maxParticleCount);
    const colors = new Float32Array(maxParticleCount * 3); // Per-particle RGB colors
    const trails = new Float32Array(maxParticleCount); // Trail intensity per particle

    // Simple 3D Perlin-like noise function for wispy distribution
    const noise3D = (x: number, y: number, z: number) => {
      // Use sine waves at different frequencies for pseudo-noise
      const freq1 = 1.5, freq2 = 2.7, freq3 = 4.3;
      return (
        Math.sin(x * freq1 + y * freq2) * 0.3 +
        Math.sin(y * freq2 + z * freq3) * 0.3 +
        Math.sin(z * freq3 + x * freq1) * 0.4
      );
    };

    for (let i = 0; i < maxParticleCount; i++) {
      const i3 = i * 3;

      // Spherical distribution - particles farther out based on index
      // Early particles go to center, later particles go to outer regions
      const particleRatio = i / maxParticleCount; // 0 to 1

      const rand = Math.random();
      let radius;

      // Blend between center-heavy and spread-out based on particle index
      const centerBias = Math.max(0.3, 1.0 - particleRatio * 1.5); // Decreases as index increases

      if (rand < centerBias) {
        // Earlier particles: spread out more in center region
        radius = Math.pow(Math.random(), 0.5) * 2.5; // Increased from 1.4 to 2.5
      } else {
        // Later particles: spread in outer region, going farther as index increases
        const minRadius = 2.5 + particleRatio * 1.0; // Starts at 2.5 (increased from 1.4)
        const maxRadius = 5.0 + particleRatio * 1.5; // Starts at 5.0, increases to 6.5 (increased from 3.4/4.4)
        radius = minRadius + Math.random() * (maxRadius - minRadius);
      }
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // Base position
      const baseX = radius * Math.sin(phi) * Math.cos(theta);
      const baseY = radius * Math.sin(phi) * Math.sin(theta);
      const baseZ = radius * Math.cos(phi);

      // Apply noise-based displacement for wispy, irregular edges
      const noiseValue = noise3D(baseX, baseY, baseZ);
      const displacement = noiseValue * 1.5; // Increased from 0.8 for more irregular edges

      // Create wispy tendrils by displacing particles along noise gradients
      const noiseDX = noise3D(baseX + 0.1, baseY, baseZ) - noiseValue;
      const noiseDY = noise3D(baseX, baseY + 0.1, baseZ) - noiseValue;
      const noiseDZ = noise3D(baseX, baseY, baseZ + 0.1) - noiseValue;

      // Add extra random variation to break up the sphere
      const extraVariation = (Math.random() - 0.5) * 1.2;

      positions[i3] = baseX + noiseDX * displacement + extraVariation * Math.sin(theta);
      positions[i3 + 1] = baseY + noiseDY * displacement + extraVariation;
      positions[i3 + 2] = baseZ + noiseDZ * displacement + extraVariation * Math.cos(theta);

      // Swirling velocities - very fast to showcase blur effect
      // Particles farther from center move faster
      const distanceFactor = Math.max(radius, 0.5) / 2.8; // Normalize to max radius
      const speed = 0.015 * (0.3 + distanceFactor * 5.0); // Doubled upper end from 2.5 to 5.0 (100% increase)
      const turbulence = (Math.random() - 0.5) * 0.012; // Doubled from 0.006
      const noiseTurbulence = noiseValue * 0.008; // Doubled from 0.004

      velocities[i3] = -Math.sin(theta) * speed + turbulence + noiseTurbulence;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.0005 + turbulence;
      velocities[i3 + 2] = Math.cos(theta) * speed + turbulence + noiseTurbulence;

      // Varying sizes - particles get smaller the farther from center
      const actualDist = Math.sqrt(baseX ** 2 + baseY ** 2 + baseZ ** 2);
      const distanceRatio = Math.min(actualDist / 6.5, 1.0); // Normalize to new max distance (6.5)

      // Size decreases with distance: center particles larger, edge particles smaller
      const distanceSizeFactor = 1.0 - distanceRatio * 0.7; // Reduces to 30% at max distance

      const baseSize = 1.0;
      const sizeVariation = 0.2 + Math.random() * 1.8; // 0.2 to 2.0 (20% to 200%)
      const noiseInfluence = Math.abs(noiseValue) * 0.3;
      sizes[i] = baseSize * sizeVariation * (1 - noiseInfluence) * distanceSizeFactor;

      // Varying opacity - denser in center, more transparent in wispy areas
      const distanceFromCenter = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );
      // Reduced base opacity to prevent center glow
      const baseOpacity = Math.max(0.02, 0.4 - distanceFromCenter / 6);

      // Wispy areas are more transparent (creates tendrils effect)
      const wispiness = Math.abs(noiseValue) > 0.3 ? 0.4 : 1.0;
      opacities[i] = baseOpacity * wispiness;

      // Space dust color variation (browns, grays, warm tones)
      const colorVariation = Math.random();
      let r: number;
      let g: number;
      let b: number;

      if (colorVariation < 0.3) {
        // Dark brown dust
        r = 0.3 + Math.random() * 0.2;  // 0.3-0.5
        g = 0.2 + Math.random() * 0.15; // 0.2-0.35
        b = 0.1 + Math.random() * 0.1;  // 0.1-0.2
      } else if (colorVariation < 0.6) {
        // Gray dust
        const gray = 0.25 + Math.random() * 0.3; // 0.25-0.55
        r = gray;
        g = gray * 0.95;
        b = gray * 0.9;
      } else if (colorVariation < 0.85) {
        // Warm brown/orange dust
        r = 0.4 + Math.random() * 0.3;  // 0.4-0.7
        g = 0.25 + Math.random() * 0.2; // 0.25-0.45
        b = 0.15 + Math.random() * 0.15; // 0.15-0.3
      } else {
        // Reddish dust (iron oxide)
        r = 0.5 + Math.random() * 0.3;  // 0.5-0.8
        g = 0.2 + Math.random() * 0.15; // 0.2-0.35
        b = 0.15 + Math.random() * 0.1; // 0.15-0.25
      }

      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;

      // Trail intensity - particles moving faster get longer trails
      const velocityMagnitude = Math.sqrt(velocities[i3] ** 2 + velocities[i3 + 1] ** 2 + velocities[i3 + 2] ** 2);
      // Increased multiplier and added base value so slower particles also have trails
      trails[i] = 15.0 + velocityMagnitude * 600.0; // Triple the previous trail intensity (200% increase)
    }

    return { positions, velocities, sizes, opacities, colors, trails };
  }, []); // Only generate once

  // Update the draw range when particle density changes
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.geometry.setDrawRange(0, activeParticleCount);
    }
  }, [activeParticleCount]);

  // Animate the swirling particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    // Only animate active particles
    for (let i = 0; i < activeParticleCount; i++) {
      const i3 = i * 3;

      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);

      // Calculate orbital motion - particles rotate around center at their current radius
      const theta = Math.atan2(z, x);
      const phi = Math.atan2(y, Math.sqrt(x * x + z * z));

      // Rotation speed varies with distance (differential rotation like a real nebula)
      const rotationRate = velocities[i3] / Math.max(distance, 0.5);
      const newTheta = theta + rotationRate;

      // Keep radius stable - no fluctuation for cleaner rotation
      const radius = distance;

      // Apply minimal turbulence - focus on rotation instead of outward emission
      const turbulenceScale = 0.15; // Very minimal turbulence for smoother rotation
      const turbulenceX = Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.0008;
      const turbulenceY = Math.cos(state.clock.elapsedTime * 1.2 + i) * 0.001;
      const turbulenceZ = Math.sin(state.clock.elapsedTime * 1.8 + i) * 0.0008;

      // Update position - maintain approximate radius while allowing turbulent motion
      let newX = radius * Math.cos(newTheta) * Math.cos(phi) + turbulenceX;
      let newY = radius * Math.sin(phi) + turbulenceY;
      let newZ = radius * Math.sin(newTheta) * Math.cos(phi) + turbulenceZ;

      // Apply containment force - pull particles back if they get too far
      const newDistance = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
      const maxDistance = 3.6; // Maximum allowed distance from center (20% smaller: 4.5 * 0.8 = 3.6)

      if (newDistance > maxDistance) {
        // Smoothly pull particles back toward the boundary
        const pullBackFactor = maxDistance / newDistance;
        newX *= pullBackFactor;
        newY *= pullBackFactor;
        newZ *= pullBackFactor;
      }

      positions[i3] = newX;
      positions[i3 + 1] = newY;
      positions[i3 + 2] = newZ;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Slow rotation of entire cloud
    particlesRef.current.rotation.y += rotationSpeed.current;
  });

  // Convert hex color to THREE.Color
  const color = new THREE.Color(cloudColor);

  // Create custom shader material for volumetric effect with blur
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: color },
        pointTexture: { value: spriteTexture },
        luminosity: { value: luminosity },
        lightPosition: { value: new THREE.Vector3(0, 0, 0) }, // Light at center
        uTime: { value: 0 }, // Animation time for trails
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute vec3 color;
        attribute float trail;
        varying float vOpacity;
        varying float vDepth;
        varying vec3 vPosition;
        varying vec3 vColor;
        varying float vTrail;

        void main() {
          vOpacity = opacity;
          vColor = color;
          vTrail = trail;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Pass depth and position for blur effect
          vDepth = -mvPosition.z;
          vPosition = position;

          // Increase size for particles with high trail values to create bloom effect
          float sizeMultiplier = 1.0 + vTrail * 0.02;
          gl_PointSize = size * 200.0 * sizeMultiplier * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D pointTexture;
        uniform float luminosity;
        uniform vec3 lightPosition;
        uniform float uTime;
        varying float vOpacity;
        varying float vDepth;
        varying vec3 vPosition;
        varying vec3 vColor;
        varying float vTrail;

        void main() {
          // Distance from center of point sprite
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          // Create soft, blurred edges
          float blur = smoothstep(0.5, 0.0, dist);

          // Sample texture
          vec4 textureColor = texture2D(pointTexture, gl_PointCoord);

          // Additional blur based on distance from center of cloud
          float distanceFromCenter = length(vPosition) / 3.0;
          float cloudBlur = mix(1.0, 0.6, distanceFromCenter);

          // Depth-based blur for atmospheric depth
          float depthBlur = 1.0 - smoothstep(5.0, 12.0, vDepth) * 0.3;

          // Combine all blur factors
          float finalBlur = blur * cloudBlur * depthBlur;

          // Calculate lighting from the light source
          vec3 lightDir = normalize(lightPosition - vPosition);
          float lightDistance = length(lightPosition - vPosition);

          // Basic diffuse lighting calculation
          // Particles closer to the light get more illumination
          float lightIntensity = 1.0 / (1.0 + lightDistance * lightDistance * 0.005);

          // Add rim lighting effect - particles on the edge facing the light glow more
          float rimEffect = max(0.0, dot(normalize(vPosition), lightDir));

          // Much stronger edge boost - outer particles (distanceFromCenter closer to 1.0) get massive boost
          float edgeFactor = smoothstep(0.5, 1.0, distanceFromCenter); // 0 at center, 1 at edge
          float edgeBoost = edgeFactor * rimEffect * 8.0; // Increased from 2.0 to 8.0

          // Fake shadow approximation - particles on the opposite side of the light are darker
          // Calculate if particle is in "shadow" by checking if it's on the far side from light
          vec3 particleDir = normalize(vPosition);
          float shadowFactor = dot(particleDir, lightDir);

          // Particles behind center (from light's perspective) get darkened
          // Also consider depth - particles deeper in the cloud cast more shadow
          float depthDarkening = smoothstep(0.0, 1.0, distanceFromCenter * 0.5);
          float shadowDarkening = smoothstep(-1.0, 0.3, shadowFactor);
          shadowDarkening = mix(shadowDarkening, 1.0, depthDarkening * 0.5);

          // Much higher ambient light to ensure backside is visible
          float ambientLight = 1.0125; // Reduced by 25% from 1.35

          // Directional lighting adds on top of ambient
          float directionalLight = (mix(0.3, 1.5, lightIntensity) + edgeBoost) * shadowDarkening;

          float lighting = ambientLight + directionalLight;

          // Use per-particle color with lighting
          // Reduced luminosity influence by 50% from 0.4 to 0.2 to prevent burnout
          vec3 dustColor = vColor * lighting * (0.8 + luminosity * 0.2);

          // Boost brightness for fast-moving particles to create bloom trails
          float trailBrightness = 1.0 + vTrail * 0.075; // Increased by 50% from 0.05
          dustColor *= trailBrightness;

          // Boost for edge particles - reduced to prevent burnout
          float alphaBoost = 1.0 + edgeBoost * 0.5; // Further reduced from 1.0 to 0.5
          // Further reduced alpha to prevent burnout
          float finalAlpha = textureColor.a * vOpacity * luminosity * 0.08 * finalBlur * alphaBoost;

          gl_FragColor = vec4(dustColor, finalAlpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
  }, [color, spriteTexture, luminosity]);

  // Update material uniforms when props change
  useEffect(() => {
    shaderMaterial.uniforms.color.value = new THREE.Color(cloudColor);
    shaderMaterial.uniforms.luminosity.value = luminosity;
  }, [cloudColor, luminosity, shaderMaterial]);

  return (
    <points ref={particlesRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxParticleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={maxParticleCount}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={maxParticleCount}
          array={opacities}
          itemSize={1}
          args={[opacities, 1]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={maxParticleCount}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-trail"
          count={maxParticleCount}
          array={trails}
          itemSize={1}
          args={[trails, 1]}
        />
      </bufferGeometry>
    </points>
  );
}

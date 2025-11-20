"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlanetFormationAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  onFlashStart: () => void;
  cloudColor: string;
  particleDensity: number;
}

export function PlanetFormationAnimation({
  isActive,
  onComplete,
  onFlashStart,
  cloudColor,
  particleDensity,
}: PlanetFormationAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const flashMeshRef = useRef<THREE.Mesh | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const flashStartCalledRef = useRef(false);

  const duration = 6000; // 6 seconds total
  const collapseDuration = 2000; // 2 seconds for collapse
  const flashRampDuration = 500; // 0.5 seconds to reach peak brightness
  const flashFadeDuration = 3500; // 3.5 seconds to fade out

  // Create flash effect mesh
  useEffect(() => {
    if (!groupRef.current) return;

    // Create a full-screen quad for the flash effect
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 5); // Position in front of camera
    flashMeshRef.current = mesh;
    groupRef.current.add(mesh);

    return () => {
      geometry.dispose();
      material.dispose();
      if (groupRef.current && flashMeshRef.current) {
        groupRef.current.remove(flashMeshRef.current);
      }
    };
  }, []);

  // Reset animation when it becomes active
  useEffect(() => {
    if (isActive) {
      progressRef.current = 0;
      startTimeRef.current = Date.now();
      flashStartCalledRef.current = false;
    }
  }, [isActive]);

  // Animation loop
  useFrame((state) => {
    if (!isActive || !startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    progressRef.current = progress;

    // Total animation: 4 seconds
    // 0-2s: Collapse with brightness ramp
    // 2-4s: Flash overlapping with final collapse (starts while still collapsing)

    const totalCollapseProgress = Math.min(elapsed / duration, 1); // Full 4 seconds for complete collapse

    if (elapsed < collapseDuration) {
      // Phase 1 (0-2s): Initial collapse with brightness ramping
      const collapseProgress = elapsed / collapseDuration;
      const brightnessMultiplier = 1 + collapseProgress * 6; // Ramps from 1x to 7x

      // Update scene lighting
      state.scene.traverse((obj) => {
        if (obj instanceof THREE.PointLight) {
          obj.intensity = obj.userData.baseIntensity * brightnessMultiplier;
        }
      });
    } else if (elapsed < duration) {
      // Phase 2 (2-6s): Flash ramps to peak, planet renders, then fades
      const flashElapsed = elapsed - collapseDuration;
      const peakTime = flashRampDuration; // 0.5s to reach peak

      let flashOpacity: number;
      let brightness: number;

      if (flashElapsed < flashRampDuration) {
        // Ramp up: 0-0.5s - quick ramp to peak brightness
        const rampProgress = flashElapsed / flashRampDuration; // 0 to 1
        flashOpacity = rampProgress; // 0 → 1
        brightness = THREE.MathUtils.lerp(7, 20, rampProgress); // 7x → 20x
      } else {
        // At peak or fading: 0.5s-4s
        // Call onFlashStart once when flash reaches peak (at 0.5s)
        if (!flashStartCalledRef.current) {
          flashStartCalledRef.current = true;
          onFlashStart(); // Planet renders NOW at peak brightness
        }

        // Fade out: 0.5s-4s (3.5 seconds)
        const fadeElapsed = flashElapsed - flashRampDuration;
        const fadeProgress = Math.min(fadeElapsed / flashFadeDuration, 1); // 0 to 1
        flashOpacity = Math.max(0, 1 - fadeProgress); // 1 → 0
        brightness = THREE.MathUtils.lerp(20, 1, fadeProgress); // 20x → 1x
      }

      if (flashMeshRef.current) {
        (flashMeshRef.current.material as THREE.MeshBasicMaterial).opacity = flashOpacity;
        flashMeshRef.current.lookAt(state.camera.position);
      }

      state.scene.traverse((obj) => {
        if (obj instanceof THREE.PointLight) {
          obj.intensity = obj.userData.baseIntensity * brightness;
        }
      });
    } else {
      // Animation complete
      if (flashMeshRef.current) {
        (flashMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      // Reset lighting
      state.scene.traverse((obj) => {
        if (obj instanceof THREE.PointLight && obj.userData.baseIntensity) {
          obj.intensity = obj.userData.baseIntensity;
        }
      });

      startTimeRef.current = null;
      onComplete();
    }
  });

  // Store base light intensity when component mounts
  useEffect(() => {
    if (!isActive) return;

    const scene = groupRef.current?.parent;
    scene?.traverse((obj) => {
      if (obj instanceof THREE.PointLight && !obj.userData.baseIntensity) {
        obj.userData.baseIntensity = obj.intensity;
      }
    });
  }, [isActive]);

  return <group ref={groupRef} />;
}

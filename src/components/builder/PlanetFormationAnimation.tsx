"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlanetFormationAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  cloudColor: string;
  particleDensity: number;
}

export function PlanetFormationAnimation({
  isActive,
  onComplete,
  cloudColor,
  particleDensity,
}: PlanetFormationAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const flashMeshRef = useRef<THREE.Mesh | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const duration = 4000; // 4 seconds total
  const collapseDuration = 2000; // 2 seconds for collapse before flash starts

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
      // Phase 2 (2-4s): Flash starts while gas is still collapsing (final 2 seconds)
      const flashPhaseProgress = (elapsed - collapseDuration) / 2000; // 0 to 1 over 2 seconds

      // Flash opacity: quick flash then fade
      const flashOpacity = flashPhaseProgress < 0.5
        ? Math.sin(flashPhaseProgress * 2 * Math.PI) // Quick flash in first half
        : 1 - (flashPhaseProgress - 0.5) * 2; // Fade out in second half

      if (flashMeshRef.current) {
        (flashMeshRef.current.material as THREE.MeshBasicMaterial).opacity = flashOpacity;
        flashMeshRef.current.lookAt(state.camera.position);
      }

      // Extreme brightness during flash, then fade back
      const brightnessPhase = flashPhaseProgress < 0.5
        ? 7 + flashPhaseProgress * 2 * 8 // Continue from 7x to 15x
        : 15 - (flashPhaseProgress - 0.5) * 2 * 14; // Fade back

      state.scene.traverse((obj) => {
        if (obj instanceof THREE.PointLight) {
          const targetIntensity = obj.userData.baseIntensity || 50;
          if (flashPhaseProgress < 0.5) {
            obj.intensity = obj.userData.baseIntensity * brightnessPhase;
          } else {
            obj.intensity = THREE.MathUtils.lerp(obj.userData.baseIntensity * 15, targetIntensity, (flashPhaseProgress - 0.5) * 2);
          }
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

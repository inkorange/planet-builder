"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Comet {
  id: string;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  type: "comet" | "ejection";
}

interface ElementParticleEffectsProps {
  elementChanges: Array<{
    symbol: string;
    color: string;
    change: number;
  }>;
}

export function ElementParticleEffects({ elementChanges }: ElementParticleEffectsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cometsRef = useRef<Comet[]>([]);
  const maxComets = 300; // Increased to handle more translucent particles

  // Create comets/ejections when element changes are detected
  useEffect(() => {
    if (!elementChanges || elementChanges.length === 0 || !groupRef.current) return;

    elementChanges.forEach((change) => {
      if (change.change === 0) return;

      // Limit number of active comets
      if (cometsRef.current.length >= maxComets) {
        const oldest = cometsRef.current.shift();
        if (oldest && groupRef.current) {
          groupRef.current.remove(oldest.mesh);
          oldest.mesh.geometry.dispose();
          if (Array.isArray(oldest.mesh.material)) {
            oldest.mesh.material.forEach(m => m.dispose());
          } else {
            oldest.mesh.material.dispose();
          }
        }
      }

      const isComet = change.change > 0;
      const numParticles = Math.min(Math.abs(change.change) * 30, 100); // 30 particles per part, max 100

      for (let i = 0; i < numParticles; i++) {
        // Create geometry - elongated cylinder for streak effect (larger)
        const radius = 0.025 + Math.random() * 0.015; // Increased size
        const length = 0.4 + Math.random() * 0.4; // Longer streaks
        const geometry = new THREE.CylinderGeometry(radius, radius * 0.5, length, 6);

        // Create glowing material with element color and additive blending
        const material = new THREE.MeshBasicMaterial({
          color: change.color,
          transparent: true,
          opacity: 0.3, // Lower opacity for more ethereal look
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, material);

        if (isComet) {
          // Comet: Start from random position outside cloud
          const angle = Math.random() * Math.PI * 2;
          const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
          const distance = 12 + Math.random() * 3;

          // Add spread to create cloud effect
          const spreadRadius = 0.8;
          const spreadX = (Math.random() - 0.5) * spreadRadius;
          const spreadY = (Math.random() - 0.5) * spreadRadius;
          const spreadZ = (Math.random() - 0.5) * spreadRadius;

          mesh.position.set(
            Math.cos(angle) * Math.cos(elevation) * distance + spreadX,
            Math.sin(elevation) * distance + spreadY,
            Math.sin(angle) * Math.cos(elevation) * distance + spreadZ
          );

          // Velocity toward center with slight variation
          const baseVelocity = new THREE.Vector3()
            .subVectors(new THREE.Vector3(0, 0, 0), mesh.position)
            .normalize()
            .multiplyScalar(0.12 + Math.random() * 0.06); // Vary speed slightly

          const velocity = baseVelocity;

          cometsRef.current.push({
            id: `comet-${Date.now()}-${i}`,
            mesh,
            velocity,
            life: 1.0,
            type: "comet",
          });
        } else {
          // Ejection: Start from inside cloud with spread
          const angle = Math.random() * Math.PI * 2;
          const elevation = (Math.random() - 0.5) * Math.PI * 0.5;
          const distance = 0.5 + Math.random() * 1.5;

          // Add spread to create dispersed cloud
          const spreadRadius = 0.5;
          const spreadX = (Math.random() - 0.5) * spreadRadius;
          const spreadY = (Math.random() - 0.5) * spreadRadius;
          const spreadZ = (Math.random() - 0.5) * spreadRadius;

          mesh.position.set(
            Math.cos(angle) * Math.cos(elevation) * distance + spreadX,
            Math.sin(elevation) * distance + spreadY,
            Math.sin(angle) * Math.cos(elevation) * distance + spreadZ
          );

          // Velocity outward with variation
          const baseSpeed = 0.06 + Math.random() * 0.04;
          const velocity = mesh.position.clone().normalize().multiplyScalar(baseSpeed);

          cometsRef.current.push({
            id: `ejection-${Date.now()}-${i}`,
            mesh,
            velocity,
            life: 1.0,
            type: "ejection",
          });
        }

        if (groupRef.current) {
          groupRef.current.add(mesh);
        }
      }
    });
  }, [elementChanges]);

  // Animate comets/ejections
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const deadComets: number[] = [];

    cometsRef.current.forEach((comet, index) => {
      // Update position
      comet.mesh.position.add(comet.velocity.clone().multiplyScalar(delta * 60));

      // Orient cylinder in direction of velocity (streak points forward)
      const direction = comet.velocity.clone().normalize();
      const axis = new THREE.Vector3(0, 1, 0); // Cylinder default is Y-up
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
      comet.mesh.quaternion.copy(quaternion);

      // Update life
      comet.life -= delta * 0.5; // 2 seconds lifetime

      if (comet.life <= 0) {
        deadComets.push(index);
      } else {
        // Fade out
        const material = comet.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = comet.life * 0.3; // Maintain lower opacity

        // For comets, check if reached center
        if (comet.type === "comet" && comet.mesh.position.length() < 1.0) {
          deadComets.push(index);
        }

        // For ejections, check if too far away
        if (comet.type === "ejection" && comet.mesh.position.length() > 15) {
          deadComets.push(index);
        }
      }
    });

    // Remove dead comets (in reverse to maintain indices)
    deadComets.reverse().forEach((index) => {
      const comet = cometsRef.current[index];
      groupRef.current?.remove(comet.mesh);
      comet.mesh.geometry.dispose();
      if (Array.isArray(comet.mesh.material)) {
        comet.mesh.material.forEach(m => m.dispose());
      } else {
        comet.mesh.material.dispose();
      }
      cometsRef.current.splice(index, 1);
    });
  });

  return <group ref={groupRef} />;
}

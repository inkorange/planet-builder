/**
 * GPUParticles - High-performance procedural particle system
 *
 * Renders ~20k particles with GPU-driven motion using curl noise flow fields.
 * All position computation happens in vertex shader - zero CPU overhead per frame.
 *
 * Performance: 60 FPS on mid-range GPUs
 * Style: Wispy, organic "primordial ooze" with swirling motion
 */

import * as THREE from 'three';

export interface ParticleConfig {
  count?: number;          // Number of particles (default: 20000)
  radius?: number;         // Spawn radius (default: 2.5)
  color?: THREE.Color;     // Base color (default: #6096fa)
  size?: number;           // Base particle size (default: 0.8)
  noiseScale?: number;     // Curl noise frequency (default: 0.5)
  curlAmplitude?: number;  // Flow field strength (default: 1.2)
  swirl?: number;          // Azimuthal rotation speed (default: 0.3)
  attract?: number;        // Central attraction force (default: 0.15)
  spinBias?: number;       // Differential rotation by radius (default: 1.5)
}

export class GPUParticles extends THREE.Object3D {
  private points: THREE.Points;
  private material: THREE.ShaderMaterial;
  private elapsedTime = 0;

  constructor(config: ParticleConfig = {}) {
    super();

    const {
      count = 20000,
      radius = 2.5,
      color = new THREE.Color(0x6096fa),
      size = 0.8,
      noiseScale = 0.5,
      curlAmplitude = 1.2,
      swirl = 0.3,
      attract = 0.15,
      spinBias = 1.5,
    } = config;

    // ─────────────────────────────────────────────────────────
    // Generate stable particle attributes (set once, read in GPU)
    // ─────────────────────────────────────────────────────────
    const aPos0 = new Float32Array(count * 3);      // Initial position (stable anchor)
    const aSeed = new Float32Array(count);          // Random seed per particle
    const aSize = new Float32Array(count);          // Size variation
    const aOpacity = new Float32Array(count);       // Opacity variation
    const aColor = new Float32Array(count * 3);     // Per-particle color variation (space dust)

    // Simple 3D noise function for wisp generation
    const noise3D = (x: number, y: number, z: number) => {
      const freq1 = 1.5, freq2 = 2.7, freq3 = 4.3;
      return (
        Math.sin(x * freq1 + y * freq2) * 0.3 +
        Math.sin(y * freq2 + z * freq3) * 0.3 +
        Math.sin(z * freq3 + x * freq1) * 0.4
      );
    };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spherical distribution with power law for denser center
      const sphereRadius = Math.pow(Math.random(), 0.5) * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // Base spherical position
      let x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      let y = sphereRadius * Math.sin(phi) * Math.sin(theta);
      let z = sphereRadius * Math.cos(phi);

      // Generate wispy tendrils - some particles fly out randomly
      const noiseVal = noise3D(x, y, z);
      const isWisp = Math.abs(noiseVal) > 0.3; // ~40% of particles in wisps

      if (isWisp) {
        // Extend particles along noise gradient to create tendrils
        const displacement = noiseVal * 2.5;
        const noiseDX = noise3D(x + 0.1, y, z) - noiseVal;
        const noiseDY = noise3D(x, y + 0.1, z) - noiseVal;
        const noiseDZ = noise3D(x, y, z + 0.1) - noiseVal;

        x += noiseDX * displacement;
        y += noiseDY * displacement;
        z += noiseDZ * displacement;

        // Add extra random variation for irregular wisps
        const extraVariation = (Math.random() - 0.5) * 1.5;
        x += extraVariation * Math.sin(theta);
        y += extraVariation;
        z += extraVariation * Math.cos(theta);
      }

      aPos0[i3 + 0] = x;
      aPos0[i3 + 1] = y;
      aPos0[i3 + 2] = z;

      // Per-particle randomness
      aSeed[i] = Math.random() * 1000.0;

      // Smaller particles in wispy areas for finer detail
      const baseSize = isWisp ? 0.15 : 0.3;
      aSize[i] = baseSize + Math.random() * (isWisp ? 0.8 : 1.7);

      // Opacity: denser in center, more transparent in wisps
      const actualDist = Math.sqrt(x * x + y * y + z * z);
      const distFromCenter = actualDist / (radius * 1.5);
      const wispTransparency = isWisp ? 0.4 : 1.0;
      aOpacity[i] = Math.max(0.05, (1.0 - distFromCenter * 0.6) * wispTransparency);

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

      aColor[i * 3 + 0] = r;
      aColor[i * 3 + 1] = g;
      aColor[i * 3 + 2] = b;
    }

    // ─────────────────────────────────────────────────────────
    // Create sprite texture (soft, glowing particle)
    // ─────────────────────────────────────────────────────────
    let texture: THREE.Texture;

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      texture = new THREE.CanvasTexture(canvas);
    } else {
      // Fallback for SSR - create a simple white texture
      texture = new THREE.Texture();
    }

    // ─────────────────────────────────────────────────────────
    // Shader Material - GPU-driven procedural motion
    // ─────────────────────────────────────────────────────────
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uColor: { value: color },
        uTexture: { value: texture },
        uSize: { value: size },
        uNoiseScale: { value: noiseScale },
        uCurlAmp: { value: curlAmplitude },
        uSwirl: { value: swirl },
        uAttract: { value: attract },
        uSpinBias: { value: spinBias },
      },

      vertexShader: `
        // Attributes (stable, set once)
        attribute vec3 aPos0;      // Initial position
        attribute float aSeed;     // Random seed
        attribute float aSize;     // Size multiplier
        attribute float aOpacity;  // Base opacity
        attribute vec3 aColor;     // Per-particle color (space dust)

        // Uniforms (tunable parameters)
        uniform float uTime;
        uniform float uSize;
        uniform float uNoiseScale;
        uniform float uCurlAmp;
        uniform float uSwirl;
        uniform float uAttract;
        uniform float uSpinBias;

        // Varyings (pass to fragment shader)
        varying float vOpacity;
        varying float vDepth;
        varying vec3 vColor;

        // ───────────────────────────────────────────────────────
        // 3D Simplex-like noise (procedural flow field)
        // ───────────────────────────────────────────────────────
        vec3 hash3(vec3 p) {
          p = fract(p * vec3(443.897, 441.423, 437.195));
          p += dot(p, p.yxz + 19.19);
          return fract((p.xxy + p.yxx) * p.zyx) - 0.5;
        }

        float noise3D(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f); // smoothstep

          float a = dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0));
          float b = dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0));
          float c = dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0));
          float d = dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0));
          float e = dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1));
          float f1 = dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1));
          float g = dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1));
          float h = dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1));

          float k0 = mix(a, b, f.x);
          float k1 = mix(c, d, f.x);
          float k2 = mix(e, f1, f.x);
          float k3 = mix(g, h, f.x);
          float k4 = mix(k0, k1, f.y);
          float k5 = mix(k2, k3, f.y);
          return mix(k4, k5, f.z);
        }

        // Curl noise (divergence-free flow field)
        vec3 curlNoise(vec3 p) {
          float eps = 0.1;
          float n1 = noise3D(p + vec3(0, eps, 0));
          float n2 = noise3D(p - vec3(0, eps, 0));
          float n3 = noise3D(p + vec3(0, 0, eps));
          float n4 = noise3D(p - vec3(0, 0, eps));
          float n5 = noise3D(p + vec3(eps, 0, 0));
          float n6 = noise3D(p - vec3(eps, 0, 0));

          float x = (n1 - n2) - (n3 - n4);
          float y = (n3 - n4) - (n5 - n6);
          float z = (n5 - n6) - (n1 - n2);

          return normalize(vec3(x, y, z));
        }

        void main() {
          // ───────────────────────────────────────────────────
          // Procedural position calculation (entirely on GPU)
          // ───────────────────────────────────────────────────

          // Time-varying noise sample point
          vec3 noisePos = aPos0 * uNoiseScale + vec3(uTime * 0.1);
          vec3 curl = curlNoise(noisePos + aSeed * 0.01);

          // Distance-based effects
          float dist = length(aPos0);
          float distNorm = dist / 2.5;

          // Azimuthal swirl (faster at edges - differential rotation)
          float swirl = uSwirl * (1.0 + distNorm * uSpinBias);
          float angle = swirl * uTime + aSeed * 0.1;
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          vec2 swirledXZ = rot * aPos0.xz;

          // Curl flow displacement
          vec3 flow = curl * uCurlAmp * (1.0 - distNorm * 0.3);

          // Gentle attraction toward center (allows wisps to extend)
          // Weaker for distant particles to let tendrils flow out
          float attractStrength = uAttract * dist * 0.3 * (1.0 - distNorm * 0.7);
          vec3 attract = -normalize(aPos0) * attractStrength;

          // Time-varying organic "breathing" motion
          float breathe = sin(uTime * 0.5 + aSeed) * 0.05;

          // Final position
          vec3 pos = vec3(swirledXZ.x, aPos0.y, swirledXZ.y);
          pos += flow;
          pos += attract;
          pos *= (1.0 + breathe);

          // ───────────────────────────────────────────────────
          // Projection & size calculation
          // ───────────────────────────────────────────────────
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vDepth = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;

          // Size attenuation with depth
          float sizeMult = aSize * uSize;
          gl_PointSize = sizeMult * 200.0 / -mvPosition.z;

          // Opacity with subtle noise variation
          float opacityNoise = noise3D(aPos0 * 2.0 + uTime * 0.2) * 0.3 + 0.7;
          vOpacity = aOpacity * opacityNoise;

          // Pass space dust color to fragment
          vColor = aColor;
        }
      `,

      fragmentShader: `
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        varying float vOpacity;
        varying float vDepth;
        varying vec3 vColor;

        void main() {
          // Soft circular sprite
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float softEdge = smoothstep(0.5, 0.0, dist);

          // Sample sprite texture
          vec4 texColor = texture2D(uTexture, gl_PointCoord);

          // Depth-based atmospheric fade
          float depthFade = 1.0 - smoothstep(5.0, 12.0, vDepth) * 0.4;

          // Use per-particle space dust color with slight global tint
          vec3 dustColor = vColor * (0.8 + vOpacity * 0.2);
          vec3 finalColor = mix(dustColor, uColor * 0.3, 0.1); // 10% global tint

          // Final alpha
          float alpha = texColor.a * softEdge * vOpacity * depthFade * 0.8;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,

      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // ─────────────────────────────────────────────────────────
    // Create geometry and points mesh
    // ─────────────────────────────────────────────────────────
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('aPos0', new THREE.BufferAttribute(aPos0, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(aOpacity, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));

    this.points = new THREE.Points(geometry, this.material);
    this.add(this.points);
  }

  /**
   * Update animation time (call every frame)
   * @param dt Delta time in seconds
   */
  update(dt: number) {
    this.elapsedTime += dt;
    this.material.uniforms.uTime.value = this.elapsedTime;
  }

  /**
   * Update particle color
   */
  setColor(color: THREE.Color) {
    this.material.uniforms.uColor.value = color;
  }

  /**
   * Adjust particle size
   */
  setSize(size: number) {
    this.material.uniforms.uSize.value = size;
  }

  /**
   * Adjust flow field turbulence
   */
  setCurlAmplitude(amp: number) {
    this.material.uniforms.uCurlAmp.value = amp;
  }

  /**
   * Adjust rotation speed
   */
  setSwirl(swirl: number) {
    this.material.uniforms.uSwirl.value = swirl;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.points.geometry.dispose();
    this.material.dispose();
    (this.material.uniforms.uTexture.value as THREE.Texture).dispose();
  }
}

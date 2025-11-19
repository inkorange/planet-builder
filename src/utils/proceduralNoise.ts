/**
 * Procedural noise utilities for terrain generation
 * Uses simplex-like noise for realistic planetary surfaces
 */

// Simple 3D noise function (simplified for performance)
export function noise3D(x: number, y: number, z: number): number {
  // Simple pseudo-random noise based on coordinate hashing
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

// Fractal Brownian Motion (fBm) for natural-looking terrain
export function fbm(x: number, y: number, z: number, octaves: number = 6): number {
  let value = 0.0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxValue = 0.0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value / maxValue;
}

// Ridged multifractal noise for mountain ranges
export function ridgedNoise(x: number, y: number, z: number, octaves: number = 6): number {
  let value = 0.0;
  let amplitude = 1.0;
  let frequency = 1.0;

  for (let i = 0; i < octaves; i++) {
    const n = noise3D(x * frequency, y * frequency, z * frequency);
    const ridge = 1.0 - Math.abs(n * 2.0 - 1.0);
    value += ridge * ridge * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

// GLSL shader snippets for use in materials
export const noiseShaderChunk = `
// Improved 3D hash function for better noise
vec3 hash3(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yxx) * p.zyx);
}

// 3D noise with improved precision
float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(
            mix(hash3(i + vec3(0.0, 0.0, 0.0)).x, hash3(i + vec3(1.0, 0.0, 0.0)).x, f.x),
            mix(hash3(i + vec3(0.0, 1.0, 0.0)).x, hash3(i + vec3(1.0, 1.0, 0.0)).x, f.x),
            f.y
        ),
        mix(
            mix(hash3(i + vec3(0.0, 0.0, 1.0)).x, hash3(i + vec3(1.0, 0.0, 1.0)).x, f.x),
            mix(hash3(i + vec3(0.0, 1.0, 1.0)).x, hash3(i + vec3(1.0, 1.0, 1.0)).x, f.x),
            f.y
        ),
        f.z
    );
}

// Fractal Brownian Motion
float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxValue = 0.0;

    for(int i = 0; i < octaves; i++) {
        value += amplitude * noise3D(p * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    return value / maxValue;
}

// Ridged multifractal for mountains
float ridgedNoise(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;

    for(int i = 0; i < octaves; i++) {
        float n = noise3D(p * frequency);
        float ridge = 1.0 - abs(n * 2.0 - 1.0);
        value += ridge * ridge * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    return value;
}
`;

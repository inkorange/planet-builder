/**
 * Star color temperature utilities
 * Maps spectral types to color temperatures and RGB values
 */

export interface StarColorData {
  temperature: number; // Kelvin
  color: string; // Hex color
  rgb: { r: number; g: number; b: number };
}

// Star spectral types with their approximate temperatures and colors
// Based on astronomical data
export const STAR_COLORS: Record<string, StarColorData> = {
  O: {
    temperature: 30000, // Very hot blue stars
    color: "#9bb0ff",
    rgb: { r: 0.607, g: 0.690, b: 1.0 },
  },
  B: {
    temperature: 15000, // Hot blue-white stars
    color: "#aabfff",
    rgb: { r: 0.666, g: 0.749, b: 1.0 },
  },
  A: {
    temperature: 8500, // White stars
    color: "#cad7ff",
    rgb: { r: 0.792, g: 0.843, b: 1.0 },
  },
  F: {
    temperature: 6500, // Yellow-white stars
    color: "#f8f7ff",
    rgb: { r: 0.972, g: 0.969, b: 1.0 },
  },
  G: {
    temperature: 5500, // Yellow stars (like our Sun)
    color: "#fff4ea",
    rgb: { r: 1.0, g: 0.957, b: 0.918 },
  },
  K: {
    temperature: 4000, // Orange stars
    color: "#ffd2a1",
    rgb: { r: 1.0, g: 0.823, b: 0.631 },
  },
  M: {
    temperature: 3000, // Cool red stars
    color: "#ffcc6f",
    rgb: { r: 1.0, g: 0.8, b: 0.435 },
  },
};

/**
 * Get star color data for a given spectral type
 */
export function getStarColor(starType: string): StarColorData {
  return STAR_COLORS[starType] || STAR_COLORS["G"]; // Default to Sun-like
}

/**
 * Convert temperature to approximate RGB color
 * Uses blackbody radiation approximation
 */
export function temperatureToColor(temp: number): { r: number; g: number; b: number } {
  // Simplified blackbody color calculation
  temp = temp / 100;

  let r, g, b;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
  }
  g = Math.max(0, Math.min(255, g));

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };
}

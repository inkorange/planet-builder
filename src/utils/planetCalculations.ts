import { ELEMENTS, STAR_TYPES } from "@/data/elements";

/**
 * Calculate the aggregate cloud color based on element composition
 */
export function calculateCloudColor(elementParts: Record<string, number>): string {
  const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);

  // Default color if no elements
  if (totalParts === 0) {
    return "#8B7355"; // Space dust brown
  }

  let r = 0, g = 0, b = 0;

  // Calculate weighted average of element colors
  ELEMENTS.forEach((element) => {
    const parts = elementParts[element.symbol] || 0;
    if (parts > 0) {
      const weight = parts / totalParts;
      const color = hexToRgb(element.color);
      r += color.r * weight;
      g += color.g * weight;
      b += color.b * weight;
    }
  });

  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

/**
 * Calculate luminosity based on star type
 */
export function calculateLuminosity(starType: string): number {
  const starData = STAR_TYPES.find(s => s.type === starType);

  // Luminosity mapping based on star class
  const luminosityMap: Record<string, number> = {
    O: 5.0,   // Blue supergiant - extremely bright
    B: 3.0,   // Blue giant - very bright
    A: 2.0,   // Blue-white - bright
    F: 1.5,   // White - moderately bright
    G: 1.0,   // Yellow (Sun-like) - baseline
    K: 0.7,   // Orange - dimmer
    M: 0.4,   // Red dwarf - very dim
  };

  return luminosityMap[starType] || 1.0;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 139, g: 115, b: 85 }; // Default space dust color
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
}

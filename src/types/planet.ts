// Element types based on PROJECT.md
export type ElementSymbol =
  | "H"  // Hydrogen
  | "He" // Helium
  | "O"  // Oxygen
  | "C"  // Carbon
  | "Si" // Silicon
  | "Fe" // Iron
  | "Mg" // Magnesium
  | "S"  // Sulfur
  | "N"  // Nitrogen
  | "Al" // Aluminum
  | "Ca" // Calcium
  | "Na" // Sodium
  | "K"  // Potassium
  | "P"  // Phosphorus
  | "Ni"; // Nickel

export interface Element {
  symbol: ElementSymbol;
  name: string;
  percentage: number; // 0-100
  color: string; // Hex color for visualization
  description: string;
}

// Star types from PROJECT.md Environmental Considerations
export type StarType = "O" | "B" | "A" | "F" | "G" | "K" | "M";

export interface StarProperties {
  type: StarType;
  name: string;
  temperature: number; // Kelvin
  luminosity: number; // Relative to Sun
  color: string; // Hex color for rendering
}

// Environmental parameters for planet configuration
export interface PlanetConfiguration {
  elements: Element[];
  distanceFromStar: number; // AU (0.1 - 10)
  starType: StarType;
  initialMass: number; // Earth masses (0.1 - 100)
  rotationSpeed: number; // hours (1 - 2400 for 100 days)
}

// Planet classification types based on Phase 7
export type PlanetType =
  | "gas-giant"
  | "rocky"
  | "ice-world"
  | "lava-world"
  | "water-world"
  | "venus-like"
  | "earth-like";

export interface AtmosphericComposition {
  nitrogen?: number;
  oxygen?: number;
  carbonDioxide?: number;
  methane?: number;
  hydrogen?: number;
  helium?: number;
  water?: number;
  sulfurDioxide?: number;
  other?: number;
}

// Final planet state after simulation
export interface PlanetResult {
  type: PlanetType;
  temperature: number; // Kelvin or Celsius
  atmosphericComposition: AtmosphericComposition;
  finalMass: number; // Earth masses
  diameter: number; // km
  geologicalActivity: string; // Description of activity type
  lifeSustainable: boolean;
  summary?: string; // AI-generated summary
}

// Complete planet data including configuration and results
export interface Planet {
  id: string;
  name?: string;
  configuration: PlanetConfiguration;
  result?: PlanetResult;
  createdAt: Date;
}

// Timeframe for the bottom panel display
export interface SimulationTimeframe {
  yearsAgo: number; // 5 billion to 0
  displayText: string;
}

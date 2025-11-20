/**
 * Planet simulation logic based on element composition, distance, star type, mass, and rotation
 * References: PLANET_CREATIONS.md and example planet files in .claude/skills/
 */

export type PlanetType =
  | "gas-giant"
  | "ice-giant"
  | "rocky-terrestrial"
  | "ice-world"
  | "lava-world"
  | "water-world"
  | "venus-like"
  | "earth-like"
  | "barren";

export interface PlanetClassification {
  type: PlanetType;
  temperature: number; // Kelvin
  atmosphereType: string;
  surfaceDescription: string;
  hasLife: boolean;
  hasMagneticField: boolean;
  magneticFieldStrength: number; // 0-100, based on mass and rotation
  geologicalActivity: "none" | "low" | "moderate" | "high" | "extreme";
  color: string; // Hex color for planet appearance
}

interface PlanetParameters {
  elementParts: Record<string, number>;
  distanceFromStar: number; // AU
  starType: string; // O, B, A, F, G, K, M
  mass: number; // Earth masses
  rotationSpeed: number; // hours per day
}

/**
 * Calculate equilibrium temperature based on star type and distance
 * Reference: PLANET_CREATIONS.md - Temperature section
 */
function calculateEquilibriumTemperature(
  starType: string,
  distance: number
): number {
  // Stellar luminosity relative to Sun
  const luminosityMap: Record<string, number> = {
    O: 100000,
    B: 10000,
    A: 40,
    F: 6,
    G: 1, // Sun-like
    K: 0.4,
    M: 0.04,
  };

  const L = luminosityMap[starType] || 1;
  const albedo = 0.3; // Average planetary albedo
  const stefanBoltzmann = 5.67e-8;

  // T_eq = ((1 - A) * L / (16 * π * σ * d²))^(1/4)
  // Simplified formula in Kelvin
  const T_eq = 278 * Math.pow(L / (distance * distance), 0.25);

  return T_eq;
}

/**
 * Determine if planet can retain atmosphere based on mass, temperature, and composition
 */
function canRetainAtmosphere(
  mass: number,
  temperature: number,
  elementParts: Record<string, number>
): boolean {
  // Check if planet has atmospheric gases
  const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);
  if (totalParts === 0) return false;

  const getPercent = (symbol: string) =>
    ((elementParts[symbol] || 0) / totalParts) * 100;

  const atmosphericGases = getPercent("N") + getPercent("O") + getPercent("C") +
                          getPercent("H") + getPercent("He");

  // Need some atmospheric gases to have an atmosphere
  if (atmosphericGases < 5) return false;

  // Escape velocity proportional to sqrt(mass)
  // Molecules move faster at higher temperatures

  // Very low mass planets (< 0.1 Earth masses) can't retain atmosphere
  if (mass < 0.1) return false;

  // Low mass planets (0.1-0.5) can retain heavy molecules (CO2, N2) but not H2/He
  if (mass < 0.5) {
    // Can retain CO2, N2, O2 if not too hot
    if (temperature > 700) return false;
    return true;
  }

  // Earth-mass and larger planets can retain most atmospheres
  // unless extremely hot (>1500K where even heavy molecules escape)
  if (temperature > 1500) return false;

  // Magnetic field helps retain atmosphere (mass and rotation dependent)
  // But we'll allow atmospheres even without magnetic fields if conditions are right

  return true;
}

/**
 * Check if planet has magnetic field based on mass and rotation
 * Reference: PLANET_CREATIONS.md - Magnetic field generation section
 */
function hasMagneticField(mass: number, rotationHours: number): boolean {
  // Needs sufficient mass for molten core and reasonable rotation
  // Low mass planets cool too quickly
  // Very slow rotation doesn't generate strong dynamo
  if (mass < 0.5) return false; // Too small, core solidified
  if (mass > 10) return true; // Large planets maintain molten cores
  if (rotationHours > 100) return false; // Too slow for dynamo

  return true;
}

/**
 * Calculate magnetic field strength (0-100) based on mass and rotation
 * Strong fields require:
 * - Sufficient mass for molten metallic core (dynamo)
 * - Fast rotation to drive the dynamo effect
 */
function calculateMagneticFieldStrength(mass: number, rotationHours: number): number {
  // No field if planet doesn't meet basic criteria
  if (!hasMagneticField(mass, rotationHours)) return 0;

  let strength = 0;

  // Mass contribution (0-50 points)
  // Larger mass = more heat retention = longer-lived dynamo
  // 10+ Earth masses = maximum strength from mass
  strength += Math.min((mass / 10) * 50, 50);

  // Rotation contribution (0-50 points)
  // Faster rotation = stronger dynamo effect
  // Earth rotates in 24 hours (baseline)
  // 1 hour rotation = maximum strength from rotation
  const rotationFactor = Math.max(0, 1 - (rotationHours / 100));
  strength += rotationFactor * 50;

  return Math.min(Math.max(Math.round(strength), 0), 100);
}

/**
 * Classify planet based on composition and environmental parameters
 */
export function classifyPlanet(params: PlanetParameters): PlanetClassification {
  const { elementParts, distanceFromStar, starType, mass, rotationSpeed } =
    params;

  // Calculate total parts
  const totalParts = Object.values(elementParts).reduce(
    (sum, val) => sum + val,
    0
  );

  if (totalParts === 0) {
    return {
      type: "barren",
      temperature: calculateEquilibriumTemperature(starType, distanceFromStar),
      atmosphereType: "None",
      surfaceDescription: "Empty void - no elements added",
      hasLife: false,
      hasMagneticField: false,
      magneticFieldStrength: 0,
      geologicalActivity: "none",
      color: "#2a2a2a",
    };
  }

  // Calculate elemental percentages
  const getPercent = (symbol: string) =>
    ((elementParts[symbol] || 0) / totalParts) * 100;

  const H = getPercent("H");
  const He = getPercent("He");
  const O = getPercent("O");
  const C = getPercent("C");
  const Si = getPercent("Si");
  const Fe = getPercent("Fe");
  const Mg = getPercent("Mg");
  const S = getPercent("S");
  const N = getPercent("N");
  const P = getPercent("P");

  const temperature = calculateEquilibriumTemperature(
    starType,
    distanceFromStar
  );
  const hasAtmosphere = canRetainAtmosphere(mass, temperature, elementParts);
  const hasMagField = hasMagneticField(mass, rotationSpeed);
  const magFieldStrength = calculateMagneticFieldStrength(mass, rotationSpeed);

  // Determine geological activity
  let geologicalActivity: "none" | "low" | "moderate" | "high" | "extreme" =
    "none";
  if (mass > 5) geologicalActivity = "extreme";
  else if (mass > 2) geologicalActivity = "high";
  else if (mass > 0.8) geologicalActivity = "moderate";
  else if (mass > 0.3) geologicalActivity = "low";

  // === CLASSIFICATION LOGIC ===

  // 1. GAS GIANT: High H/He, high mass
  if ((H + He > 60) && mass > 10) {
    return {
      type: "gas-giant",
      temperature,
      atmosphereType: "Hydrogen and helium dominated with trace methane and ammonia",
      surfaceDescription:
        "No solid surface - thick gaseous envelope with possible rocky core deep within",
      hasLife: false,
      hasMagneticField: true,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: "extreme",
      color: "#d4a574", // Jupiter-like tan/brown
    };
  }

  // 2. ICE GIANT: Moderate H/He, high O/C/N (ices), medium-high mass
  if (mass > 5 && mass < 20 && (O + C + N) > 30) {
    return {
      type: "ice-giant",
      temperature,
      atmosphereType: "Hydrogen and helium with water, methane, and ammonia ices",
      surfaceDescription:
        "Icy mantle surrounding rocky core, with hydrogen-helium atmosphere",
      hasLife: false,
      hasMagneticField: true,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: "moderate",
      color: "#4a90e2", // Neptune-like blue
    };
  }

  // 3. LAVA WORLD: Close to star (< 0.5 AU) OR very high temperature
  if (distanceFromStar < 0.5 || temperature > 1000) {
    return {
      type: "lava-world",
      temperature,
      atmosphereType: hasAtmosphere
        ? "Vaporized rock and metals"
        : "Minimal - too hot to retain",
      surfaceDescription:
        "Molten surface with lava flows, volcanic activity everywhere",
      hasLife: false,
      hasMagneticField: hasMagField,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: "extreme",
      color: "#ff4500", // Molten orange-red
    };
  }

  // 4. VENUS-LIKE: Hot (500-800K), high CO2, thick atmosphere, runaway greenhouse
  if (
    temperature > 500 &&
    temperature < 800 &&
    C > 10 &&
    O > 15 &&
    hasAtmosphere
  ) {
    return {
      type: "venus-like",
      temperature,
      atmosphereType:
        "Dense CO₂ atmosphere with sulfuric acid clouds, extreme greenhouse effect",
      surfaceDescription:
        "Rocky surface with volcanic plains, extreme pressure and heat",
      hasLife: false,
      hasMagneticField: hasMagField,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: geologicalActivity,
      color: "#e8b870", // Yellowish-tan
    };
  }

  // 5. ICE WORLD: Far from star (> 3 AU) OR very cold (< 200K), has water
  if ((distanceFromStar > 3 || temperature < 200) && O > 20) {
    return {
      type: "ice-world",
      temperature,
      atmosphereType: hasAtmosphere
        ? "Thin nitrogen and methane atmosphere"
        : "Minimal or none",
      surfaceDescription:
        "Frozen surface covered in water ice, possible subsurface ocean if tidal heating present",
      hasLife: false, // Could have subsurface life, but we'll keep it simple
      hasMagneticField: hasMagField,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: mass > 0.5 ? "low" : "none",
      color: "#b0e0ff", // Icy blue-white
    };
  }

  // 6. WATER WORLD: Goldilocks zone (250-350K), abundant O and H, good mass
  if (
    temperature > 250 &&
    temperature < 350 &&
    O > 25 &&
    (H > 10 || O + H > 40) &&
    mass > 0.5 &&
    mass < 3
  ) {
    return {
      type: "water-world",
      temperature,
      atmosphereType: "Nitrogen and oxygen with water vapor, mild greenhouse effect",
      surfaceDescription:
        "Vast oceans covering most of the surface, scattered islands or archipelagos",
      hasLife: true, // High potential for life
      hasMagneticField: hasMagField,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: geologicalActivity,
      color: "#0077be", // Deep ocean blue
    };
  }

  // 7. EARTH-LIKE: Balanced composition, habitable zone, good mass, has all CHNOPS elements
  if (
    temperature > 250 &&
    temperature < 350 &&
    mass > 0.7 &&
    mass < 2 &&
    Si > 10 && // Rocky crust
    Fe > 5 && // Iron core
    O > 20 && // Oxygen for water and atmosphere
    N > 5 && // Nitrogen atmosphere
    C > 2 && // Carbon for life
    hasAtmosphere &&
    hasMagField
  ) {
    // Check for phosphorus (life indicator)
    const hasLifeElements = P > 0.5;

    return {
      type: "earth-like",
      temperature,
      atmosphereType:
        "Nitrogen-oxygen atmosphere with trace CO₂, water vapor, and argon",
      surfaceDescription:
        "Rocky surface with continents, oceans, and active plate tectonics. Diverse biomes if life present.",
      hasLife: hasLifeElements,
      hasMagneticField: true,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: "moderate",
      color: "#2e8b57", // Earth green-blue
    };
  }

  // 8. ROCKY TERRESTRIAL: Default for rocky compositions (Si, Fe, Mg dominated)
  if (Si + Fe + Mg > 30) {
    return {
      type: "rocky-terrestrial",
      temperature,
      atmosphereType: hasAtmosphere
        ? "Thin CO₂ and nitrogen atmosphere"
        : "Minimal or none",
      surfaceDescription:
        "Rocky surface with impact craters, possible volcanic features",
      hasLife: false,
      hasMagneticField: hasMagField,
      magneticFieldStrength: magFieldStrength,
      geologicalActivity: geologicalActivity,
      color: "#8b7355", // Mars-like rust/brown
    };
  }

  // 9. BARREN: Fallback for unusual compositions
  return {
    type: "barren",
    temperature,
    atmosphereType: hasAtmosphere ? "Trace gases" : "None",
    surfaceDescription: "Barren rocky surface with unusual elemental composition",
    hasLife: false,
    hasMagneticField: hasMagField,
    magneticFieldStrength: magFieldStrength,
    geologicalActivity: geologicalActivity,
    color: "#5a5a5a",
  };
}

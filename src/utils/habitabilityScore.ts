import type { PlanetClassification } from "./planetSimulation";

export interface HabitabilityBreakdown {
  totalScore: number; // 0-100
  factors: {
    temperature: { score: number; reason: string };
    atmosphere: { score: number; reason: string };
    water: { score: number; reason: string };
    magneticField: { score: number; reason: string };
    geology: { score: number; reason: string };
    chemistry: { score: number; reason: string };
  };
  rating: "Uninhabitable" | "Extremely Harsh" | "Marginal" | "Habitable" | "Highly Habitable";
}

/**
 * Calculate detailed habitability score with breakdown
 */
export function calculateHabitabilityScore(
  classification: PlanetClassification,
  elementParts: Record<string, number>
): HabitabilityBreakdown {
  const factors = {
    temperature: scoreTemperature(classification.temperature),
    atmosphere: scoreAtmosphere(classification),
    water: scoreWater(elementParts, classification),
    magneticField: scoreMagneticField(classification),
    geology: scoreGeology(classification),
    chemistry: scoreChemistry(elementParts, classification),
  };

  const totalScore = Math.round(
    (factors.temperature.score +
      factors.atmosphere.score +
      factors.water.score +
      factors.magneticField.score +
      factors.geology.score +
      factors.chemistry.score) /
      6
  );

  const rating = getRating(totalScore);

  return {
    totalScore,
    factors,
    rating,
  };
}

function scoreTemperature(temp: number): { score: number; reason: string } {
  if (temp >= 273 && temp <= 310) {
    return {
      score: 100,
      reason: "Optimal temperature range for liquid water and life",
    };
  } else if (temp >= 250 && temp <= 350) {
    return {
      score: 70,
      reason: "Challenging but potentially habitable temperature",
    };
  } else if (temp >= 200 && temp <= 400) {
    return {
      score: 40,
      reason: "Extreme temperature - very difficult for life",
    };
  } else if (temp < 100) {
    return {
      score: 10,
      reason: "Frozen world - minimal potential for complex life",
    };
  } else if (temp > 500) {
    return {
      score: 5,
      reason: "Scorching temperatures - hostile to known life",
    };
  } else {
    return {
      score: 20,
      reason: "Temperature outside habitable range",
    };
  }
}

function scoreAtmosphere(classification: PlanetClassification): {
  score: number;
  reason: string;
} {
  const atmType = classification.atmosphereType;

  // Check if atmosphere is absent
  if (atmType === "None" || atmType === "Minimal or none" || atmType.includes("Minimal")) {
    return {
      score: 10,
      reason: "No atmosphere - exposed to radiation and temperature extremes",
    };
  }

  // Check atmosphere composition from the atmosphereType string
  const hasNitrogen = atmType.includes("Nitrogen") || atmType.includes("nitrogen") || atmType.includes("N₂");
  const hasOxygen = atmType.includes("Oxygen") || atmType.includes("oxygen") || atmType.includes("O₂");
  const hasCO2 = atmType.includes("CO₂") || atmType.includes("carbon dioxide");
  const hasHydrogen = atmType.includes("Hydrogen") || atmType.includes("hydrogen") || atmType.includes("H₂");

  if (hasNitrogen && hasOxygen) {
    return {
      score: 100,
      reason: "Nitrogen-oxygen atmosphere - breathable and protective",
    };
  } else if (hasNitrogen) {
    return {
      score: 70,
      reason: "Nitrogen atmosphere provides protection but not breathable",
    };
  } else if (hasCO2 && classification.temperature < 350) {
    return {
      score: 50,
      reason: "CO₂ atmosphere with moderate greenhouse effect",
    };
  } else if (hasCO2 && classification.temperature >= 350) {
    return {
      score: 35,
      reason: "Dense CO₂ atmosphere with extreme greenhouse effect",
    };
  } else if (hasHydrogen) {
    return {
      score: 30,
      reason: "Hydrogen-rich atmosphere typical of gas giants",
    };
  } else {
    return {
      score: 40,
      reason: "Atmosphere present but composition not ideal for life",
    };
  }
}

function scoreWater(
  elementParts: Record<string, number>,
  classification: PlanetClassification
): { score: number; reason: string } {
  const H = elementParts.H || 0;
  const O = elementParts.O || 0;
  const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);

  const waterPotential = Math.min(H, O * 2) / totalParts;

  if (waterPotential > 0.15 && classification.temperature >= 273 && classification.temperature <= 373) {
    return {
      score: 100,
      reason: "Abundant liquid water at surface temperature",
    };
  } else if (waterPotential > 0.1) {
    if (classification.temperature < 273) {
      return {
        score: 60,
        reason: "Water present but mostly frozen",
      };
    } else if (classification.temperature > 373) {
      return {
        score: 50,
        reason: "Water present but likely as steam",
      };
    } else {
      return {
        score: 90,
        reason: "Good water content with liquid potential",
      };
    }
  } else if (waterPotential > 0.05) {
    return {
      score: 50,
      reason: "Limited water content",
    };
  } else {
    return {
      score: 20,
      reason: "Very dry - minimal water",
    };
  }
}

function scoreMagneticField(classification: PlanetClassification): {
  score: number;
  reason: string;
} {
  if (classification.hasMagneticField) {
    return {
      score: 100,
      reason: "Magnetic field provides radiation protection",
    };
  } else {
    return {
      score: 30,
      reason: "No magnetic field - vulnerable to solar radiation",
    };
  }
}

function scoreGeology(classification: PlanetClassification): {
  score: number;
  reason: string;
} {
  const activity = classification.geologicalActivity;

  if (activity === "high" || activity === "moderate") {
    return {
      score: 90,
      reason: "Active geology recycles nutrients and drives carbon cycle",
    };
  } else if (activity === "low") {
    return {
      score: 60,
      reason: "Some geological activity provides slow nutrient cycling",
    };
  } else if (activity === "extreme") {
    return {
      score: 40,
      reason: "Extreme volcanic activity may be hazardous",
    };
  } else {
    return {
      score: 30,
      reason: "Geologically dead - no nutrient recycling",
    };
  }
}

function scoreChemistry(
  elementParts: Record<string, number>,
  classification: PlanetClassification
): { score: number; reason: string } {
  const hasCHNOPS =
    (elementParts.C || 0) > 0 &&
    (elementParts.H || 0) > 0 &&
    (elementParts.N || 0) > 0 &&
    (elementParts.O || 0) > 0 &&
    (elementParts.P || 0) > 0 &&
    (elementParts.S || 0) > 0;

  if (hasCHNOPS) {
    return {
      score: 100,
      reason: "All CHNOPS elements present - building blocks of life",
    };
  }

  const hasCHNO =
    (elementParts.C || 0) > 0 &&
    (elementParts.H || 0) > 0 &&
    (elementParts.N || 0) > 0 &&
    (elementParts.O || 0) > 0;

  if (hasCHNO) {
    return {
      score: 80,
      reason: "Core organic elements (CHNO) present",
    };
  }

  const hasOrganicPotential =
    (elementParts.C || 0) > 0 && (elementParts.H || 0) > 0;

  if (hasOrganicPotential) {
    return {
      score: 50,
      reason: "Carbon and hydrogen present - organic chemistry possible",
    };
  }

  return {
    score: 20,
    reason: "Limited organic chemistry potential",
  };
}

function getRating(score: number): HabitabilityBreakdown["rating"] {
  if (score >= 80) return "Highly Habitable";
  if (score >= 60) return "Habitable";
  if (score >= 40) return "Marginal";
  if (score >= 20) return "Extremely Harsh";
  return "Uninhabitable";
}

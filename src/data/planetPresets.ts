/**
 * Planet presets for quick configuration
 * Each preset includes element composition, environmental parameters, and metadata
 */

export interface PlanetPreset {
  id: string;
  name: string;
  description: string;
  elementParts: Record<string, number>;
  mass: number; // Earth masses
  distance: number; // AU
  starType: string;
  rotationSpeed: number; // hours
}

export const PLANET_PRESETS: PlanetPreset[] = [
  {
    id: "earth",
    name: "Earth-like",
    description: "Balanced continents and oceans with potential for life",
    elementParts: {
      Si: 20,
      Fe: 10,
      O: 25,
      N: 10,
      C: 5,
      H: 5,
      P: 2,
      Mg: 3,
    },
    mass: 1.0,
    distance: 1.0,
    starType: "G",
    rotationSpeed: 24,
  },
  {
    id: "water-world",
    name: "Water World",
    description: "Ocean planet with scattered islands",
    elementParts: {
      O: 35,
      H: 15,
      Si: 10,
      Fe: 8,
      N: 10,
      C: 5,
      Mg: 2,
    },
    mass: 1.2,
    distance: 1.1,
    starType: "G",
    rotationSpeed: 20,
  },
  {
    id: "mars",
    name: "Mars-like",
    description: "Cold, rocky desert with thin atmosphere",
    elementParts: {
      Si: 25,
      Fe: 15,
      Mg: 10,
      O: 15,
      C: 5,
      N: 3,
    },
    mass: 0.4,
    distance: 1.5,
    starType: "G",
    rotationSpeed: 25,
  },
  {
    id: "venus",
    name: "Venus-like",
    description: "Hot, toxic atmosphere with runaway greenhouse effect",
    elementParts: {
      C: 20,
      O: 25,
      Si: 15,
      Fe: 10,
      S: 8,
      N: 5,
    },
    mass: 0.9,
    distance: 0.7,
    starType: "G",
    rotationSpeed: 2400,
  },
  {
    id: "lava-world",
    name: "Lava World",
    description: "Scorched world with molten surface",
    elementParts: {
      Si: 20,
      Fe: 20,
      Mg: 15,
      O: 10,
      S: 10,
    },
    mass: 1.5,
    distance: 0.3,
    starType: "G",
    rotationSpeed: 12,
  },
  {
    id: "ice-world",
    name: "Ice World",
    description: "Frozen planet far from its star",
    elementParts: {
      O: 30,
      H: 15,
      Si: 15,
      Fe: 10,
      N: 10,
      C: 5,
    },
    mass: 0.8,
    distance: 4.0,
    starType: "G",
    rotationSpeed: 18,
  },
  {
    id: "super-earth",
    name: "Super-Earth",
    description: "Large rocky planet with strong gravity",
    elementParts: {
      Si: 22,
      Fe: 18,
      Mg: 12,
      O: 20,
      N: 8,
      C: 5,
      P: 1,
    },
    mass: 3.5,
    distance: 1.2,
    starType: "K",
    rotationSpeed: 16,
  },
  {
    id: "gas-giant",
    name: "Gas Giant",
    description: "Massive planet with thick hydrogen atmosphere",
    elementParts: {
      H: 50,
      He: 30,
      O: 5,
      C: 5,
      N: 3,
    },
    mass: 10.0,
    distance: 5.0,
    starType: "G",
    rotationSpeed: 10,
  },
  {
    id: "hot-jupiter",
    name: "Hot Jupiter",
    description: "Gas giant orbiting very close to its star",
    elementParts: {
      H: 55,
      He: 35,
      C: 3,
      O: 2,
    },
    mass: 10.0,
    distance: 0.05,
    starType: "F",
    rotationSpeed: 48,
  },
  {
    id: "desert-world",
    name: "Desert World",
    description: "Dry rocky planet with minimal water",
    elementParts: {
      Si: 30,
      Fe: 15,
      Mg: 12,
      O: 10,
      N: 5,
      C: 3,
    },
    mass: 0.9,
    distance: 1.3,
    starType: "K",
    rotationSpeed: 28,
  },
];

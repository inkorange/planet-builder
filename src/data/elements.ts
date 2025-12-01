export interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  color: string; // Hex color for visual representation
  defaultPercentage: number;
  category: "gas" | "metal" | "nonmetal" | "metalloid";
  description: string;
}

export const ELEMENTS: Element[] = [
  {
    symbol: "H",
    name: "Hydrogen",
    atomicNumber: 1,
    color: "#B0C4DE",
    defaultPercentage: 0,
    category: "gas",
    description:
      "Most abundant element in the universe. Forms gas giants and water.",
  },
  {
    symbol: "He",
    name: "Helium",
    atomicNumber: 2,
    color: "#FFD700",
    defaultPercentage: 0,
    category: "gas",
    description:
      "Product of stellar fusion, major component of gas giants.",
  },
  {
    symbol: "O",
    name: "Oxygen",
    atomicNumber: 8,
    color: "#87CEEB",
    defaultPercentage: 0,
    category: "nonmetal",
    description:
      "Essential for rocky planets and life. Forms water and oxides.",
  },
  {
    symbol: "C",
    name: "Carbon",
    atomicNumber: 6,
    color: "#4169E1", // Royal blue for methane's signature blue color
    defaultPercentage: 0,
    category: "nonmetal",
    description:
      "Backbone of organic chemistry. Combines with hydrogen to form methane (CH₄), giving ice giants their blue color.",
  },
  {
    symbol: "Si",
    name: "Silicon",
    atomicNumber: 14,
    color: "#8B7355",
    defaultPercentage: 0,
    category: "metalloid",
    description:
      "Cornerstone of planetary crusts. Dominates rocky planets.",
  },
  {
    symbol: "Fe",
    name: "Iron",
    atomicNumber: 26,
    color: "#B87333",
    defaultPercentage: 0,
    category: "metal",
    description:
      "Defining element of planetary cores. Generates magnetic fields.",
  },
  {
    symbol: "Mg",
    name: "Magnesium",
    atomicNumber: 12,
    color: "#90EE90",
    defaultPercentage: 0,
    category: "metal",
    description:
      "Common in mantles and crusts. Shapes tectonic motion.",
  },
  {
    symbol: "S",
    name: "Sulfur",
    atomicNumber: 16,
    color: "#FFFF00",
    defaultPercentage: 0,
    category: "nonmetal",
    description:
      "Contributes to volcanic emissions and mineralization.",
  },
  {
    symbol: "N",
    name: "Nitrogen",
    atomicNumber: 7,
    color: "#ADD8E6",
    defaultPercentage: 0,
    category: "gas",
    description:
      "Key atmospheric regulator. Combines with hydrogen to form ammonia (NH₃) in gas giants.",
  },
  {
    symbol: "Al",
    name: "Aluminum",
    atomicNumber: 13,
    color: "#D3D3D3",
    defaultPercentage: 0,
    category: "metal",
    description:
      "Helps define crustal composition and continental formation.",
  },
  {
    symbol: "Ca",
    name: "Calcium",
    atomicNumber: 20,
    color: "#FFE4B5",
    defaultPercentage: 0,
    category: "metal",
    description:
      "Important in rock formation. Regulates carbon storage.",
  },
  {
    symbol: "Ar",
    name: "Argon",
    atomicNumber: 18,
    color: "#E0B0FF", // Mauve/lavender
    defaultPercentage: 0,
    category: "gas",
    description:
      "Noble gas common in planetary atmospheres. Third most abundant gas in Earth's atmosphere.",
  },
  {
    symbol: "K",
    name: "Potassium",
    atomicNumber: 19,
    color: "#DDA0DD",
    defaultPercentage: 0,
    category: "metal",
    description:
      "Radioactive heat source. Drives internal heat and tectonics.",
  },
  {
    symbol: "P",
    name: "Phosphorus",
    atomicNumber: 15,
    color: "#FF6347",
    defaultPercentage: 0,
    category: "nonmetal",
    description:
      "Critical for life. Forms DNA, ATP, and cell membranes.",
  },
  {
    symbol: "Ni",
    name: "Nickel",
    atomicNumber: 28,
    color: "#C0C0C0",
    defaultPercentage: 0,
    category: "metal",
    description:
      "Paired with iron in cores. Contributes to magnetism.",
  },
];

export const STAR_TYPES = [
  { type: "O", name: "Blue Supergiant", temperature: "30,000+ K", color: "#9BB0FF" },
  { type: "B", name: "Blue Giant", temperature: "10,000-30,000 K", color: "#AAB FFF" },
  { type: "A", name: "Blue-White", temperature: "7,500-10,000 K", color: "#CAD7FF" },
  { type: "F", name: "White", temperature: "6,000-7,500 K", color: "#F8F7FF" },
  { type: "G", name: "Yellow (Sun-like)", temperature: "5,200-6,000 K", color: "#FFF4EA" },
  { type: "K", name: "Orange", temperature: "3,700-5,200 K", color: "#FFD2A1" },
  { type: "M", name: "Red Dwarf", temperature: "2,400-3,700 K", color: "#FFB FFF" },
];

/**
 * Educational information about each element's role in planetary formation
 */

export interface ElementEducation {
  symbol: string;
  role: string;
  planetaryFunction: string;
  abundance: string;
  effects: string[];
  realWorldExample: string;
}

export const ELEMENT_EDUCATION: Record<string, ElementEducation> = {
  H: {
    symbol: "H",
    role: "Atmospheric Gas & Water",
    planetaryFunction: "Forms water (H₂O) with oxygen, creates hydrogen-rich atmospheres, fuel for gas giants",
    abundance: "Most abundant element in the universe",
    effects: [
      "Essential for water formation",
      "Creates thick atmospheres on massive planets",
      "Can cause greenhouse warming",
    ],
    realWorldExample: "Jupiter is 90% hydrogen; Earth's oceans are 11% hydrogen by mass",
  },
  He: {
    symbol: "He",
    role: "Atmospheric Gas",
    planetaryFunction: "Inert gas that forms outer atmospheres of gas giants, provides thermal insulation",
    abundance: "Second most abundant element in the universe",
    effects: [
      "Makes up gas giant atmospheres",
      "Chemically inert - doesn't react",
      "Light gas that escapes small planets",
    ],
    realWorldExample: "Jupiter's atmosphere is 10% helium; escapes Earth's gravity",
  },
  O: {
    symbol: "O",
    role: "Water & Rock Formation",
    planetaryFunction: "Forms water, silicate rocks, and breathable atmospheres; key to habitability",
    abundance: "Third most abundant in universe, most abundant in Earth's crust",
    effects: [
      "Creates water when combined with hydrogen",
      "Forms rocky minerals (silicates, oxides)",
      "Essential for life as we know it",
    ],
    realWorldExample: "Earth is 46% oxygen by mass; Mars has oxygen in rocks and thin atmosphere",
  },
  C: {
    symbol: "C",
    role: "Organic Chemistry & Atmosphere",
    planetaryFunction: "Forms CO₂ atmospheres, organic molecules, and carbon-rich minerals",
    abundance: "Fourth most abundant in universe",
    effects: [
      "Creates greenhouse effect (CO₂, CH₄)",
      "Foundation of organic chemistry",
      "Can form graphite/diamond under pressure",
    ],
    realWorldExample: "Venus has thick CO₂ atmosphere; Titan has methane (CH₄) lakes",
  },
  Si: {
    symbol: "Si",
    role: "Rocky Crust Formation",
    planetaryFunction: "Primary component of silicate rocks forming planetary crusts and mantles",
    abundance: "Seventh most abundant in universe",
    effects: [
      "Forms primary crustal rock (silicates)",
      "Creates sandy/rocky terrains",
      "Essential for terrestrial planets",
    ],
    realWorldExample: "Earth's crust is 28% silicon; Moon's maria are silicon-rich basalt",
  },
  Fe: {
    symbol: "Fe",
    role: "Core Formation & Magnetism",
    planetaryFunction: "Forms metallic cores, generates magnetic fields when molten",
    abundance: "Sixth most abundant in universe",
    effects: [
      "Creates magnetic fields (protects from radiation)",
      "Forms dense planetary cores",
      "Colors rocky surfaces red when oxidized",
    ],
    realWorldExample: "Earth's liquid iron core creates our magnetic field; Mars is red from iron oxide",
  },
  Mg: {
    symbol: "Mg",
    role: "Mantle Composition",
    planetaryFunction: "Major component of planetary mantles and volcanic rocks",
    abundance: "Eighth most abundant in universe",
    effects: [
      "Creates mantle minerals (olivine, pyroxene)",
      "Drives volcanic and tectonic activity",
      "Influences interior heat retention",
    ],
    realWorldExample: "Earth's mantle is rich in magnesium silicates; drives plate tectonics",
  },
  S: {
    symbol: "S",
    role: "Volcanic Activity & Atmosphere",
    planetaryFunction: "Drives volcanic activity, creates sulfuric atmospheres",
    abundance: "Tenth most abundant in universe",
    effects: [
      "Powers volcanic eruptions",
      "Creates toxic atmospheres (H₂S, SO₂)",
      "Forms metal sulfide deposits in cores",
    ],
    realWorldExample: "Io (Jupiter's moon) has constant sulfur volcanism; Venus has sulfuric acid clouds",
  },
  N: {
    symbol: "N",
    role: "Atmospheric Gas",
    planetaryFunction: "Forms breathable atmospheres, moderates temperature",
    abundance: "Seventh most abundant in universe",
    effects: [
      "Creates stable atmospheres (N₂)",
      "Moderates climate (inert gas)",
      "Essential for amino acids and life",
    ],
    realWorldExample: "Earth's atmosphere is 78% nitrogen; Titan has thick nitrogen atmosphere",
  },
  Al: {
    symbol: "Al",
    role: "Crustal Minerals",
    planetaryFunction: "Component of crustal rocks and lightweight minerals",
    abundance: "Common in rocky planetary crusts",
    effects: [
      "Forms feldspars and clay minerals",
      "Contributes to crustal composition",
      "Creates lightweight rocky material",
    ],
    realWorldExample: "Earth's crust is 8% aluminum; Moon highlands are aluminum-rich",
  },
  Ca: {
    symbol: "Ca",
    role: "Rock Formation",
    planetaryFunction: "Forms minerals in crust and early solar system condensates",
    abundance: "Common in terrestrial planet crusts",
    effects: [
      "Creates calcium-rich minerals",
      "Forms limestone and carbonate rocks",
      "Important in early planet formation",
    ],
    realWorldExample: "Earth has extensive limestone deposits; CAIs (calcium-aluminum inclusions) are oldest solar system materials",
  },
  Na: {
    symbol: "Na",
    role: "Mineral Formation & Salts",
    planetaryFunction: "Forms salts and minerals, creates tenuous atmospheres",
    abundance: "Moderately common in rocky planets",
    effects: [
      "Creates salt deposits",
      "Forms thin sodium atmospheres (Mercury)",
      "Component of feldspar minerals",
    ],
    realWorldExample: "Earth's oceans contain sodium chloride (salt); Mercury has thin sodium atmosphere",
  },
  K: {
    symbol: "K",
    role: "Radioactive Heating",
    planetaryFunction: "Provides long-term internal heating through radioactive decay",
    abundance: "Present in crustal rocks",
    effects: [
      "Powers long-term geological activity",
      "Creates internal heat via decay",
      "Component of crustal minerals",
    ],
    realWorldExample: "Radioactive potassium-40 helps keep Earth's interior hot for billions of years",
  },
  P: {
    symbol: "P",
    role: "Biological Chemistry",
    planetaryFunction: "Essential for life chemistry (DNA, ATP), indicator of habitability",
    abundance: "Rare but crucial for biology",
    effects: [
      "Required for all known life (DNA backbone)",
      "Energy storage in living cells (ATP)",
      "Strong indicator of biological potential",
    ],
    realWorldExample: "Every living cell on Earth uses phosphorus in DNA and energy molecules",
  },
  Ni: {
    symbol: "Ni",
    role: "Core Composition",
    planetaryFunction: "Alloyed with iron in planetary cores",
    abundance: "Common in metallic cores and meteorites",
    effects: [
      "Strengthens iron cores",
      "Contributes to magnetic field generation",
      "Found in iron-nickel meteorites",
    ],
    realWorldExample: "Earth's core is iron-nickel alloy; metallic meteorites are iron-nickel",
  },
};

"use client";

import { Box, Flex, Text, Separator } from "@radix-ui/themes";
import type { PlanetClassification } from "@/utils/planetSimulation";
import styles from "./ClassificationExplanation.module.scss";

interface ClassificationExplanationProps {
  classification: PlanetClassification;
  elementParts: Record<string, number>;
  distance: number;
  mass: number;
}

export function ClassificationExplanation({
  classification,
  elementParts,
  distance,
  mass,
}: ClassificationExplanationProps) {
  const getExplanation = () => {
    const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);
    const getPercent = (symbol: string) =>
      ((elementParts[symbol] || 0) / totalParts) * 100;

    const H = getPercent("H");
    const He = getPercent("He");
    const O = getPercent("O");
    const C = getPercent("C");
    const Si = getPercent("Si");
    const Fe = getPercent("Fe");

    switch (classification.type) {
      case "gas-giant":
        return {
          primary: `Your planet has ${(H + He).toFixed(1)}% hydrogen and helium, combined with a mass of ${mass.toFixed(1)}x Earth, which exceeds the gas giant threshold.`,
          secondary: "Gas giants form when massive cores capture enormous atmospheres of light gases. They typically form beyond the 'frost line' where volatiles can condense.",
          criteria: [
            `✓ Hydrogen + Helium: ${(H + He).toFixed(1)}% (>60% required)`,
            `✓ Mass: ${mass.toFixed(1)}x Earth (>10x required)`,
          ],
        };

      case "ice-giant":
        return {
          primary: `Your planet has moderate mass (${mass.toFixed(1)}x Earth) with significant water, carbon, and nitrogen content, characteristic of ice giants.`,
          secondary: "Ice giants like Uranus and Neptune have icy interiors with thick atmospheres of hydrogen and helium, but not enough to be classified as gas giants.",
          criteria: [
            `✓ Mass: ${mass.toFixed(1)}x Earth (5-20x range)`,
            `✓ Water/Carbon/Nitrogen rich composition`,
          ],
        };

      case "lava-world":
        return {
          primary: `Your planet's proximity to its star (${distance.toFixed(2)} AU) results in extreme surface temperatures of ${Math.round(classification.temperature)}K.`,
          secondary: "Lava worlds orbit so close to their stars that rocky surfaces melt into oceans of molten rock. Recent planet formation can also create temporary lava worlds.",
          criteria: [
            `✓ Distance: ${distance.toFixed(2)} AU (<0.5 AU for lava world)`,
            `✓ Temperature: ${Math.round(classification.temperature)}K (>1000K)`,
          ],
        };

      case "venus-like":
        return {
          primary: `Your planet has a thick CO₂ atmosphere creating a runaway greenhouse effect, with surface temperatures of ${Math.round(classification.temperature)}K.`,
          secondary: "Venus-like planets experience runaway greenhouse warming where CO₂ traps heat, evaporating oceans and creating hostile conditions despite being in the habitable zone.",
          criteria: [
            `✓ Temperature: ${Math.round(classification.temperature)}K (500-800K range)`,
            `✓ CO₂-rich atmosphere creating greenhouse effect`,
          ],
        };

      case "ice-world":
        return {
          primary: `Your planet orbits at ${distance.toFixed(2)} AU from its star, resulting in frigid temperatures of ${Math.round(classification.temperature)}K.`,
          secondary: "Ice worlds form beyond the frost line where temperatures are low enough for water and other volatiles to freeze solid. They may have subsurface oceans beneath thick ice shells.",
          criteria: [
            `✓ Distance: ${distance.toFixed(2)} AU (>3 AU) or Temperature <200K`,
            `✓ Temperature: ${Math.round(classification.temperature)}K`,
            `✓ Water content: ${(O + H / 2).toFixed(1)}% for ice formation`,
          ],
        };

      case "water-world":
        return {
          primary: `Your planet has abundant oxygen (${O.toFixed(1)}%) and hydrogen (${H.toFixed(1)}%), creating extensive water coverage while in the habitable temperature zone.`,
          secondary: "Water worlds have deep global oceans covering most or all of their surface. They form when planets have high water content and orbit in the habitable zone.",
          criteria: [
            `✓ Oxygen: ${O.toFixed(1)}% + Hydrogen: ${H.toFixed(1)}% (water-forming elements)`,
            `✓ Temperature: ${Math.round(classification.temperature)}K (habitable range)`,
            `✓ Distance: ${distance.toFixed(2)} AU (habitable zone)`,
          ],
        };

      case "earth-like":
        return {
          primary: `Your planet has a balanced composition with all CHNOPS elements, proper mass (${mass.toFixed(1)}x Earth), and sits in the habitable zone at ${distance.toFixed(2)} AU.`,
          secondary: "Earth-like planets have the perfect combination of composition, temperature, mass, and magnetic field to potentially support complex life as we know it.",
          criteria: [
            `✓ All CHNOPS elements present (C, H, N, O, P, S)`,
            `✓ Mass: ${mass.toFixed(1)}x Earth (0.5-2.0x range)`,
            `✓ Temperature: ${Math.round(classification.temperature)}K (250-320K range)`,
            classification.hasMagneticField ? "✓ Magnetic field present" : "✗ No magnetic field",
            `✓ Distance: ${distance.toFixed(2)} AU (habitable zone)`,
          ],
        };

      case "rocky-terrestrial":
        return {
          primary: `Your planet is dominated by silicate (${Si.toFixed(1)}%) and iron (${Fe.toFixed(1)}%) content, forming a rocky terrestrial body.`,
          secondary: "Rocky terrestrial planets are primarily composed of silicate rocks and metals. They're the most common type of small planet in the universe.",
          criteria: [
            `✓ Silicon: ${Si.toFixed(1)}% + Iron: ${Fe.toFixed(1)}% + Magnesium: ${getPercent("Mg").toFixed(1)}%`,
            `✓ Mass: ${mass.toFixed(1)}x Earth (terrestrial range)`,
          ],
        };

      default: // barren
        return {
          primary: `Your planet has an unusual composition that doesn't fit standard classifications, or lacks the elements needed for complex geological processes.`,
          secondary: "Barren worlds can form from uncommon element combinations or may be remnants of larger bodies that lost their atmospheres and volatile materials.",
          criteria: [
            "Composition doesn't match standard planet types",
            `Mass: ${mass.toFixed(1)}x Earth`,
            `Temperature: ${Math.round(classification.temperature)}K`,
          ],
        };
    }
  };

  const explanation = getExplanation();

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="3">
        <Text size="3" weight="bold">
          Why is this a{" "}
          {classification.type
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
          ?
        </Text>

        <Separator size="4" />

        {/* Primary Explanation */}
        <Text size="2" className={styles.primary}>
          {explanation.primary}
        </Text>

        {/* Secondary Context */}
        <Box className={styles.context}>
          <Text size="2" className={styles.contextText}>
            {explanation.secondary}
          </Text>
        </Box>

        {/* Criteria Met */}
        <Box>
          <Text size="2" weight="bold" className={styles.criteriaHeader}>
            Classification Criteria:
          </Text>
          <Box className={styles.criteriaList}>
            {explanation.criteria.map((criterion, i) => (
              <Text key={i} size="2" className={styles.criterion}>
                {criterion}
              </Text>
            ))}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

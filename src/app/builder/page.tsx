"use client";

import { useState, useRef, useEffect } from "react";
import { Flex, Box } from "@radix-ui/themes";
import { PageLayout } from "@/components/layout";
import { PlanetScene } from "@/components/builder/PlanetScene";
import { ConfigurationPanel } from "@/components/builder/ConfigurationPanel";
import { calculateCloudColor, calculateLuminosity } from "@/utils/planetCalculations";
import { ELEMENTS } from "@/data/elements";
import styles from "./page.module.scss";

export default function BuilderPage() {
  const [mass, setMass] = useState(1);
  const [cloudColor, setCloudColor] = useState("#8B7355");
  const [luminosity, setLuminosity] = useState(1.0);
  const [elementChanges, setElementChanges] = useState<Array<{
    symbol: string;
    color: string;
    change: number;
  }>>([]);

  const previousElementParts = useRef<Record<string, number>>({});

  const handleElementCompositionChange = (elementParts: Record<string, number>) => {
    const newColor = calculateCloudColor(elementParts);
    setCloudColor(newColor);

    // Detect changes in element composition
    const changes: Array<{ symbol: string; color: string; change: number }> = [];

    Object.keys(elementParts).forEach((symbol) => {
      const currentParts = elementParts[symbol] || 0;
      const previousParts = previousElementParts.current[symbol] || 0;
      const change = currentParts - previousParts;

      if (change !== 0) {
        const element = ELEMENTS.find((el) => el.symbol === symbol);
        if (element) {
          changes.push({
            symbol,
            color: element.color,
            change,
          });
        }
      }
    });

    if (changes.length > 0) {
      setElementChanges(changes);
      // Clear changes after a frame to prevent re-triggering
      setTimeout(() => setElementChanges([]), 16);
    }

    previousElementParts.current = { ...elementParts };
  };

  const handleStarTypeChange = (starType: string) => {
    const newLuminosity = calculateLuminosity(starType);
    setLuminosity(newLuminosity);
  };

  return (
    <PageLayout>
      <Flex className={styles.container}>
        {/* Left side - 3D Visualization (70%) */}
        <Box className={styles.scenePanel}>
          <PlanetScene
            particleDensity={mass}
            luminosity={luminosity}
            cloudColor={cloudColor}
            elementChanges={elementChanges}
          />
        </Box>

        {/* Right side - Configuration Panel (30%) */}
        <Box className={styles.configPanel}>
          <ConfigurationPanel
            onMassChange={setMass}
            onElementCompositionChange={handleElementCompositionChange}
            onStarTypeChange={handleStarTypeChange}
          />
        </Box>
      </Flex>
    </PageLayout>
  );
}

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
  const [isBuilding, setIsBuilding] = useState(false);
  const [isBuilt, setIsBuilt] = useState(false);
  const [yearsAgo, setYearsAgo] = useState(5000000000); // 5 billion years

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

  const handleBuild = () => {
    setIsBuilding(true);
    setIsBuilt(false);

    // Start the 4-second formation animation
    // Timeline countdown from 5B years to present
    const startTime = Date.now();
    const duration = 4000; // 4 seconds
    const startYears = 5000000000;

    const countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentYears = Math.round(startYears * (1 - progress));
      setYearsAgo(currentYears);

      if (progress >= 1) {
        clearInterval(countdownInterval);
        setIsBuilding(false);
        setIsBuilt(true);
        setYearsAgo(0);
      }
    }, 16); // Update ~60fps
  };

  const handleFormationComplete = () => {
    setIsBuilding(false);
    setIsBuilt(true);
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
            isBuilding={isBuilding}
            isBuilt={isBuilt}
            onFormationComplete={handleFormationComplete}
          />

          {/* Timeline display at bottom */}
          <Box className={styles.timeline}>
            {yearsAgo > 0 ? (
              <span>{(yearsAgo / 1000000000).toFixed(2)} Billion Years Ago</span>
            ) : (
              <span>Present Day</span>
            )}
          </Box>
        </Box>

        {/* Right side - Configuration Panel (30%) */}
        <Box className={styles.configPanel}>
          <ConfigurationPanel
            onMassChange={setMass}
            onElementCompositionChange={handleElementCompositionChange}
            onStarTypeChange={handleStarTypeChange}
            onBuild={handleBuild}
            isLocked={isBuilding || isBuilt}
          />
        </Box>
      </Flex>
    </PageLayout>
  );
}

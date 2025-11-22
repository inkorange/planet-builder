"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Flex, Box, Button } from "@radix-ui/themes";
import { PageLayout } from "@/components/layout";
import { PlanetScene } from "@/components/builder/PlanetScene";
import { ConfigurationPanel } from "@/components/builder/ConfigurationPanel";
import { ResultsPanel } from "@/components/builder/ResultsPanel";
import { calculateCloudColor, calculateLuminosity } from "@/utils/planetCalculations";
import { classifyPlanet, type PlanetClassification } from "@/utils/planetSimulation";
import { ELEMENTS } from "@/data/elements";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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
  const [sceneKey, setSceneKey] = useState(0); // Key to force scene re-render on restart

  // Planet configuration parameters
  const [elementParts, setElementParts] = useState<Record<string, number>>({});
  const [distance, setDistance] = useState(1);
  const [starType, setStarType] = useState("G");
  const [rotationSpeed, setRotationSpeed] = useState(24);
  const [planetClassification, setPlanetClassification] = useState<PlanetClassification | null>(null);

  const previousElementParts = useRef<Record<string, number>>({});

  // Update cloud color whenever element composition changes
  useEffect(() => {
    const newColor = calculateCloudColor(elementParts);
    setCloudColor(newColor);
  }, [elementParts]);

  // Update luminosity whenever star type or distance changes
  useEffect(() => {
    const newLuminosity = calculateLuminosity(starType, distance);
    setLuminosity(newLuminosity);
  }, [starType, distance]);

  const handleElementCompositionChange = (newElementParts: Record<string, number>) => {
    setElementParts(newElementParts);

    // Detect changes in element composition
    const changes: Array<{ symbol: string; color: string; change: number }> = [];

    Object.keys(newElementParts).forEach((symbol) => {
      const currentParts = newElementParts[symbol] || 0;
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

    previousElementParts.current = { ...newElementParts };
  };

  const handleStarTypeChange = (newStarType: string) => {
    setStarType(newStarType);
    // Luminosity will be automatically updated by useEffect
  };

  const handleDistanceChange = (newDistance: number) => {
    setDistance(newDistance);
    // Luminosity will be automatically updated by useEffect
  };

  const handleBuild = () => {
    setIsBuilding(true);
    setIsBuilt(false);

    // Calculate planet classification after 2 seconds (when flash begins)
    // so it's ready to render when flash reaches peak at 2.5s
    setTimeout(() => {
      const classification = classifyPlanet({
        elementParts,
        distanceFromStar: distance,
        starType,
        mass,
        rotationSpeed,
      });
      setPlanetClassification(classification);
    }, 2000);

    // Start the 6-second formation animation
    // Timeline countdown from 5B years to present
    const startTime = Date.now();
    const duration = 6000; // 6 seconds
    const startYears = 5000000000;

    const countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentYears = Math.round(startYears * (1 - progress));
      setYearsAgo(currentYears);

      if (progress >= 1) {
        clearInterval(countdownInterval);
        setYearsAgo(0);
      }
    }, 16); // Update ~60fps
  };

  const handleFormationComplete = () => {
    setIsBuilding(false);
    setIsBuilt(true);
  };

  const handleRestart = () => {
    // Reset all state to initial values
    setIsBuilt(false);
    setIsBuilding(false);
    setPlanetClassification(null);
    setYearsAgo(5000000000);
    // Increment scene key to force complete re-render of the 3D scene
    setSceneKey(prev => prev + 1);
  };

  const handleEditAgain = () => {
    // Go back to configuration mode but keep current settings
    setIsBuilt(false);
    setIsBuilding(false);
    setPlanetClassification(null);
    setYearsAgo(5000000000);
    // Increment scene key to reset the 3D scene
    setSceneKey(prev => prev + 1);
  };

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    {
      key: 'r',
      ctrlKey: true,
      callback: handleRestart,
      description: 'Restart planet builder',
    },
    {
      key: 'b',
      ctrlKey: true,
      callback: () => {
        const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);
        if (totalParts > 0 && !isBuilding && !isBuilt) {
          handleBuild();
        }
      },
      description: 'Build planet (when configuration is valid)',
    },
  ], [elementParts, isBuilding, isBuilt]);

  useKeyboardShortcuts(shortcuts, true);

  return (
    <PageLayout>
      <Flex className={styles.container}>
        {/* Left side - 3D Visualization (70%) */}
        <Box className={styles.scenePanel}>
          <PlanetScene
            key={sceneKey}
            particleDensity={mass}
            luminosity={luminosity}
            cloudColor={cloudColor}
            starType={starType}
            elementChanges={elementChanges}
            isBuilding={isBuilding}
            isBuilt={isBuilt}
            onFormationComplete={handleFormationComplete}
            planetClassification={planetClassification}
            elementParts={elementParts}
            rotationSpeed={rotationSpeed}
          />

          {/* Timeline display at bottom */}
          <Box className={styles.timeline}>
            {isBuilding && (
              <Box className={styles.loadingIndicator}>
                <span className={styles.spinner}></span>
              </Box>
            )}
            {yearsAgo > 0 ? (
              <span>{(yearsAgo / 1000000000).toFixed(2)} Billion Years Ago</span>
            ) : (
              <span>Present Day</span>
            )}
          </Box>

          {/* Action buttons - bottom left */}
          {isBuilt && (
            <Box className={styles.actionButtons}>
              <Button size="3" onClick={handleEditAgain} variant="soft">
                Edit Again
              </Button>
              <Button size="3" onClick={handleRestart} variant="solid">
                Start Over
              </Button>
            </Box>
          )}
        </Box>

        {/* Right side - Configuration Panel (30%) or Results Panel after build */}
        <Box className={styles.configPanel}>
          {!planetClassification ? (
            <ConfigurationPanel
              onMassChange={setMass}
              onElementCompositionChange={handleElementCompositionChange}
              onStarTypeChange={handleStarTypeChange}
              onDistanceChange={handleDistanceChange}
              onRotationChange={setRotationSpeed}
              onBuild={handleBuild}
              isLocked={isBuilding || isBuilt}
              initialElementParts={elementParts}
              initialDistance={distance}
              initialStarType={starType}
              initialMass={mass}
              initialRotation={rotationSpeed}
            />
          ) : (
            <ResultsPanel
              classification={planetClassification}
              elementParts={elementParts}
              distance={distance}
              starType={starType}
              mass={mass}
              rotationSpeed={rotationSpeed}
            />
          )}
        </Box>
      </Flex>
    </PageLayout>
  );
}

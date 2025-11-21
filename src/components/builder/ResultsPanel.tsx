"use client";

import { useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Separator,
  ScrollArea,
} from "@radix-ui/themes";
import type { PlanetClassification } from "@/utils/planetSimulation";
import { calculateHabitabilityScore } from "@/utils/habitabilityScore";
import { HabitabilityMeter } from "./HabitabilityMeter";
import { ClassificationExplanation } from "./ClassificationExplanation";
import { ELEMENTS, STAR_TYPES } from "@/data/elements";
import styles from "./ResultsPanel.module.scss";

interface ResultsPanelProps {
  classification: PlanetClassification;
  elementParts: Record<string, number>;
  distance: number;
  starType: string;
  mass: number;
  rotationSpeed: number;
}

export function ResultsPanel({
  classification,
  elementParts,
  distance,
  starType,
  mass,
  rotationSpeed,
}: ResultsPanelProps) {
  // Calculate total parts and percentages
  const totalParts = Object.values(elementParts).reduce(
    (sum, val) => sum + val,
    0
  );

  const getPercent = (symbol: string) =>
    totalParts > 0 ? ((elementParts[symbol] || 0) / totalParts) * 100 : 0;

  // Get top 3 elements by composition
  const topElements = Object.entries(elementParts)
    .filter(([, parts]) => parts > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([symbol]) => {
      const element = ELEMENTS.find((el) => el.symbol === symbol);
      return {
        symbol,
        name: element?.name || symbol,
        percentage: getPercent(symbol),
      };
    });

  // Format planet type
  const formatPlanetType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get star type name
  const starTypeName =
    STAR_TYPES.find((s) => s.type === starType)?.name || "Unknown";

  // Calculate planet radius (approximate based on mass)
  // Earth radius = 6,371 km, assuming similar density
  const radiusEarth = Math.pow(mass, 1 / 3);
  const radiusKm = radiusEarth * 6371;

  // Calculate habitability score
  const habitabilityBreakdown = useMemo(
    () => calculateHabitabilityScore(classification, elementParts, rotationSpeed),
    [classification, elementParts, rotationSpeed]
  );

  return (
    <ScrollArea className={styles.scrollArea}>
      <Box className={styles.content}>
        <Flex direction="column" gap="5">
          <Heading size="6">{formatPlanetType(classification.type)}</Heading>

          {/* Status Badges */}
          <Flex gap="2" wrap="wrap">
            {classification.hasLife && (
              <Badge color="green" size="2">
                Life Detected
              </Badge>
            )}
            {classification.hasMagneticField && (
              <Badge color="blue" size="2">
                Magnetic Field
              </Badge>
            )}
            <Badge
              color={
                classification.geologicalActivity === "extreme"
                  ? "red"
                  : classification.geologicalActivity === "high"
                  ? "orange"
                  : classification.geologicalActivity === "moderate"
                  ? "yellow"
                  : "gray"
              }
              size="2"
            >
              {classification.geologicalActivity.charAt(0).toUpperCase() +
                classification.geologicalActivity.slice(1)}{" "}
              Activity
            </Badge>
          </Flex>

          <Separator size="4" />

          {/* Classification Explanation */}
          <ClassificationExplanation
            classification={classification}
            elementParts={elementParts}
            distance={distance}
            mass={mass}
          />

          {/* Habitability Score */}
          <HabitabilityMeter breakdown={habitabilityBreakdown} />

          <Separator size="4" />

          {/* Physical Properties */}
          <Box className={styles.sectionContainer}>
            <Flex direction="column" gap="4">
              <Heading size="4">Physical Properties</Heading>

              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" weight="bold" as="div">
                    Mass
                  </Text>
                  <Text size="2" color="gray">
                    {mass.toFixed(2)}x Earth ({(mass * 5.972e24).toExponential(2)}{" "}
                    kg)
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="bold" as="div">
                    Radius
                  </Text>
                  <Text size="2" color="gray">
                    {radiusEarth.toFixed(2)}x Earth ({radiusKm.toFixed(0)} km)
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="bold" as="div">
                    Surface Temperature
                  </Text>
                  <Text size="2" color="gray">
                    {classification.temperature.toFixed(0)} K (
                    {(classification.temperature - 273.15).toFixed(0)} °C /{" "}
                    {(((classification.temperature - 273.15) * 9) / 5 + 32).toFixed(
                      0
                    )}{" "}
                    °F)
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="bold" as="div">
                    Rotation Period
                  </Text>
                  <Text size="2" color="gray">
                    {rotationSpeed.toFixed(1)} hours/day
                    {rotationSpeed < 24 && " (faster than Earth)"}
                    {rotationSpeed > 24 && " (slower than Earth)"}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Box>

          <Separator size="4" />

          {/* Orbital Properties */}
          <Box className={styles.sectionContainer}>
            <Flex direction="column" gap="4">
              <Heading size="4">Orbital Environment</Heading>

              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" weight="bold" as="div">
                    Star Type
                  </Text>
                  <Text size="2" color="gray">
                    {starType}-type ({starTypeName})
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="bold" as="div">
                    Distance from Star
                  </Text>
                  <Text size="2" color="gray">
                    {distance.toFixed(2)} AU ({(distance * 149597870.7).toFixed(0)}{" "}
                    million km)
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Box>

          <Separator size="4" />

          {/* Atmosphere */}
          <Box className={styles.sectionContainer}>
            <Flex direction="column" gap="4">
              <Heading size="4">Atmosphere</Heading>

              <Box>
                <Text size="2" color="gray">
                  {classification.atmosphereType}
                </Text>
              </Box>
            </Flex>
          </Box>

          <Separator size="4" />

          {/* Composition */}
          <Box className={styles.sectionContainer}>
            <Flex direction="column" gap="4">
              <Heading size="4">Elemental Composition</Heading>

              <Flex direction="column" gap="2">
                {topElements.map(({ symbol, name, percentage }) => (
                  <Box key={symbol}>
                    <Text size="2" weight="medium">
                      {symbol} - {name}
                    </Text>
                    <Text size="2" color="gray" as="div">
                      {percentage.toFixed(1)}%
                    </Text>
                  </Box>
                ))}
                {topElements.length < Object.keys(elementParts).length && (
                  <Text size="1" color="gray">
                    +{Object.keys(elementParts).length - topElements.length} other
                    elements
                  </Text>
                )}
              </Flex>
            </Flex>
          </Box>

          <Separator size="4" />

          {/* Surface Description */}
          <Box className={styles.sectionContainer}>
            <Flex direction="column" gap="4">
              <Heading size="4">Surface Characteristics</Heading>

              <Text size="2" color="gray">
                {classification.surfaceDescription}
              </Text>
            </Flex>
          </Box>

          {/* Life Assessment */}
          {classification.hasLife && (
            <>
              <Separator size="4" />
              <Flex direction="column" gap="4">
                <Heading size="4">Habitability</Heading>

                <Text size="2" color="green">
                  ✓ Conditions suitable for life detected
                </Text>
                <Text size="2" color="gray">
                  This planet exhibits the necessary conditions to support
                  biological processes, including stable temperatures, liquid
                  water, and protective magnetic fields.
                </Text>
              </Flex>
            </>
          )}
        </Flex>
      </Box>
    </ScrollArea>
  );
}

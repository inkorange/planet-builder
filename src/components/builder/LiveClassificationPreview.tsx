"use client";

import { useMemo } from "react";
import { Box, Flex, Badge, Text } from "@radix-ui/themes";
import { classifyPlanet, type PlanetClassification } from "@/utils/planetSimulation";
import styles from "./LiveClassificationPreview.module.scss";

interface LiveClassificationPreviewProps {
  elementParts: Record<string, number>;
  distance: number;
  starType: string;
  mass: number;
  rotationSpeed: number;
}

export function LiveClassificationPreview({
  elementParts,
  distance,
  starType,
  mass,
  rotationSpeed,
}: LiveClassificationPreviewProps) {
  // Calculate live classification
  const classification = useMemo(() => {
    return classifyPlanet({
      elementParts,
      distanceFromStar: distance,
      starType,
      mass,
      rotationSpeed,
    });
  }, [elementParts, distance, starType, mass, rotationSpeed]);

  // Format temperature
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}K (${Math.round(temp - 273)}°C)`;
  };

  // Get warning messages based on conditions
  const getWarnings = () => {
    const warnings: string[] = [];

    if (distance < 0.3) {
      warnings.push("Very close to star - extreme heat expected");
    }
    if (distance > 5) {
      warnings.push("Very far from star - freezing temperatures expected");
    }
    if (mass < 0.3) {
      warnings.push("Low mass - may not retain atmosphere");
    }
    if (mass > 5) {
      warnings.push("High mass - strong gravity, may be gas giant");
    }

    const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);
    if (totalParts === 0) {
      warnings.push("No elements selected - cannot form planet");
    }

    return warnings;
  };

  const warnings = getWarnings();

  return (
    <Box className={styles.container}>
      <Text size="2" weight="bold" className={styles.header}>
        Live Preview
      </Text>

      <Flex direction="column" gap="2" className={styles.content}>
        {/* Planet Type */}
        <Box>
          <Text size="1" className={styles.label}>
            Predicted Type:
          </Text>
          <Badge
            size="2"
            style={{
              backgroundColor: classification.color,
              color: "#fff",
              marginTop: "4px",
            }}
          >
            {classification.type
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        </Box>

        {/* Temperature */}
        <Box>
          <Text size="1" className={styles.label}>
            Surface Temperature:
          </Text>
          <Text size="2" weight="medium">
            {formatTemp(classification.temperature)}
          </Text>
        </Box>

        {/* Quick Stats */}
        <Flex gap="2" wrap="wrap">
          {classification.atmosphereType !== "None" && (
            <Badge size="1" color="blue">
              Atmosphere
            </Badge>
          )}
          {classification.hasMagneticField && (
            <Badge size="1" color="purple">
              Magnetic Field
            </Badge>
          )}
          {classification.hasLife && (
            <Badge size="1" color="green" variant="solid">
              Life Detected
            </Badge>
          )}
        </Flex>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Box className={styles.warnings}>
            {warnings.map((warning, i) => (
              <Flex key={i} align="center" gap="1">
                <Text size="1" className={styles.warningIcon}>
                  ⚠️
                </Text>
                <Text size="1" className={styles.warningText}>
                  {warning}
                </Text>
              </Flex>
            ))}
          </Box>
        )}

        {/* Geological Activity */}
        {classification.geologicalActivity !== "none" && (
          <Box>
            <Text size="1" className={styles.label}>
              Geological Activity:
            </Text>
            <Text size="2" weight="medium" style={{ textTransform: "capitalize" }}>
              {classification.geologicalActivity}
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

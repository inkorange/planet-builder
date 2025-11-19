"use client";

import { Box, Flex, Heading, Text, Badge } from "@radix-ui/themes";
import type { PlanetClassification } from "@/utils/planetSimulation";
import styles from "./PlanetSummary.module.scss";

interface PlanetSummaryProps {
  classification: PlanetClassification;
}

export function PlanetSummary({ classification }: PlanetSummaryProps) {
  const formatPlanetType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading size="5">{formatPlanetType(classification.type)}</Heading>
          <Flex gap="2">
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
          </Flex>
        </Flex>

        <Flex direction="column" gap="2">
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">
              Temperature
            </Text>
            <Text size="2" color="gray">
              {classification.temperature.toFixed(0)} K (
              {(classification.temperature - 273.15).toFixed(0)} °C)
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">
              Atmosphere
            </Text>
            <Text size="2" color="gray">
              {classification.atmosphereType}
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">
              Surface
            </Text>
            <Text size="2" color="gray">
              {classification.surfaceDescription}
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">
              Geological Activity
            </Text>
            <Text size="2" color="gray">
              {classification.geologicalActivity.charAt(0).toUpperCase() +
                classification.geologicalActivity.slice(1)}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

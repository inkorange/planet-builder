"use client";

import { Box, Flex, Text, Progress, Badge } from "@radix-ui/themes";
import type { HabitabilityBreakdown } from "@/utils/habitabilityScore";
import styles from "./HabitabilityMeter.module.scss";

interface HabitabilityMeterProps {
  breakdown: HabitabilityBreakdown;
}

export function HabitabilityMeter({ breakdown }: HabitabilityMeterProps) {
  const getRatingColor = (rating: HabitabilityBreakdown["rating"]) => {
    switch (rating) {
      case "Highly Habitable":
        return "green";
      case "Habitable":
        return "blue";
      case "Marginal":
        return "yellow";
      case "Extremely Harsh":
        return "orange";
      case "Uninhabitable":
        return "red";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--green-9)";
    if (score >= 60) return "var(--blue-9)";
    if (score >= 40) return "var(--yellow-9)";
    if (score >= 20) return "var(--orange-9)";
    return "var(--red-9)";
  };

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="4">
        {/* Overall Score */}
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              Habitability Score
            </Text>
            <Badge size="2" color={getRatingColor(breakdown.rating)}>
              {breakdown.rating}
            </Badge>
          </Flex>

          <Flex align="center" gap="3">
            <Box className={styles.progressContainer}>
              <Progress
                value={breakdown.totalScore}
                max={100}
                className={styles.progress}
                style={{
                  // @ts-ignore - custom CSS property
                  "--progress-color": getScoreColor(breakdown.totalScore),
                }}
              />
            </Box>
            <Text size="5" weight="bold" className={styles.score}>
              {breakdown.totalScore}
            </Text>
          </Flex>
        </Flex>

        {/* Factor Breakdown */}
        <Flex direction="column" gap="3">
          <Text size="2" weight="bold" color="gray">
            Contributing Factors
          </Text>

          {Object.entries(breakdown.factors).map(([key, factor]) => (
            <Flex key={key} direction="column" gap="1">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" style={{ textTransform: "capitalize" }}>
                  {key === "chemistry" ? "Organic Chemistry" : key.replace(/([A-Z])/g, " $1")}
                </Text>
                <Text
                  size="2"
                  weight="bold"
                  style={{ color: getScoreColor(factor.score) }}
                >
                  {factor.score}
                </Text>
              </Flex>
              <Box className={styles.factorBar}>
                <Box
                  className={styles.factorFill}
                  style={{
                    width: `${factor.score}%`,
                    backgroundColor: getScoreColor(factor.score),
                  }}
                />
              </Box>
              <Text size="1" color="gray" className={styles.reason}>
                {factor.reason}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}

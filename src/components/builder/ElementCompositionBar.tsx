"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { ELEMENTS } from "@/data/elements";
import styles from "./ElementCompositionBar.module.scss";

interface ElementCompositionBarProps {
  elementParts: Record<string, number>;
}

export function ElementCompositionBar({ elementParts }: ElementCompositionBarProps) {
  const totalParts = Object.values(elementParts).reduce((sum, val) => sum + val, 0);

  // Calculate percentages and filter out elements with 0 parts
  const elementData = ELEMENTS
    .map(element => ({
      ...element,
      parts: elementParts[element.symbol] || 0,
      percentage: totalParts > 0 ? ((elementParts[element.symbol] || 0) / totalParts) * 100 : 0,
    }))
    .filter(el => el.parts > 0)
    .sort((a, b) => b.parts - a.parts); // Sort by parts descending

  return (
    <Box>
      <Box className={`${styles.bar} ${totalParts === 0 ? styles.empty : ""}`}>
        {totalParts === 0 ? (
          <Flex className={styles.emptyState}>
            <Text className={styles.emptyText}>
              Add elements below to your planet
            </Text>
          </Flex>
        ) : (
          elementData.map((element) => (
            <Box
              key={element.symbol}
              className={`${styles.segment} ${element.percentage <= 8 ? styles.small : ""}`}
              style={{
                width: `${element.percentage}%`,
                background: element.color,
              }}
            >
              {element.percentage > 8 && (
                <Text className={styles.label}>
                  {element.symbol} {element.percentage.toFixed(0)}%
                </Text>
              )}
            </Box>
          ))
        )}
      </Box>

      {totalParts > 0 && (
        <Flex className={styles.legend}>
          {elementData.map((element) => (
            <Flex key={element.symbol} className={styles.legendItem}>
              <Box
                className={styles.legendSwatch}
                style={{ background: element.color }}
              />
              <Text className={styles.legendText}>
                {element.symbol}: {element.percentage.toFixed(1)}%
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
}

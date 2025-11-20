"use client";

import { Box, Flex, Text, Separator } from "@radix-ui/themes";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ELEMENT_EDUCATION, type ElementEducation } from "@/data/elementEducation";
import styles from "./ElementTooltip.module.scss";

interface ElementTooltipProps {
  symbol: string;
  children: React.ReactNode;
}

export function ElementTooltip({ symbol, children }: ElementTooltipProps) {
  const education = ELEMENT_EDUCATION[symbol];

  if (!education) {
    return <>{children}</>;
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
            <Box className={styles.tooltip}>
              <Flex direction="column" gap="2">
                {/* Header */}
                <Box className={styles.header}>
                  <Text size="4" weight="bold" className={styles.symbolHeader}>
                    {symbol}
                  </Text>
                  <Text size="2" color="gray" className={styles.roleHeader}>
                    {education.role}
                  </Text>
                </Box>

                <Separator size="4" />

                {/* Planetary Function */}
                <Box>
                  <Text size="1" weight="bold" className={styles.label}>
                    Planetary Function:
                  </Text>
                  <Text size="2" className={styles.description}>
                    {education.planetaryFunction}
                  </Text>
                </Box>

                {/* Abundance */}
                <Box>
                  <Text size="1" weight="bold" className={styles.label}>
                    Abundance:
                  </Text>
                  <Text size="2" className={styles.description}>
                    {education.abundance}
                  </Text>
                </Box>

                {/* Effects */}
                <Box>
                  <Text size="1" weight="bold" className={styles.label}>
                    Effects on Planets:
                  </Text>
                  <ul className={styles.effectsList}>
                    {education.effects.map((effect, i) => (
                      <li key={i}>
                        <Text size="2">{effect}</Text>
                      </li>
                    ))}
                  </ul>
                </Box>

                {/* Real World Example */}
                <Box className={styles.example}>
                  <Text size="1" weight="bold" className={styles.exampleLabel}>
                    Real World Example:
                  </Text>
                  <Text size="2" className={styles.exampleText}>
                    {education.realWorldExample}
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

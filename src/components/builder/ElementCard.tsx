"use client";

import { Box, Flex, Text, IconButton } from "@radix-ui/themes";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { ElementTooltip } from "./ElementTooltip";
import type { Element } from "@/data/elements";
import styles from "./ElementCard.module.scss";

interface ElementCardProps {
  element: Element;
  parts: number;
  onPartsChange: (value: number) => void;
  disabled?: boolean;
}

export function ElementCard({
  element,
  parts,
  onPartsChange,
  disabled = false,
}: ElementCardProps) {
  // Ensure parts is always a valid number
  const currentParts = parts || 0;

  const handleIncrease = () => {
    onPartsChange(currentParts + 1);
  };

  const handleDecrease = () => {
    if (currentParts > 0) {
      onPartsChange(currentParts - 1);
    }
  };

  return (
    <ElementTooltip symbol={element.symbol}>
      <Box
        className={styles.card}
        style={{
          border: `2px solid ${element.color}`,
          background: `${element.color}15`,
        }}
      >
        <Flex direction="column" gap="1">
          <Flex justify="between" align="center">
            <Text className={styles.symbol} style={{ color: element.color }}>
              {element.symbol}
            </Text>
            <Text className={styles.parts}>
              {currentParts} {currentParts === 1 ? "part" : "parts"}
            </Text>
          </Flex>
          <Text className={styles.name}>
            {element.name}
          </Text>
          <Flex gap="1" className={styles.controls}>
            <IconButton
              size="1"
              variant="soft"
              onClick={handleDecrease}
              disabled={currentParts === 0 || disabled}
            >
              <MinusIcon />
            </IconButton>
            <IconButton
              size="1"
              variant="soft"
              onClick={handleIncrease}
              disabled={disabled}
            >
              <PlusIcon />
            </IconButton>
          </Flex>
        </Flex>
      </Box>
    </ElementTooltip>
  );
}

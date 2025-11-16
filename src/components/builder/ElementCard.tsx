"use client";

import { Box, Flex, Text, IconButton } from "@radix-ui/themes";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import type { Element } from "@/data/elements";
import styles from "./ElementCard.module.scss";

interface ElementCardProps {
  element: Element;
  parts: number;
  onPartsChange: (value: number) => void;
}

export function ElementCard({
  element,
  parts,
  onPartsChange,
}: ElementCardProps) {
  const handleIncrease = () => {
    onPartsChange(parts + 1);
  };

  const handleDecrease = () => {
    if (parts > 0) {
      onPartsChange(parts - 1);
    }
  };

  return (
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
            {parts} {parts === 1 ? "part" : "parts"}
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
            disabled={parts === 0}
          >
            <MinusIcon />
          </IconButton>
          <IconButton
            size="1"
            variant="soft"
            onClick={handleIncrease}
          >
            <PlusIcon />
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  );
}

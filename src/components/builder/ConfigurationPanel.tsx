"use client";

import { Box, Flex, Heading, Text, Slider, Button } from "@radix-ui/themes";

interface ConfigurationPanelProps {
  onMassChange?: (value: number) => void;
  onLuminosityChange?: (value: number) => void;
}

export function ConfigurationPanel({
  onMassChange,
  onLuminosityChange,
}: ConfigurationPanelProps) {
  return (
    <Box
      p="5"
      style={{
        height: "100%",
        overflowY: "auto",
        background: "var(--gray-a2)",
        borderLeft: "1px solid var(--gray-a6)",
      }}
    >
      <Flex direction="column" gap="6">
        <Heading size="5">Planet Configuration</Heading>

        <Flex direction="column" gap="3">
          <Text size="2" weight="bold" color="gray">
            Initial Mass
          </Text>
          <Text size="1" color="gray">
            0.1x - 100x Earth mass (Default: 1x)
          </Text>
          <Slider
            defaultValue={[1]}
            min={0.1}
            max={100}
            step={0.1}
            onValueChange={(values) => onMassChange?.(values[0])}
          />
        </Flex>

        <Flex direction="column" gap="3">
          <Text size="2" weight="bold" color="gray">
            Star Luminosity
          </Text>
          <Text size="1" color="gray">
            Distance & Type (Default: 1 AU, G-type)
          </Text>
          <Slider
            defaultValue={[1]}
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={(values) => onLuminosityChange?.(values[0])}
          />
        </Flex>

        <Box mt="4">
          <Text size="1" color="gray">
            Element mixing and environmental controls coming in Phase 4-5
          </Text>
        </Box>

        <Button size="3" disabled style={{ marginTop: "auto" }}>
          Build Planet (Phase 6)
        </Button>
      </Flex>
    </Box>
  );
}

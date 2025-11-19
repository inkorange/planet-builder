"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Slider,
  Button,
  RadioGroup,
  ScrollArea,
} from "@radix-ui/themes";
import { ElementCard } from "./ElementCard";
import { ElementCompositionBar } from "./ElementCompositionBar";
import { ELEMENTS, STAR_TYPES } from "@/data/elements";
import { PLANET_PRESETS, type PlanetPreset } from "@/data/planetPresets";
import styles from "./ConfigurationPanel.module.scss";

interface ConfigurationPanelProps {
  onMassChange?: (value: number) => void;
  onLuminosityChange?: (value: number) => void;
  onElementCompositionChange?: (parts: Record<string, number>) => void;
  onStarTypeChange?: (starType: string) => void;
  onDistanceChange?: (value: number) => void;
  onRotationChange?: (value: number) => void;
  onBuild?: () => void;
  isLocked?: boolean;
}

export function ConfigurationPanel({
  onMassChange,
  onElementCompositionChange,
  onStarTypeChange,
  onDistanceChange,
  onRotationChange,
  onBuild,
  isLocked = false,
}: ConfigurationPanelProps) {
  const [elementParts, setElementParts] = useState<Record<string, number>>(
    ELEMENTS.reduce((acc, el) => ({ ...acc, [el.symbol]: 0 }), {})
  );
  const [distance, setDistance] = useState(1);
  const [starType, setStarType] = useState("G");
  const [mass, setMass] = useState(1);
  const [rotation, setRotation] = useState(24);

  const handleElementChange = (symbol: string, value: number) => {
    const newParts = { ...elementParts, [symbol]: value };
    setElementParts(newParts);
    onElementCompositionChange?.(newParts);
  };

  const handleStarTypeChange = (newStarType: string) => {
    setStarType(newStarType);
    onStarTypeChange?.(newStarType);
  };

  const handlePresetChange = (presetId: string) => {
    const preset = PLANET_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    // Apply all preset values
    setElementParts(preset.elementParts);
    setMass(preset.mass);
    setDistance(preset.distance);
    setStarType(preset.starType);
    setRotation(preset.rotationSpeed);

    // Notify parent components
    onElementCompositionChange?.(preset.elementParts);
    onMassChange?.(preset.mass);
    onDistanceChange?.(preset.distance);
    onStarTypeChange?.(preset.starType);
    onRotationChange?.(preset.rotationSpeed);
  };

  const totalParts = Object.values(elementParts).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <ScrollArea className={styles.scrollArea}>
      <Box className={styles.content}>
        <Flex direction="column" gap="6">
          <Heading size="5">Planet Configuration</Heading>

          {/* Preset Selector */}
          <Flex direction="column" gap="2">
            <Text size="2" weight="bold">
              Quick Start Presets
            </Text>
            <Text size="1" color="gray">
              Choose a preset to automatically configure your planet
            </Text>
            <select
              className={styles.presetSelect}
              onChange={(e) => handlePresetChange(e.target.value)}
              disabled={isLocked}
              defaultValue=""
            >
              <option value="" disabled>
                Select a preset...
              </option>
              {PLANET_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} - {preset.description}
                </option>
              ))}
            </select>
          </Flex>

          {/* Element Composition */}
          <Flex direction="column" gap="3">
            <Text size="2" weight="bold">
              Element Composition
            </Text>

            {/* Element Cards Grid */}
            <Box className={styles.elementGrid}>
              {ELEMENTS.map((element) => (
                <ElementCard
                  key={element.symbol}
                  element={element}
                  parts={elementParts[element.symbol]}
                  onPartsChange={(val) =>
                    handleElementChange(element.symbol, val)
                  }
                  disabled={isLocked}
                />
              ))}
            </Box>

            {/* Bar Chart Visualization - Below cards to prevent layout shift */}
            <ElementCompositionBar elementParts={elementParts} />
          </Flex>

          {/* Environmental Parameters */}
          <Flex direction="column" gap="4">
            <Text size="3" weight="bold">
              Environmental Parameters
            </Text>

            {/* Distance from Star */}
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Distance from Star
              </Text>
              <Text size="1" color="gray">
                {distance.toFixed(1)} AU
              </Text>
              <Slider
                value={[distance]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={(values) => {
                  setDistance(values[0]);
                  onDistanceChange?.(values[0]);
                }}
                disabled={isLocked}
              />
            </Flex>

            {/* Star Type */}
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Star Type
              </Text>
              <RadioGroup.Root value={starType} onValueChange={handleStarTypeChange} disabled={isLocked}>
                <Flex direction="column" gap="1">
                  {STAR_TYPES.map((star) => (
                    <Flex key={star.type} asChild gap="2">
                      <Text as="label" size="2">
                        <RadioGroup.Item value={star.type} disabled={isLocked} />
                        {star.type} - {star.name}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </RadioGroup.Root>
            </Flex>

            {/* Initial Mass */}
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Initial Mass
              </Text>
              <Text size="1" color="gray">
                {mass.toFixed(1)}x Earth mass
              </Text>
              <Slider
                value={[mass]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={(values) => {
                  setMass(values[0]);
                  onMassChange?.(values[0]);
                }}
                disabled={isLocked}
              />
            </Flex>

            {/* Rotation Speed */}
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Rotation Speed
              </Text>
              <Text size="1" color="gray">
                {rotation.toFixed(0)} hours/day
              </Text>
              <Slider
                value={[rotation]}
                min={1}
                max={2400}
                step={1}
                onValueChange={(values) => {
                  setRotation(values[0]);
                  onRotationChange?.(values[0]);
                }}
                disabled={isLocked}
              />
            </Flex>
          </Flex>

          {/* Build Button */}
          <Button size="3" disabled={totalParts === 0 || isLocked} onClick={onBuild}>
            {totalParts === 0
              ? "Add elements to build planet"
              : isLocked
              ? "Planet Built"
              : "Build Planet"}
          </Button>
        </Flex>
      </Box>
    </ScrollArea>
  );
}

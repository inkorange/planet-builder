"use client";

import { useState } from "react";
import { Flex, Box } from "@radix-ui/themes";
import { PageLayout } from "@/components/layout";
import { PlanetScene } from "@/components/builder/PlanetScene";
import { ConfigurationPanel } from "@/components/builder/ConfigurationPanel";
import styles from "./page.module.scss";

export default function BuilderPage() {
  const [mass, setMass] = useState(1);
  const [luminosity, setLuminosity] = useState(1);

  return (
    <PageLayout>
      <Flex className={styles.container}>
        {/* Left side - 3D Visualization (70%) */}
        <Box className={styles.scenePanel}>
          <PlanetScene
            particleDensity={mass}
            luminosity={luminosity}
            cloudColor="#8B7355"
          />
        </Box>

        {/* Right side - Configuration Panel (30%) */}
        <Box className={styles.configPanel}>
          <ConfigurationPanel
            onMassChange={setMass}
            onLuminosityChange={setLuminosity}
          />
        </Box>
      </Flex>
    </PageLayout>
  );
}

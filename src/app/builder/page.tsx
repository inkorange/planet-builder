"use client";

import { useState } from "react";
import { Flex, Box } from "@radix-ui/themes";
import { PageLayout } from "@/components/layout";
import { PlanetScene } from "@/components/builder/PlanetScene";
import { ConfigurationPanel } from "@/components/builder/ConfigurationPanel";

export default function BuilderPage() {
  const [mass, setMass] = useState(1);
  const [luminosity, setLuminosity] = useState(1);

  return (
    <PageLayout>
      <Flex style={{ height: "calc(100vh - 64px)" }}>
        {/* Left side - 3D Visualization (75%) */}
        <Box style={{ flex: "0 0 75%", position: "relative" }}>
          <PlanetScene
            particleDensity={mass}
            luminosity={luminosity}
            cloudColor="#8B7355"
          />
        </Box>

        {/* Right side - Configuration Panel (25%) */}
        <Box style={{ flex: "0 0 25%" }}>
          <ConfigurationPanel
            onMassChange={setMass}
            onLuminosityChange={setLuminosity}
          />
        </Box>
      </Flex>
    </PageLayout>
  );
}

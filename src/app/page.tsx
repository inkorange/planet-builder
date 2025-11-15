"use client";

import { Heading, Text, Button, Flex, Box, Card } from "@radix-ui/themes";
import Link from "next/link";
import { HeroImage } from "@/components/landing/HeroImage";
import { AboutDialog } from "@/components/landing/AboutDialog";

export default function Home() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: "2rem",
      }}
    >
      <Card
        size="4"
        style={{
          maxWidth: "1200px",
          width: "100%",
          background: "var(--gray-a2)",
          border: "1px solid var(--gray-a6)",
        }}
      >
        <Flex gap="0" style={{ minHeight: "600px" }}>
          {/* Left side - Image (60%) */}
          <Box
            style={{
              flex: "0 0 60%",
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeroImage />
          </Box>

          {/* Right side - Content (40%) */}
          <Flex
            direction="column"
            justify="center"
            gap="5"
            style={{
              flex: "0 0 40%",
              padding: "3rem 2rem",
            }}
          >
            <Flex direction="column" gap="3">
              <Heading size="8" weight="bold">
                Planet Builder
              </Heading>

              <Text size="4" color="gray" style={{ lineHeight: "1.6" }}>
                Create your own world and watch it evolve over billions of years.
              </Text>

              <Text size="3" style={{ lineHeight: "1.7", marginTop: "0.5rem" }}>
                Mix elements, set orbital parameters, and choose your star type.
                Will your creation become a lush Earth-like paradise, a scorching
                lava world, or a frozen ice giant?
              </Text>

              <Text size="3" style={{ lineHeight: "1.7" }}>
                The destiny of your planet lies in the primordial ingredients you
                choose and the cosmic forces you harness. Every choice matters in
                the grand experiment of planetary formation.
              </Text>
            </Flex>

            <Flex direction="column" gap="3" mt="2">
              <Link href="/builder" style={{ textDecoration: "none" }}>
                <Button size="4" style={{ width: "100%", cursor: "pointer" }}>
                  Let&apos;s Create!
                </Button>
              </Link>

              <Flex justify="center">
                <AboutDialog />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

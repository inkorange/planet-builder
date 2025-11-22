"use client";

import { Heading, Text, Button, Flex, Box, Card } from "@radix-ui/themes";
import Link from "next/link";
import { HeroImage } from "@/components/landing/HeroImage";
import { AboutDialog } from "@/components/landing/AboutDialog";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <Flex className={styles.container}>
      <Card size="4" className={styles.card}>
        <Flex className={styles.cardContent}>
          {/* Image Section (60% on desktop, 100% width on mobile, positioned at top) */}
          <Box className={styles.imageSection}>
            <HeroImage />
          </Box>

          {/* Content Section (40% on desktop, 100% width on mobile) */}
          <Flex className={styles.contentSection}>
            <Flex className={styles.textContent}>
              <Heading size="8" weight="bold" className={styles.heading}>
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

            <Flex className={styles.buttonSection}>
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

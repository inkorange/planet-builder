"use client";

import Image from "next/image";
import { Box } from "@radix-ui/themes";

export function HeroImage() {
  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/homepage.jpg"
        alt="Planet formation visualization"
        fill
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        priority
      />
    </Box>
  );
}

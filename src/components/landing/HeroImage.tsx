"use client";

import { Box } from "@radix-ui/themes";

export function HeroImage() {
  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.2), rgba(0, 0, 0, 0.8))",
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Placeholder for cosmic/space themed image */}
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.7 }}
      >
        {/* Central planet */}
        <circle
          cx="200"
          cy="200"
          r="80"
          fill="url(#planetGradient)"
          opacity="0.9"
        />

        {/* Swirling particles */}
        <circle cx="150" cy="120" r="3" fill="#60A5FA" opacity="0.6" />
        <circle cx="280" cy="150" r="2" fill="#A78BFA" opacity="0.7" />
        <circle cx="320" cy="220" r="2.5" fill="#60A5FA" opacity="0.5" />
        <circle cx="100" cy="250" r="2" fill="#F472B6" opacity="0.6" />
        <circle cx="160" cy="300" r="3" fill="#60A5FA" opacity="0.8" />
        <circle cx="270" cy="280" r="2" fill="#A78BFA" opacity="0.5" />

        {/* Orbital rings */}
        <circle
          cx="200"
          cy="200"
          r="120"
          stroke="#60A5FA"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
        <circle
          cx="200"
          cy="200"
          r="150"
          stroke="#A78BFA"
          strokeWidth="0.5"
          fill="none"
          opacity="0.2"
        />

        <defs>
          <radialGradient id="planetGradient" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </radialGradient>
        </defs>
      </svg>
    </Box>
  );
}

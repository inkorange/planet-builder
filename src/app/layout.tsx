import type { Metadata } from "next";
import { Orbitron, Roboto } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import GoogleTagManager from "@/components/layout/GoogleAnalytics";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Planet Builder",
  description: "Create your own world and watch it evolve over billions of years",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${roboto.variable} antialiased`}
      >
        <GoogleTagManager />
        <Theme appearance="dark" accentColor="blue" grayColor="slate">
          {children}
        </Theme>
      </body>
    </html>
  );
}

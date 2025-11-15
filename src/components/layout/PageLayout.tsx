import { ReactNode } from "react";
import { Flex } from "@radix-ui/themes";
import { Header } from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  return (
    <Flex direction="column" style={{ minHeight: "100vh" }}>
      {showHeader && <Header />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </Flex>
  );
}

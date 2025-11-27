import { ReactNode } from "react";
import { Flex } from "@radix-ui/themes";
import { Header } from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  return (
    <Flex direction="column" style={{ height: "100vh" }}>
      {showHeader && <Header />}
      <main style={{ flex: 1, minHeight: 0, paddingTop: showHeader ? "65px" : 0 }}>
        {children}
      </main>
    </Flex>
  );
}

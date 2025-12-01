import { ReactNode } from "react";
import { Flex } from "@radix-ui/themes";
import { Header } from "./Header";
import styles from "./PageLayout.module.scss";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  return (
    <Flex direction="column" style={{ height: "100vh" }}>
      {showHeader && <Header />}
      <main className={showHeader ? styles.main : styles.mainNoHeader}>
        {children}
      </main>
    </Flex>
  );
}

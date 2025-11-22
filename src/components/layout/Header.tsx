import { Flex, Heading, Button } from "@radix-ui/themes";
import Link from "next/link";
import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <Flex className={styles.content}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Heading size="6" className={styles.title}>Planet Builder</Heading>
        </Link>
        <Flex gap="3">
          <Link href="/builder">
            <Button variant="ghost">Builder</Button>
          </Link>
        </Flex>
      </Flex>
    </header>
  );
}

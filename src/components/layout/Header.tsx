import { Flex, Heading, Button } from "@radix-ui/themes";
import Link from "next/link";

export function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--gray-a6)" }}>
      <Flex
        justify="between"
        align="center"
        px="6"
        py="4"
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Heading size="6">Planet Builder</Heading>
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

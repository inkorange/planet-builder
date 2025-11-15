import { Container, Heading, Text, Button, Flex } from "@radix-ui/themes";
import Link from "next/link";
import { PageLayout } from "@/components/layout";

export default function ResultsPage() {
  return (
    <PageLayout>
      <Container size="4">
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: "calc(100vh - 80px)" }}
        >
          <Heading size="8">Planet Results</Heading>
          <Text size="4" color="gray">
            Results and timeline view will go here (Phase 8)
          </Text>
          <Text size="2" color="gray">
            Planet stats, AI-generated summary, comparison to real planets
          </Text>
          <Flex gap="4">
            <Link href="/">
              <Button size="3" variant="outline">Back to Home</Button>
            </Link>
            <Link href="/builder">
              <Button size="3">Back to Builder</Button>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </PageLayout>
  );
}

"use client";

import { Dialog, Button, Flex, Text, Heading } from "@radix-ui/themes";

export function AboutDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outline" size="2">
          About
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="500px">
        <Dialog.Title>
          <Heading size="6">About Planet Builder</Heading>
        </Dialog.Title>

        <Flex direction="column" gap="4" mt="4">
          <Text size="3">
            Planet Builder is an interactive educational experience that lets you create and
            evolve your own planetary worlds. Watch as billions of years of cosmic evolution
            unfold before your eyes.
          </Text>

          <Text size="2" color="gray">
            Combining real planetary science with engaging gameplay, you'll discover how
            elements, stellar radiation, and cosmic forces shape the destiny of worlds.
          </Text>

          <Flex direction="column" gap="2" mt="2">
            <Text size="2" weight="bold">
              Publisher
            </Text>
            <Text size="2" color="gray">
              Planet Builder v0.1.0
            </Text>
            <Text size="2" color="gray">
              Built with Next.js, Three.js, and Radix UI
            </Text>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Close</Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

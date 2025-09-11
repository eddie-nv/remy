import React from 'react';
import { Stack, Text } from '@mantine/core';

const ShoppingLists = () => {
  return (
    <Stack p="md">
      <Text fw={600} size="lg">Shopping list</Text>
      <Text c="dimmed" size="sm">Your shopping lists will appear here.</Text>
    </Stack>
  );
};

export default ShoppingLists;
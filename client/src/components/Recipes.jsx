import React from 'react';
import { Stack, Text } from '@mantine/core';

const Recipes = () => {
  return (
    <Stack p="md">
      <Text fw={600} size="lg">Recipes</Text>
      <Text c="dimmed" size="sm">Your recipes will appear here.</Text>
    </Stack>
  );
};

export default Recipes;
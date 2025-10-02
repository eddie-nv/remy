import React from 'react';
import { Stack, Text, Badge, SimpleGrid, Center } from '@mantine/core';

const SUGGESTIONS = [
  'Plan a 3-course dinner for 4 using seasonal ingredients.',
  'Suggest a weeknight meal under 30 minutes with chicken.',
  'Create 5 simple vegetarian lunches for the week.',
  'Give me the recipe from this site @https://www.allrecipes.com/recipe/23431/to-die-for-fettuccine-alfredo/',
];

const NewChat = ({ onSelectSuggestion = () => {} }) => {
  return (
    <Center w="100%" h="100%" >
      <Stack gap="md" h="100%" p="md" align="center" justify="center" style={{ maxWidth: 600, width: '100%' }}>
        <Text fw={700} size="lg">Ask Remy! 🐭🥘</Text>
        <Text c="dimmed" size="sm" ta="center">
          Ask for recipes, reference a recipe, and cooking guidance. Try one of these:
        </Text>
        <SimpleGrid cols={2} spacing="xs" style={{ width: '100%' }}>
          {SUGGESTIONS.map((p) => (
            <Badge
              key={p}
              variant="light"
              radius="sm"
              size="md"
              color="accent"
              style={{ cursor: 'pointer', whiteSpace: 'normal' }}
              onClick={() => onSelectSuggestion(p)}
            >
              {p}
            </Badge>
          ))}
        </SimpleGrid>
      </Stack>
    </Center>
  );
};

export default NewChat;
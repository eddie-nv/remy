import React from 'react';
import { Card, Group, Text, Badge, List, Stack, Divider, SimpleGrid, Button } from '@mantine/core';
import axios from 'axios';
import { FloppyDisk } from '@phosphor-icons/react';

const formatAmount = (quantity, unit) => {
  if (quantity == null || Number.isNaN(quantity)) return unit ? `${unit}` : '';
  return unit ? `${quantity} ${unit}` : String(quantity);
};

const splitIntoTwoColumns = (items = []) => {
  const leftCount = Math.ceil(items.length / 2);
  return [items.slice(0, leftCount), items.slice(leftCount)];
};

const Ingredients = ({ items = [] }) => {
  const [leftItems, rightItems] = splitIntoTwoColumns(items);

  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">Ingredients</Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <List spacing={4}>
          {leftItems.map((ing, idx) => (
            <List.Item key={`left-${idx}`}>
              <Text size="sm">
                {formatAmount(ing.quantity, ing.unit)} {ing.name}
              </Text>
            </List.Item>
          ))}
        </List>
        <List spacing={4}>
          {rightItems.map((ing, idx) => (
            <List.Item key={`right-${idx}`}>
              <Text size="sm">
                {formatAmount(ing.quantity, ing.unit)} {ing.name}
              </Text>
            </List.Item>
          ))}
        </List>
      </SimpleGrid>
    </Stack>
  );
};

const Steps = ({ steps = [] }) => (
  <Stack gap="xs">
    <Text fw={600} size="sm">Steps</Text>
    <List type="ordered" spacing={6}>
      {steps.map((step, idx) => (
        <List.Item key={idx}>
          <Text size="sm">{step}</Text>
        </List.Item>
      ))}
    </List>
  </Stack>
);

export const RecipeCard = ({ recipe }) => {
  if (!recipe) return null;
  const {
    name,
    description,
    servings,
    totalTimeMinutes,
    ingredients = [],
    steps = [],
    tags = [],
    notes,
  } = recipe;

  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);
    try {
      await axios.post('/api/recipes', { recipe });
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save recipe', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={700}>{name}</Text>
          <Button
            size="xs"
            variant={isSaved ? 'filled' : 'light'}
            color="accent"
            onClick={handleSave}
            leftSection={<FloppyDisk size={14} />}
            loading={isSaving}
            disabled={isSaved}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </Group>

        {description ? <Text c="dimmed" size="sm">{description}</Text> : null}

        <Group gap="xs">
          {Number.isFinite(servings) ? <Badge variant="light" size="sm" color="accent">{servings} servings</Badge> : null}
          {Number.isFinite(totalTimeMinutes) ? <Badge variant="light" size="sm" color="accent">{totalTimeMinutes} min</Badge> : null}
        </Group>

        <Divider />

        <Ingredients items={ingredients} />
        <Steps steps={steps} />

        {tags?.length ? (
          <Group gap="xs">
            {tags.map((t, i) => (
              <Badge key={`${t}-${i}`} variant="outline" size="xs" color="accent">{t}</Badge>
            ))}
          </Group>
        ) : null}

        {notes ? (
          <Card p="sm" radius="sm" withBorder>
            <Text fw={600} size="sm">Notes</Text>
            <Text size="sm">{notes}</Text>
          </Card>
        ) : null}
      </Stack>
    </Card>
  );
};

export default RecipeCard;
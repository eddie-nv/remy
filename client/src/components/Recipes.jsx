import React from 'react';
import { Stack, Text, SimpleGrid, Card, Badge, Group, Loader, Center, Modal, Button, TextInput, Textarea } from '@mantine/core';
import axios from 'axios';
import RecipeCard from './RecipeCard.jsx';

const PreviewCard = ({ recipe, onClick }) => (
  <Card withBorder radius="md" p="md" onClick={onClick} style={{ cursor: 'pointer', height: '100%' }}>
    <Stack gap="xs">
      <Text fw={700}>{recipe.name}</Text>
      {recipe.description ? (
        <Text c="dimmed" size="sm" lineClamp={2}>{recipe.description}</Text>
      ) : null}
      {recipe.tags?.length ? (
        <Group gap={6}>
          {recipe.tags.slice(0, 6).map((t, i) => (
            <Badge key={`${t}-${i}`} variant="light" size="xs" color="accent">{t}</Badge>
          ))}
          {recipe.tags.length > 6 ? <Badge variant="outline" size="xs" color="accent">+{recipe.tags.length - 6}</Badge> : null}
        </Group>
      ) : null}
    </Stack>
  </Card>
);

const Recipes = () => {
  const [recipes, setRecipes] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(null);

  const [opened, setOpened] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [isDetailLoading, setIsDetailLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [form, setForm] = React.useState({ name: '', description: '', tagsInput: '', notes: '' });

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setHasError(null);
        const res = await axios.get('/api/recipes');
        if (!mounted) return;
        setRecipes(res.data || []);
      } catch (err) {
        if (!mounted) return;
        setHasError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const openModal = async (id) => {
    setOpened(true);
    setSelectedId(id);
    setIsDetailLoading(true);
    setIsEditing(false);
    try {
      const res = await axios.get(`/api/recipes/${id}`);
      const r = res.data;
      setDetail(r);
      setForm({
        name: r.name || '',
        description: r.description || '',
        tagsInput: (r.tags || []).join(', '),
        notes: r.notes || '',
      });
    } catch (err) {
      setDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeModal = () => {
    setOpened(false);
    setSelectedId(null);
    setDetail(null);
    setIsEditing(false);
    setForm({ name: '', description: '', tagsInput: '', notes: '' });
  };

  const handleSave = async () => {
    if (!detail?.id) return;
    setIsSaving(true);
    try {
      const payload = {
        ...detail,
        name: form.name.trim(),
        description: form.description.trim(),
        tags: form.tagsInput.split(',').map(s => s.trim()).filter(Boolean),
        notes: form.notes.trim(),
      };
      await axios.put(`/api/recipes/${detail.id}`, { recipe: payload });
      // update list preview fields
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === detail.id
            ? { ...r, name: payload.name, description: payload.description, tags: payload.tags, notes: payload.notes }
            : r
        )
      );
      setDetail(payload);
      setIsEditing(false);
    } catch (err) {
      // swallow for now or surface a toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack p="md">
      <Text fw={600} size="lg">Recipes</Text>

      {isLoading ? (
        <Center py="lg"><Loader size="sm" /></Center>
      ) : hasError ? (
        <Text c="red" size="sm">Failed to load recipes</Text>
      ) : recipes.length === 0 ? (
        <Text c="dimmed" size="sm">No recipes yet</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {recipes.map((r) => (
            <PreviewCard key={r.id} recipe={r} onClick={() => openModal(r.id)} />
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={closeModal} title={isEditing ? 'Edit Recipe' : 'Recipe'} size="lg" centered>
        {isDetailLoading ? (
          <Center py="md"><Loader size="sm" /></Center>
        ) : !detail ? (
          <Text c="red" size="sm">Failed to load recipe</Text>
        ) : isEditing ? (
          <Stack gap="sm">
            <TextInput
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.currentTarget.value }))}
            />
            <Textarea
              label="Description"
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.currentTarget.value }))}
            />
            <TextInput
              label="Tags (comma-separated)"
              value={form.tagsInput}
              onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.currentTarget.value }))}
            />
            <Textarea
              label="Notes"
              minRows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.currentTarget.value }))}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button color="accent" loading={isSaving} onClick={handleSave}>Save</Button>
            </Group>
          </Stack>
        ) : (
          <Stack gap="sm">
            <RecipeCard recipe={detail} />
            <Group justify="flex-end">
              <Button variant="outline" color="accent" onClick={() => setIsEditing(true)}>Edit</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};

export default Recipes;
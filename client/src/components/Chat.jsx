import React from 'react';
import { Stack, Text, ScrollArea, Group, TextInput, Button, Paper, Loader, Center, Badge } from '@mantine/core';
import { PaperPlaneRight } from '@phosphor-icons/react';
import axios from 'axios';

const EXAMPLE_PROMPTS = [
  'Plan a 3-course dinner for 4 using seasonal ingredients.',
  'Suggest a weeknight meal under 30 minutes with chicken.',
  'Create a vegetarian grocery list for 5 simple lunches.',
  'Turn these leftovers into a new dish: rice, beans, roasted veggies.',
];

const Chat = ({ currentChatId, onChatCreated = () => {} }) => {
  const [messages, setMessages] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(null);
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const loadMessages = async (chatId) => {
      try {
        setIsLoading(true);
        setHasError(null);
        const res = await axios.get('/api/chats', { params: { chatId } });
        if (!mounted) return;
        setMessages(res.data?.messages || res.data || []); // accept either format
      } catch (err) {
        if (!mounted) return;
        setHasError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
      setHasError(null);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [currentChatId]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!input.trim()) return;

    const content = input.trim();
    setIsSending(true);
    setHasError(null);

    try {
      if (!currentChatId) {
        const res = await axios.post('/api/chats', { content });
        const newChatId = res.data?.chatId ?? res.data?.id;
        const newMessages = res.data?.messages ?? [];
        if (newChatId) onChatCreated(newChatId);
        if (newMessages.length) setMessages(newMessages);
      } else {
        // Optimistic user message append
        setMessages((prev) => [...prev, { role: 'user', content }]);
        const res = await axios.post('/api/chats', { chatId: currentChatId, content });
        const returned = res.data?.messages ?? [];
        if (returned.length) setMessages(returned);
      }
      setInput('');
    } catch (err) {
      setHasError(err);
    } finally {
      setIsSending(false);
    }
  };

  const Welcome = () => (
    <Stack gap="md" p="md">
      <Text fw={700} size="lg">Welcome to Remy</Text>
      <Text c="dimmed" size="sm">
        Ask for recipes, grocery lists, and cooking guidance. Try one of these:
      </Text>
      <Stack gap="xs">
        {EXAMPLE_PROMPTS.map((p) => (
          <Badge
            key={p}
            variant="light"
            radius="sm"
            size="sm"
            style={{ cursor: 'pointer', width: 'fit-content' }}
            onClick={() => setInput(p)}
          >
            {p}
          </Badge>
        ))}
      </Stack>
    </Stack>
  );

  const Messages = () => (
    <Stack gap="xs" p="md">
      {messages.map((m, idx) => (
        <Paper
          key={idx}
          withBorder
          radius="md"
          p="sm"
          style={{
            maxWidth: '85%',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'var(--mantine-color-blue-0)' : 'white'
          }}
        >
          <Text size="sm" fw={500} mb={4}>{m.role === 'user' ? 'You' : 'Remy'}</Text>
          <Text size="sm">{m.content}</Text>
        </Paper>
      ))}
    </Stack>
  );

  return (
    <Stack style={{ height: '100%' }} gap="xs">
      <ScrollArea style={{ flex: 1 }}>
        {isLoading ? (
          <Center py="md"><Loader size="sm" /></Center>
        ) : hasError ? (
          <Text c="red" size="sm" p="md">Failed to load messages</Text>
        ) : messages.length === 0 && !currentChatId ? (
          <Welcome />
        ) : (
          <Messages />
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit}>
        <Group p="sm" gap="xs" align="center">
          <TextInput
            placeholder="Ask Remy about recipes, ingredients, or cooking..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            style={{ flex: 1 }}
            disabled={isSending}
            autoFocus
          />
          <Button
            type="submit"
            leftSection={<PaperPlaneRight size={16} />}
            loading={isSending}
          >
            Send
          </Button>
        </Group>
      </form>
    </Stack>
  );
};

export default Chat;
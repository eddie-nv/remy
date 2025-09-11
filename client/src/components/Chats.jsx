import React from 'react';
import { Stack, Button, ScrollArea, NavLink, Text, Loader, Center } from '@mantine/core';
import { Plus, ChatCircleText } from '@phosphor-icons/react';
import axios from 'axios';

const Chats = ({ onCreateChat = () => {}, onSelectChat = () => {}, currentChatId = null }) => {
  const [chats, setChats] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/chats');
        if (!mounted) return;
        setChats(res.data || []);
      } catch (err) {
        if (!mounted) return;
        setHasError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Stack gap="sm" style={{ height: '100%' }}>
      <Button fullWidth leftSection={<Plus size={16} />} onClick={onCreateChat}>
        New chat
      </Button>

      <ScrollArea style={{ flex: 1 }}>
        {isLoading ? (
          <Center py="md">
            <Loader size="sm" />
          </Center>
        ) : hasError ? (
          <Text c="red" size="sm">Failed to load chats</Text>
        ) : (
          <Stack gap={4} pb="md">
            {chats.map((chat) => (
              <NavLink
                key={chat.id}
                label={chat.title}
                leftSection={<ChatCircleText size={16} />}
                variant="light"
                active={currentChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
            {chats.length === 0 && (
              <Text c="dimmed" size="sm">No chats yet</Text>
            )}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
};

export default Chats;
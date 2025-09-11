import React from 'react';
import { Stack, Button, ScrollArea, NavLink, Text, Loader, Center, Tabs } from '@mantine/core';
import { Plus, ChatCircleText } from '@phosphor-icons/react';
import axios from 'axios';

const Chats = ({ onCreateChat = () => {}, onSelectChat = () => {}, currentChatId = null, onNavigate = () => {}, refreshKey = 0 }) => {
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
  }, [refreshKey]);

  return (
    <Stack p="sm" style={{ height: '100%' }}>
      <Button fullWidth leftSection={<Plus size={16} />} onClick={() => { onCreateChat(); onNavigate('chat'); }} color="accent">
        New Chat
      </Button>
      <Stack gap="xs">
        <Button fullWidth variant="outline" onClick={() => onNavigate('recipes')} color="accent">
            Recipes
        </Button>
        <Button fullWidth variant="outline" onClick={() => onNavigate('shopping')} color="accent">
            Shopping List
        </Button>
      </Stack>
      <Stack gap="xs">
        <Text c="dimmed" size="sm">Chats</Text>
        <ScrollArea style={{ flex: 1 }}>
            {isLoading ? (
                <Center py="md">
                    <Loader size="sm" color="accent"/>
                </Center>
            ) : hasError ? (
                <Text c="red" size="sm">Failed to load chats</Text>
            ) : (
                <Stack gap={4} pb="md">
                    {chats.map((chat) => (
                        <NavLink
                            key={chat.id}
                            leftSection={<ChatCircleText size={16} />}
                            variant="light"
                            color="accent"
                            active={currentChatId === chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            label={
                                <Text
                                    size="xs"
                                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    {chat.title}
                                </Text>
                            }
                        />
                    ))}
                    {chats.length === 0 && (
                        <Text c="dimmed" size="sm">No chats yet</Text>
                    )}
                </Stack>
            )}
        </ScrollArea>
      </Stack>
    </Stack>
  );
};

export default Chats;
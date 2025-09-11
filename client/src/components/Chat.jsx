import React, { useState, useEffect } from 'react';
import ChatInput from './ChatInput.jsx';
import { 
    Stack, 
    Text, 
    ScrollArea, 
    Loader, 
    Center 
} from '@mantine/core';
import axios from 'axios';
import { MessageList } from './MessageList.jsx';
import NewChat from './NewChat.jsx';

const Chat = ({ currentChatId, onChatCreated = () => {} }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(null);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
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

    const resendMessage = async (messageId, content) => {
        if (!currentChatId) return;
        const trimmed = (content || '').trim();
        if (!trimmed) return;

        // Optimistically trim messages and update the edited message content
        setMessages((prev) => {
          const cutoffId = Number(messageId);
          const next = prev
            .filter((m) => Number(m?.id ?? 0) <= cutoffId)
            .map((m) => (m?.id === cutoffId ? { ...m, content: trimmed } : m));
          return next;
        });

        setIsSending(true);
        setHasError(null);
        try {
          const res = await axios.post('/api/chats/resend', {
            chatId: currentChatId,
            messageId,
            content: trimmed,
          });
          const returned = res.data?.messages ?? [];
          if (returned.length) setMessages(returned);
        } catch (err) {
          setHasError(err);
        } finally {
          setIsSending(false);
        }
    };

    const sendMessage = async (content) => {
        const trimmed = content?.trim();
        if (!trimmed) return;
    
        setIsSending(true);
        setHasError(null);
    
        try {
          if (!currentChatId) {
            const res = await axios.post('/api/chats', { content: trimmed });
            const newChatId = res.data?.chatId ?? res.data?.id;
            const newMessages = res.data?.messages ?? [];
            if (newChatId) onChatCreated(newChatId);
            if (newMessages.length) setMessages(newMessages);
          } else {
            setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
            const res = await axios.post('/api/chats', { chatId: currentChatId, content: trimmed });
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

    return (
        <Stack style={{ height: '100vh' }} gap="xs">
                {isLoading ? (
                    <Center py="md" flex={1}><Loader size="sm" /></Center>
                ) : hasError ? (
                    <Center py="md" flex={1}>
                        <Text c="red" size="sm" p="md">Failed to load messages</Text>
                    </Center>
                ) : messages.length === 0 && !currentChatId ? (
                    isSending ? (
                        <Center py="md" flex={1}><Loader size="sm" /></Center>
                    ) : (
                        <NewChat onSelectSuggestion={setInput} />
                    )
                ) : (
                    <ScrollArea style={{ flex: 1, minHeight: 0 }} >
                        <MessageList messages={messages} onResendMessage={resendMessage} />
                    </ScrollArea>
                )}

            <div style={{ padding: '0.5rem' }}>
                <ChatInput
                    onSendMessage={sendMessage}
                    value={input}
                    onChange={setInput}
                    isSending={isSending}
                />
            </div>
        </Stack>
    );
};

export default Chat;
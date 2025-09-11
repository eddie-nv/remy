import React from 'react';
import { Stack, Box } from '@mantine/core';
import { MessageItem } from './MessageItem.jsx';

export const MessageList = ({ messages = [], onSendMessage, onResendMessage }) => (
  <Stack gap="xs" p="md">
    {messages.map((m, idx) => (
      <Box key={m?.id ?? idx}>
        <MessageItem
          message={m}
          messageId={m?.id ?? String(idx)}
          context={m?.context}
          onSendMessage={onSendMessage}
          onResendMessage={onResendMessage}
        />
      </Box>
    ))}
  </Stack>
);

export default MessageList;
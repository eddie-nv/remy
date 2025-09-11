import React from 'react';
import { Paper, Text, Stack } from '@mantine/core';
import ChatInput from './ChatInput.jsx';
import { RecipeCard } from './RecipeCard.jsx';

const parseMaybeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const MessageItem = ({ message, messageId, context, onSendMessage, onResendMessage }) => {
  if (message?.role === 'user') {
    return (
      <ChatInput
        onSendMessage={(content) => {
          if (onResendMessage) onResendMessage(messageId, content, context);
          else onSendMessage?.(content);
        }}
        value={message?.content ?? ''}
        clearOnSubmit={false}
      />
    );
  }

  const raw = message?.content;
  const parsed = typeof raw === 'string' ? parseMaybeJSON(raw) : (raw && typeof raw === 'object' ? raw : null);
  const isRecipe = parsed && parsed.kind === 'recipe' && parsed.recipe;

  if (isRecipe) {
    const { textBefore, recipe, textAfter } = parsed;
    return (
      <Paper bg="transparent">
        <Stack gap="xs">
          {textBefore ? <Text size="sm">{textBefore}</Text> : null}
          <RecipeCard recipe={recipe} />
          {textAfter ? <Text size="sm">{textAfter}</Text> : null}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper bg='transparent'>
      <Text size="sm">{typeof raw === 'string' ? raw : JSON.stringify(raw)}</Text>
    </Paper>
  );
};
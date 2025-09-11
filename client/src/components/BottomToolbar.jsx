// client/src/components/chat/BottomToolbar.jsx
import React from 'react';
import { Group, Button } from '@mantine/core';
import { ModelSelector } from './ModelSelector';
import { chatInputStyles } from '../styles/chatStyles';

export const BottomToolbar = ({ selectedModel, onModelChange, isSending = false }) => (
  <Group pos="absolute" bottom={0} w="100%" justify="space-between" pb={3} px="xs">
    <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
    <SubmitButton isLoading={isSending} />
  </Group>
);

export const SubmitButton = ({ isLoading = false }) => (
  <Button
    type="submit"
    size="xs"
    variant="subtle"
    color="accent"
    styles={chatInputStyles.submitButton}
    loading={isLoading}
    disabled={isLoading}
  >
    submit
  </Button>
);
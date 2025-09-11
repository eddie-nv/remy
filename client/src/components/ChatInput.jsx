// client/src/components/chat/ChatInput.jsx
import React from 'react';
import { Textarea } from '@mantine/core';
import { BottomToolbar } from './BottomToolbar';
import { chatInputStyles } from '../styles/chatStyles';

const ChatInput = ({ onSendMessage, value, onChange, isSending = false, clearOnSubmit = true }) => {
  const isControlled = typeof onChange === 'function';
  const [localInput, setLocalInput] = React.useState(value ?? '');

  React.useEffect(() => {
    if (!isControlled) {
      setLocalInput(value ?? '');
    }
  }, [value, isControlled]);

  const input = isControlled ? value : localInput;
  const setInput = isControlled ? onChange : setLocalInput;

  const [selectedModel, setSelectedModel] = React.useState('gpt-4o-mini');

  const handleInputChange = (e) => setInput(e.currentTarget.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (input || '').trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    if (clearOnSubmit) setInput('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', flex: 0 }}>
      <Textarea
        placeholder="Type your message..."
        value={input}
        onChange={handleInputChange}
        autosize
        minRows={2}
        maxRows={8}
        styles={chatInputStyles.textarea}
        autoFocus
        style={{ flex: 1 }}
        disabled={isSending}
      />
      <BottomToolbar selectedModel={selectedModel} onModelChange={setSelectedModel} isSending={isSending} />
    </form>
  );
};

export default ChatInput;
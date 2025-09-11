// client/src/components/chat/ModelSelector.jsx
import React from 'react';
import { Button, Combobox, ThemeIcon, Text, rem } from '@mantine/core';
import { useCombobox } from '@mantine/core';
import { CaretDown } from '@phosphor-icons/react';

const MODELS = ['gpt-4o-mini','gpt-4o'];

const styles = {
  button: {
    root: { fontSize: 10, height: 20, paddingInline: 2 },
    section: { marginInlineEnd: 0, marginInlineStart: 0 },
  },
};

export const ModelSelector = ({ selectedModel, onModelChange }) => {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
    },
  });

  return (
    <Combobox
      store={combobox}
      position="bottom-start"
      onOptionSubmit={(val) => {
        onModelChange(val);
        combobox.closeDropdown();
      }}
      width={120}
    >
      <Combobox.Target withAriaAttributes={false}>
        <Button
          onClick={() => combobox.toggleDropdown()}
          size="xs"
          variant="subtle"
          color="accent"
          leftSection={
            <ThemeIcon size={10} variant="transparent" color="accent">
              <CaretDown />
            </ThemeIcon>
          }
          styles={styles.button}
        >
          {selectedModel}
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {MODELS.map((model) => (
            <Combobox.Option value={model} key={model}>
              <Text size={rem(10)}>{model}</Text>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
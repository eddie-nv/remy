import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './components/App';
import { theme } from './styles/theme.js';
import '@mantine/core/styles.css';
import './styles/global.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>
);
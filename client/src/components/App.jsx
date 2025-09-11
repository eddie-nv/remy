import React from 'react';
import { AppShell, AppShellMain, AppShellNavbar } from '@mantine/core';
import Chats from './Chats.jsx';
import Chat from './Chat.jsx';

function App() {
  const [currentChatId, setCurrentChatId] = React.useState(null);

  return (
    <AppShell navbar={{ width: 250 }}>
      <AppShellNavbar>
        <Chats
          currentChatId={currentChatId}
          onCreateChat={() => setCurrentChatId(null)}
          onSelectChat={setCurrentChatId}
        />
      </AppShellNavbar>
      <AppShellMain>
        <Chat
          currentChatId={currentChatId}
          onChatCreated={setCurrentChatId}
        />
      </AppShellMain>
    </AppShell>
  );
}

export default App;
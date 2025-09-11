import React from 'react';
import { AppShell, AppShellMain, AppShellNavbar } from '@mantine/core';
import Chats from './Chats.jsx';
import Chat from './Chat.jsx';
import Recipes from './Recipes.jsx';
import ShoppingLists from './ShoppingLists.jsx';

function App() {
  const [currentChatId, setCurrentChatId] = React.useState(null);
  const [activeView, setActiveView] = React.useState('chat'); 
  const [chatsRefreshKey, setChatsRefreshKey] = React.useState(0);

  return (
    <AppShell navbar={{ width: 250 }}>
      <AppShellNavbar>
        <Chats
          currentChatId={currentChatId}
          refreshKey={chatsRefreshKey}
          onCreateChat={() => {
            setCurrentChatId(null);
            setActiveView('chat');
          }}
          onSelectChat={(id) => {
            setCurrentChatId(id);
            setActiveView('chat');
          }}
          onNavigate={setActiveView}
        />
      </AppShellNavbar>
      <AppShellMain>
        {activeView === 'chat' ? (
          <Chat
            currentChatId={currentChatId}
            onChatCreated={(id) => {
              setCurrentChatId(id);
              setActiveView('chat');
              setChatsRefreshKey((k) => k + 1);
            }}
          />
        ) : activeView === 'recipes' ? (
          <Recipes />
        ) : (
          <ShoppingLists />
        )}
      </AppShellMain>
    </AppShell>
  );
}

export default App;
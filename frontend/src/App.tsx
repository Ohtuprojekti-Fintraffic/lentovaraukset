import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import Navigation from './components/Navigation';
import { AlertContextProvider } from './contexts/alertContext';
import AlertContainer from './components/AlertContainer';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.title = `Lentovaraukset - ${process.env.COMMIT_HASH}`;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full">
        <Navigation />
        <AlertContextProvider>
          <AlertContainer />
          <main className="flex flex-row flex-grow p-10 overflow-y-auto">
            <Outlet />
          </main>
        </AlertContextProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;

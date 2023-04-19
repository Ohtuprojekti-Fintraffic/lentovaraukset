import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import Navigation from './components/Navigation';
import { AlertContextProvider } from './contexts/AlertContext';
import AlertContainer from './components/AlertContainer';
import { PopupProvider } from './contexts/PopupContext';
import Popup from './components/Popup';
import { AirportProvider } from './contexts/AirportContext';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.title = `Lentovaraukset - ${process.env.COMMIT_HASH}`;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full">
        <AirportProvider>
          <Navigation />
          <PopupProvider>
            <AlertContextProvider>
              <AlertContainer />
              <Popup />
              <main className="flex flex-row flex-grow overflow-y-auto">
                <Outlet />
              </main>
            </AlertContextProvider>
          </PopupProvider>
        </AirportProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;

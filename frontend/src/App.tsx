import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import Navigation from './components/Navigation';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
      <div id="content" className="p-6 w-full h-full">
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}

export default App;

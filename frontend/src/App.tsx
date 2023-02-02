import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import Navigation from './components/Navigation';

const queryClient = new QueryClient();

const App = () => {
  return(
    <>
      <QueryClientProvider client={queryClient}>
        <div className='flex flex-col h-full'>
          <Navigation/>
          <main className='flex flex-row flex-grow p-10 overflow-y-auto'>
            <Outlet/>
          </main>
        </div>
      </QueryClientProvider>
    </>
  )
}

export default App;

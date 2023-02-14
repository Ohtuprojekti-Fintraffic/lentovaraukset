import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import Navigation from './components/Navigation';
import Modal from './components/Modal';

const queryClient = new QueryClient();

function App() {
  
  const [show, setShow] = useState(true)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full">
        <Navigation />
        <Modal show={show} handleClose={setShow}></Modal>
        <main className="flex flex-row flex-grow p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;

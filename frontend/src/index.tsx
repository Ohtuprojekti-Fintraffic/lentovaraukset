import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import Calendar from './pages/Calendar';
import Error from './pages/Error';
import Landing from './pages/Landing';
import Staff from './pages/Staff';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: 'calendar',
        element: <Calendar />,
      },
      {
        path: 'flight-staff',
        element: <Staff />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

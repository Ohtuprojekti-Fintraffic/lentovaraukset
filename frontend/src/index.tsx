import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import ReservationCalendar from './pages/ReservationCalendar';
import TimeSlotCalendar from './pages/TimeSlotCalendar';
import Error from './pages/Error';
import Management from './pages/Management';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        element: <ReservationCalendar />,
      },
      {
        path: 'varausikkunat',
        element: <TimeSlotCalendar />,
      },
      {
        path: 'hallinta',
        element: <Management />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

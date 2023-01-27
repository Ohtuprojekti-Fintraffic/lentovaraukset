import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';
import App from './App';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import Calendar from './pages/Calendar'
import Error from './pages/Error'
import Landing from './pages/Landing';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <Error/>,
    children: [
      {
        path:'/',
        element: <Calendar/>
      },
      {
        path:'landing',
        element: <Landing/>
      }
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)

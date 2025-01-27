
import { Typography } from '@mui/material';
import './App.css';
import { MuiTypography } from './components/muitypography';
import { MuiButton } from './components/muibutton';
import { MuiTextField } from './components/muitextfield';
import { MuiSelect } from './components/muiselect';
import { MuiNavBar } from './components/muiNavbar';
import { MuiDrawer } from './components/muidrawer';
import Receipt from './routes/test/receipt'; // Adjust the path as necessary

import Expenses from './routes/expenses';
import Login from './routes/login';
import Reports from './routes/reports';
import Statements from './routes/statements';
import { BrowserRouter as Router, Routes, Route, RouterProvider, BrowserRouter, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './error-page';
import { ProtectedRoute } from './components/protectedRoute';



function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MuiDrawer />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/test/test1',
          element: <MuiTextField />
        },
        {
          path: '/test/receipt',
          element: <Receipt />
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/statements',
          element: <ProtectedRoute>
            <Statements />
          </ProtectedRoute>
        }
        ,
        {
          path: '/expenses',
          element: <ProtectedRoute><Expenses /></ProtectedRoute>
        },
        {
          path: '/reports',
          element: <ProtectedRoute><Reports /></ProtectedRoute>
        }
      ]
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;

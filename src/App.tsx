
import { Typography } from '@mui/material';
import './App.css';
import { MuiTypography } from './components/muitypography';
import { MuiButton } from './components/muibutton';
import { MuiTextField } from './components/muitextfield';
import { MuiSelect } from './components/muiselect';
import { MuiNavBar } from './components/muiNavbar';
import { MuiDrawer } from './components/muidrawer';


import Expenses from './routes/expenses';
import Login from './routes/login';
import Reports from './routes/reports';
import Statements from './routes/statements';
import AdminReports from './routes/admin/reports';
import { BrowserRouter as Router, Routes, Route, RouterProvider, BrowserRouter, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './error-page';
import { ProtectedRoute } from './components/protectedRoute';
import { useContext, useEffect } from 'react';
import { AuthContext } from './hooks/useAuth';


function usePreventRefresh(): void {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Reloading the browser will log you out!"; // Chrome requires returnValue for custom message
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
};

function App() {
  usePreventRefresh();
  const { userInfo } = useContext(AuthContext);

  console.log(`App: userInfo - ${JSON.stringify(userInfo)}`);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MuiDrawer />,
      errorElement: <ErrorPage />,
      children: [
        // {
        //   path: '/test/test1',
        //   element: <UploadReceipt_Test />
        // },
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
        },
        {
          path: '/admin/reports',
          element: <ProtectedRoute><AdminReports /></ProtectedRoute>
        },
      ]
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;

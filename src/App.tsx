"use client";

import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from './screens/HomePage';
import { ThemeProvider } from './components/ThemeProvider';
import Dashboard from './screens/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import useProfile from './hooks/use-profile';
import { useMemo } from 'react';

export default function App() {
  const { profile, isLoading, isAuthenticated } = useProfile();

  const routes = useMemo(() => {
    let baseRoutes = [
      {
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "*",
        element: <NotFound />,
        errorElement: <ErrorBoundary />,
      },
    ];

    if (isAuthenticated && profile) {
      baseRoutes.push({
        path: "/dashboard",
        element: <Dashboard />,
        errorElement: <ErrorBoundary />,
      });
    }

    return baseRoutes;
  }, [profile, isLoading, isAuthenticated]);

  return (
    <ThemeProvider>
      <div className="h-screen w-full m-0 p-0 bg-slate-50 dark:bg-slate-900">
        <RouterProvider router={createBrowserRouter(routes)} />
      </div>
    </ThemeProvider>
  )
}

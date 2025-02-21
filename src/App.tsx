"use client";

import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from './screens/HomePage';
import { ThemeProvider } from './components/ThemeProvider';
import Dashboard from './screens/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './screens/NotFound';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <div className="h-screen w-full m-0 p-0 bg-slate-50 dark:bg-slate-900">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  )
}

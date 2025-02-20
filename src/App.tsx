"use client";

import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from './screens/HomePage';
import { ThemeProvider } from './components/ThemeProvider';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
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

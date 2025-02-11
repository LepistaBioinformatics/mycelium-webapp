import './App.css'
import { createBrowserRouter, RouterProvider, Link } from "react-router";
import HomePage from './screens/HomePage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <RouterProvider router={router} />
    </div>
  )
}

export default App;

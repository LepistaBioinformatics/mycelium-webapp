import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from './screens/HomePage';
import Dashboard from './screens/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import useProfile from './hooks/use-profile';
import Profile from './screens/Dashboard/Profile';

export default function App() {
  const { profile, isAuthenticated } = useProfile();

  return (
    <div className="h-screen w-full m-0 p-0 bg-slate-50 dark:bg-slate-900">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} errorElement={<ErrorBoundary />} />

          <Route path="/dashboard" element={<Dashboard />} errorElement={<ErrorBoundary />}>
            {isAuthenticated && profile && (
              <Route index element={<Profile />} errorElement={<ErrorBoundary />} />
            )}

            {isAuthenticated && profile && (
              <Route path="profile" element={<Profile />} errorElement={<ErrorBoundary />} />
            )}
          </Route>

          <Route path="*" element={<NotFound />} errorElement={<ErrorBoundary />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from './screens/HomePage';
import Dashboard from './screens/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import useProfile from './hooks/use-profile';
import Profile from './screens/Dashboard/components/Profile';
import Staff from './screens/Dashboard/components/super-users/Staff';
import store from './states/store';
import { Provider as ReduxProvider } from 'react-redux';
import Tenants from './screens/Dashboard/components/Tenants';

export default function App() {
  const { profile, isAuthenticated, adminAccess } = useProfile();

  return (
    <ReduxProvider store={store}>
      <div className="h-screen w-full m-0 p-0 bg-slate-50 dark:bg-slate-900">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} errorElement={<ErrorBoundary />} />

            <Route path="/dashboard" element={<Dashboard />} errorElement={<ErrorBoundary />}>
              {isAuthenticated && profile && (
                <>
                  <Route index element={<Profile />} errorElement={<ErrorBoundary />} />
                  <Route path="profile" element={<Profile />} errorElement={<ErrorBoundary />} />

                  {adminAccess && (
                    <Route path="tenants" element={<Tenants />} errorElement={<ErrorBoundary />} />
                  )}

                  {profile.isStaff && (
                    <Route path="staff" element={<Staff />} errorElement={<ErrorBoundary />} />
                  )}
                </>
              )}
            </Route>

            <Route path="*" element={<NotFound />} errorElement={<ErrorBoundary />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ReduxProvider>
  )
}

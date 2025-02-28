import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import useProfile from './hooks/use-profile';
import store from './states/store';
import { Provider as ReduxProvider } from 'react-redux';
import { ROUTES } from './constants/routes';

export default function App() {
  const { profile, isAuthenticated, adminAccess } = useProfile();

  return (
    <ReduxProvider store={store}>
      <div className="w-full m-0 p-0 bg-slate-50 dark:bg-slate-900">
        <BrowserRouter>
          <Routes>
            <Route
              path={ROUTES.HOME.path}
              element={ROUTES.HOME.element}
              errorElement={ROUTES.HOME.errorElement}
            />

            <Route
              path={ROUTES.DASHBOARD.path}
              element={ROUTES.DASHBOARD.element}
              errorElement={ROUTES.DASHBOARD.errorElement}
            >
              {isAuthenticated && profile && (
                <>
                  <Route
                    index
                    element={ROUTES.PROFILE.element}
                    errorElement={ROUTES.PROFILE.errorElement}
                  />

                  <Route
                    path={ROUTES.PROFILE.path}
                    element={ROUTES.PROFILE.element}
                    errorElement={ROUTES.PROFILE.errorElement}
                  />

                  {adminAccess && (
                    <Route
                      path={ROUTES.TENANTS.path}
                      element={ROUTES.TENANTS.element}
                      errorElement={ROUTES.TENANTS.errorElement}
                    />
                  )}

                  {profile.isStaff && (
                    <Route
                      path={ROUTES.STAFF.path}
                      element={ROUTES.STAFF.element}
                      errorElement={ROUTES.STAFF.errorElement}
                    />
                  )}

                  <Route
                    path={ROUTES.ACCOUNTS.path}
                    element={ROUTES.ACCOUNTS.element}
                    errorElement={ROUTES.ACCOUNTS.errorElement}
                  />

                  <Route
                    path={ROUTES.GUEST_ROLES.path}
                    element={ROUTES.GUEST_ROLES.element}
                    errorElement={ROUTES.GUEST_ROLES.errorElement}
                  />

                  <Route
                    path={ROUTES.WEBHOOKS.path}
                    element={ROUTES.WEBHOOKS.element}
                    errorElement={ROUTES.WEBHOOKS.errorElement}
                  />

                  <Route
                    path={ROUTES.ERROR_CODES.path}
                    element={ROUTES.ERROR_CODES.element}
                    errorElement={ROUTES.ERROR_CODES.errorElement}
                  />
                </>
              )}
            </Route>

            <Route
              path="*"
              element={<NotFound />}
              errorElement={<ErrorBoundary />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </ReduxProvider>
  )
}

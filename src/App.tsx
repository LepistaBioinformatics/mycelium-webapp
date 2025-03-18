import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import useProfile from './hooks/use-profile';
import buildRoutes, { HOME_ROUTE, DASHBOARD_ROUTE } from './constants/routes';
import { Fragment, useMemo } from 'react';

export default function App() {
  const { profile } = useProfile();

  const ROUTES = useMemo(() => {
    if (!profile) return [];

    return buildRoutes(profile);
  }, [profile]);

  return (
    <div className="w-full m-0 p-0 bg-slate-50 dark:bg-slate-900">
      <BrowserRouter>
        <Routes>
          <Route
            path={HOME_ROUTE.path}
            element={HOME_ROUTE.element}
            errorElement={HOME_ROUTE.errorElement}
          />

          <Route
            path={DASHBOARD_ROUTE.path}
            element={DASHBOARD_ROUTE.element}
            errorElement={DASHBOARD_ROUTE.errorElement}
          >
            {ROUTES
              .sort((a, b) => a.position - b.position)
              .map((route) => (
                <Fragment key={route.path}>
                  <Route
                    path={route.path}
                    element={route.element}
                    errorElement={route.errorElement}
                  />

                  {route?.children?.map((child) => (
                    <Route
                      key={child.path}
                      path={child.path}
                      element={child.element}
                      errorElement={child.errorElement}
                      hasErrorBoundary
                    />
                  ))}

                  <Route
                    path="*"
                    element={<NotFound />}
                    errorElement={<ErrorBoundary />}
                  />
                </Fragment>
              ))}

            <Route
              path="*"
              element={<NotFound />}
              errorElement={<ErrorBoundary />}
            />
          </Route>

          <Route
            path="*"
            element={<NotFound />}
            errorElement={<ErrorBoundary />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

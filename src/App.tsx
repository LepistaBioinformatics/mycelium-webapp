import "./i18n/config";
import { BrowserRouter, Routes, Route } from "react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import useProfile from "./hooks/use-profile";
import buildRoutes, { HOME_ROUTE, DASHBOARD_ROUTE } from "./constants/routes";
import { Fragment, useMemo } from "react";
import Profile from "./screens/Dashboard/components/Profile";
import MobileNavbar from "./components/ui/MobileNavbar";

export default function App() {
  const { profile } = useProfile();

  const ROUTES = useMemo(() => {
    if (!profile) return [];

    return buildRoutes(profile);
  }, [profile]);

  return (
    <div id="App" className="bg-slate-50 dark:bg-slate-900">
      <BrowserRouter>
        <Routes>
          <Route
            index
            path={HOME_ROUTE.path}
            element={HOME_ROUTE.element}
            errorElement={HOME_ROUTE.errorElement}
          />

          <Route
            path={DASHBOARD_ROUTE.path}
            element={DASHBOARD_ROUTE.element}
            errorElement={DASHBOARD_ROUTE.errorElement}
          >
            <Route
              index
              element={<Profile />}
              errorElement={<ErrorBoundary />}
            />

            {ROUTES.sort((a, b) => a.position - b.position).map((route) => (
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
              </Fragment>
            ))}
          </Route>

          <Route
            caseSensitive
            path="*"
            element={<NotFound />}
            errorElement={<ErrorBoundary />}
          />
        </Routes>

        <MobileNavbar />
      </BrowserRouter>
    </div>
  );
}

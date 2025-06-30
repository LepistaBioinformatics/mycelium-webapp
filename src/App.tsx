import "./i18n/config";
import { BrowserRouter, Routes, Route } from "react-router";
import NotFound from "./components/NotFound";
import useProfile from "./hooks/use-profile";
import buildRoutes, { HOME_ROUTE, DASHBOARD_ROUTE } from "./constants/routes";
import { Fragment, useMemo } from "react";
import Profile from "./screens/Dashboard/components/Profile";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();

  const { profile } = useProfile();

  const ROUTES = useMemo(() => {
    if (!profile) return [];

    return buildRoutes(profile, t, "Menu");
  }, [profile, t]);

  return (
    <div id="App" className="bg-zinc-50 dark:bg-zinc-900">
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path={HOME_ROUTE.path} element={HOME_ROUTE.element} />
          <Route path={DASHBOARD_ROUTE.path} element={DASHBOARD_ROUTE.element}>
            <Route index element={<Profile />} />

            {ROUTES.sort((a, b) => a.position - b.position).map((route) => (
              <Fragment key={route.path}>
                <Route path={route.path} element={route.element} />

                {route?.children?.map((child) => (
                  <Fragment key={child.path}>
                    <Route
                      key={child.path}
                      path={child.path}
                      element={child.element}
                    />

                    {child?.children?.map((child) => (
                      <Fragment key={child.path}>
                        <Route
                          key={child.path}
                          path={child.path}
                          element={child.element}
                        />
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

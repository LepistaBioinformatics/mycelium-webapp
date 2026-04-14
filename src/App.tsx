import "./i18n/config";
import { Routes, Route } from "react-router";
import NotFound from "./components/NotFound";
import useProfile from "./hooks/use-profile";
import buildRoutes, { HOME_ROUTE, DASHBOARD_ROUTE } from "./constants/routes";
import { Fragment, lazy, useMemo } from "react";
import { useTranslation } from "react-i18next";
import LoginPage from "@/screens/LoginPage";

const Onboarding = lazy(() => import("@/screens/Dashboard/components/Onboarding"));

export default function App() {
  const { t } = useTranslation();

  const { profile } = useProfile();

  const ROUTES = useMemo(() => {
    if (!profile) return [];

    return buildRoutes(profile, t, "Menu");
  }, [profile, t]);

  return (
    <div id="App" className="bg-white dark:bg-zinc-900">
      <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path={HOME_ROUTE.path} element={HOME_ROUTE.element} />
          <Route path={DASHBOARD_ROUTE.path} element={DASHBOARD_ROUTE.element}>
            <Route index element={<Onboarding />} />

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
    </div>
  );
}

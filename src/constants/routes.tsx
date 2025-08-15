import HomePage from "@/screens/HomePage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RiDashboardFill, RiRouteFill } from "react-icons/ri";
import { SlOrganization } from "react-icons/sl";
import { MdManageAccounts } from "react-icons/md";
import { FaUserCheck } from "react-icons/fa";
import { MdNearbyError } from "react-icons/md";
import { MdWebhook } from "react-icons/md";
import { components } from "@/services/openapi/mycelium-schema";
import AdvancedManagement from "@/screens/Dashboard/components/Tenants/Details";
import React, { lazy } from "react";
import { TFunction } from "i18next";

const Dashboard = lazy(() => import("@/screens/Dashboard"));
const Discovery = lazy(
  () => import("@/screens/Dashboard/components/Discovery")
);
const Profile = lazy(() => import("@/screens/Dashboard/components/Profile"));
const Tenants = lazy(() => import("@/screens/Dashboard/components/Tenants"));
const Accounts = lazy(() => import("@/screens/Dashboard/components/Accounts"));
const GuestRoles = lazy(
  () => import("@/screens/Dashboard/components/GuestRoles")
);
const ErrorCodes = lazy(
  () => import("@/screens/Dashboard/components/ErrorCodes")
);
const Webhooks = lazy(() => import("@/screens/Dashboard/components/WebHooks"));

type ProfileType = components["schemas"]["Profile"];

export interface AppRoute {
  position: number;
  name: string;
  translationKey: string;
  path: string;
  element: React.ReactNode;
  errorElement: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  shouldBeManager?: boolean;
  shouldBeStaff?: boolean;
  children?: AppRoute[];
}

export const HOME_ROUTE = {
  name: "Home",
  path: "/",
  translationKey: "home",
  element: <HomePage />,
  errorElement: <ErrorBoundary />,
  position: 0,
} as AppRoute;

export const DASHBOARD_ROUTE = {
  name: "Dashboard",
  path: "/dashboard",
  translationKey: "dashboard",
  element: <Dashboard />,
  errorElement: <ErrorBoundary />,
  position: 1,
} as AppRoute;

export const PROFILE_ROUTE = {
  name: "Profile",
  path: "/dashboard/profile",
  translationKey: "profile",
  element: <Profile />,
  errorElement: <ErrorBoundary />,
  icon: <RiDashboardFill />,
  position: 1,
} as AppRoute;

const ROUTES = {
  PROFILE: PROFILE_ROUTE,
  TENANTS: {
    name: "Tenants",
    path: "/dashboard/tenants",
    translationKey: "tenants",
    element: <Tenants />,
    errorElement: <ErrorBoundary />,
    icon: <SlOrganization />,
    shouldBeManager: true,
    shouldBeStaff: true,
    position: 4,
    children: [
      {
        name: "Tenant",
        path: "/dashboard/tenants/:tenantId",
        element: <AdvancedManagement />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            name: "Tenant",
            path: "/dashboard/tenants/:tenantId/accounts",
            element: (
              <Accounts
                restrictAccountTypeTo={[
                  "subscription",
                  "tenantManager",
                  "roleAssociated",
                ]}
              />
            ),
            errorElement: <ErrorBoundary />,
          },
        ],
      },
    ],
  } as AppRoute,
  ACCOUNTS: {
    name: "Accounts",
    path: "/dashboard/accounts",
    translationKey: "accounts",
    element: (
      <Accounts
        restrictAccountTypeTo={["user", "manager", "staff", "actorAssociated"]}
      />
    ),
    errorElement: <ErrorBoundary />,
    icon: <MdManageAccounts />,
    position: 5,
  } as AppRoute,
  GUEST_ROLES: {
    name: "Guest roles",
    path: "/dashboard/guest-roles",
    translationKey: "guestRoles",
    element: <GuestRoles />,
    errorElement: <ErrorBoundary />,
    icon: <FaUserCheck />,
    position: 6,
  } as AppRoute,
  ERROR_CODES: {
    name: "Error codes",
    path: "/dashboard/error-codes",
    translationKey: "errorCodes",
    element: <ErrorCodes />,
    errorElement: <ErrorBoundary />,
    icon: <MdNearbyError />,
    position: 7,
  } as AppRoute,
  WEBHOOKS: {
    name: "Webhooks",
    path: "/dashboard/webhooks",
    translationKey: "webhooks",
    element: <Webhooks />,
    errorElement: <ErrorBoundary />,
    icon: <MdWebhook />,
    position: 8,
  } as AppRoute,
  DISCOVERY: {
    name: "Discovery",
    path: "/dashboard/discovery",
    translationKey: "operations",
    element: <Discovery />,
    errorElement: <ErrorBoundary />,
    icon: <RiRouteFill />,
    position: 10,
  } as AppRoute,
} as const;

/**
 * Build the routes based on the profile
 *
 * @param profile - The profile of the user
 * @returns The routes that the user should see
 */
export default function buildRoutes(
  profile: ProfileType,
  t: TFunction,
  tPath: string
) {
  return Object.values(ROUTES).map((route) => {
    route.name = t(`${tPath}.${route.translationKey}`);

    if (route.shouldBeStaff && !profile.isStaff)
      return { ...route, disabled: true };
    if (route.shouldBeManager && !profile.isManager)
      return { ...route, disabled: true };

    return route;
  });
}

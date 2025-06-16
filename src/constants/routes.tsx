import HomePage from "@/screens/HomePage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RiDashboardFill, RiRouteFill } from "react-icons/ri";
import { SlOrganization } from "react-icons/sl";
import { MdManageAccounts } from "react-icons/md";
import { FaUserCheck } from "react-icons/fa";
import { MdNearbyError } from "react-icons/md";
import { MdWebhook } from "react-icons/md";
//import { TbApi } from "react-icons/tb";
import { components } from "@/services/openapi/mycelium-schema";
import AdvancedManagement from "@/screens/Dashboard/components/Tenants/AdvancedManagement";
import React, { lazy } from "react";

const Dashboard = lazy(() => import("@/screens/Dashboard"));
//const Services = lazy(() => import("@/screens/Dashboard/components/Services"));
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
  element: <HomePage />,
  errorElement: <ErrorBoundary />,
  position: 0,
} as AppRoute;

export const DASHBOARD_ROUTE = {
  name: "Dashboard",
  path: "/dashboard",
  element: <Dashboard />,
  errorElement: <ErrorBoundary />,
  position: 1,
} as AppRoute;

export const PROFILE_ROUTE = {
  name: "Profile",
  path: "/dashboard/profile",
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
      },
    ],
  } as AppRoute,
  ACCOUNTS: {
    name: "Accounts",
    path: "/dashboard/accounts",
    element: <Accounts />,
    errorElement: <ErrorBoundary />,
    icon: <MdManageAccounts />,
    position: 5,
  } as AppRoute,
  GUEST_ROLES: {
    name: "Guest roles",
    path: "/dashboard/guest-roles",
    element: <GuestRoles />,
    errorElement: <ErrorBoundary />,
    icon: <FaUserCheck />,
    position: 6,
  } as AppRoute,
  ERROR_CODES: {
    name: "Error codes",
    path: "/dashboard/error-codes",
    element: <ErrorCodes />,
    errorElement: <ErrorBoundary />,
    icon: <MdNearbyError />,
    position: 7,
  } as AppRoute,
  WEBHOOKS: {
    name: "Webhooks",
    path: "/dashboard/webhooks",
    element: <Webhooks />,
    errorElement: <ErrorBoundary />,
    icon: <MdWebhook />,
    position: 8,
  } as AppRoute,
  /* SERVICES: {
    name: "Services",
    path: "/dashboard/services",
    element: <Services />,
    errorElement: <ErrorBoundary />,
    icon: <TbApi />,
    position: 9,
  } as AppRoute, */
  DISCOVERY: {
    name: "Discovery",
    path: "/dashboard/discovery",
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
export default function buildRoutes(profile: ProfileType) {
  return Object.values(ROUTES).map((route) => {
    if (route.shouldBeStaff && !profile.isStaff)
      return { ...route, disabled: true };
    if (route.shouldBeManager && !profile.isManager)
      return { ...route, disabled: true };

    return route;
  });
}

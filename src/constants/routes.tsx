import HomePage from '@/screens/HomePage';
import Dashboard from '@/screens/Dashboard';
import ErrorBoundary from '@/components/ErrorBoundary';
import Profile from '@/screens/Dashboard/components/Profile';
import Staff from '@/screens/Dashboard/components/super-users/Staff';
import Tenants from '@/screens/Dashboard/components/Tenants';
import Accounts from '@/screens/Dashboard/components/Accounts';
import GuestRoles from '@/screens/Dashboard/components/GuestRoles';
import Webhooks from '@/screens/Dashboard/components/WebHooks';
import ErrorCodes from '@/screens/Dashboard/components/ErrorCodes';
import { RiDashboardFill } from 'react-icons/ri';
import { GiWizardStaff } from 'react-icons/gi';
import { SlOrganization } from 'react-icons/sl';
import { MdManageAccounts } from 'react-icons/md';
import { FaUserCheck } from "react-icons/fa";
import { MdNearbyError } from "react-icons/md";
import { MdWebhook } from "react-icons/md";
import { components } from '@/services/openapi/mycelium-schema';
import AdvancedManagement from '@/screens/Dashboard/components/Tenants/AdvancedManagement';

type Profile = components["schemas"]["Profile"];

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
            }
        ]
    } as AppRoute,
    STAFF: {
        name: "Staff",
        path: "/dashboard/staff",
        element: <Staff />,
        errorElement: <ErrorBoundary />,
        icon: <GiWizardStaff />,
        shouldBeManager: false,
        shouldBeStaff: true,
        position: 3,
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
} as const;

/**
 * Build the routes based on the profile
 * 
 * @param profile - The profile of the user
 * @returns The routes that the user should see
 */
export default function buildRoutes(profile: Profile) {
    return Object.values(ROUTES).map((route) => {
        if (route.shouldBeStaff && !profile.isStaff) return { ...route, disabled: true };
        if (route.shouldBeManager && !profile.isManager) return { ...route, disabled: true };

        return route;
    });
}

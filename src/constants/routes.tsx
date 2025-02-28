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

export interface AppRoute {
    name: string;
    path: string;
    element: React.ReactNode;
    errorElement: React.ReactNode;
    icon?: React.ReactNode;
}

export const ROUTES = {
    HOME: {
        name: "Home",
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorBoundary />,
    } as AppRoute,
    DASHBOARD: {
        name: "Dashboard",
        path: "/dashboard",
        element: <Dashboard />,
        errorElement: <ErrorBoundary />,
    } as AppRoute,
    PROFILE: {
        name: "Profile",
        path: "/dashboard/profile",
        element: <Profile />,
        errorElement: <ErrorBoundary />,
        icon: <RiDashboardFill />,
    } as AppRoute,
    TENANTS: {
        name: "Tenants",
        path: "/dashboard/tenants",
        element: <Tenants />,
        errorElement: <ErrorBoundary />,
        icon: <SlOrganization />,
    } as AppRoute,
    STAFF: {
        name: "Staff",
        path: "/dashboard/staff",
        element: <Staff />,
        errorElement: <ErrorBoundary />,
        icon: <GiWizardStaff />,
    } as AppRoute,
    ACCOUNTS: {
        name: "Accounts",
        path: "/dashboard/accounts",
        element: <Accounts />,
        errorElement: <ErrorBoundary />,
        icon: <MdManageAccounts />,
    } as AppRoute,
    GUEST_ROLES: {
        name: "Guest roles",
        path: "/dashboard/guest-roles",
        element: <GuestRoles />,
        errorElement: <ErrorBoundary />,
        icon: <FaUserCheck />,
    } as AppRoute,
    WEBHOOKS: {
        name: "Webhooks",
        path: "/dashboard/webhooks",
        element: <Webhooks />,
        errorElement: <ErrorBoundary />,
        icon: <MdWebhook />,
    } as AppRoute,
    ERROR_CODES: {
        name: "Error codes",
        path: "/dashboard/error-codes",
        element: <ErrorCodes />,
        errorElement: <ErrorBoundary />,
        icon: <MdNearbyError />,
    } as AppRoute,
} as const;

import Sidebar from "@/components/ui/Sidebar";
import Skeleton from "@/components/ui/Skeleton";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { Link, Outlet } from "react-router";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useMemo, useState } from "react";
import useSWR from "swr";
import Modal from "@/components/ui/Modal";
import buildRoutes from "@/constants/routes";
import useProfile from "@/hooks/use-profile";
import AppNotifications from "@/components/AppNotifications";
import RequiredContactInfoBanner from "@/components/RequiredContactInfoBanner";
import MobileNavbar from "@/components/ui/MobileNavbar";
import { useTranslation } from "react-i18next";
import { accountsGet } from "@/services/rpc/beginners";
import { components } from "@/services/openapi/mycelium-schema";
import {
  hasRealAccountName,
  onboardingProgress,
} from "@/functions/onboarding-progress";
import isPrivilegedAccount from "@/functions/is-privileged-account";
import AccountDetails from "./components/Accounts/AccountDetails";

export default function Dashboard() {
  const { t } = useTranslation();

  const { isOpen, toggle } = useToggleSidebar(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { profile } = useProfile();

  const ROUTES = useMemo(() => {
    if (!profile) return [];

    return buildRoutes(profile, t, "Menu");
  }, [profile]);

  const logout = () => {
    setShowLogoutModal(true);
  };

  return (
    <div
      id="Dashboard"
      className="relative flex min-h-screen max-h-screen w-screen overflow-y-auto overflow-x-hidden scrollbar"
    >
      {/* Layout spacer — holds the sidebar slot so content is never hidden behind it.
          Sidebar itself is absolute, so hover-expansion overlays without pushing content. */}
      <div
        className={`hidden sm:block shrink-0 transition-all duration-300 ease-in-out ${isOpen ? "w-48" : "w-12"}`}
        aria-hidden="true"
      />

      <Sidebar
        isOpen={isOpen}
        toggle={toggle}
        mainHeader={<MainHeader isOpen={isOpen} />}
        logout={logout}
      >
        {ROUTES.sort((a, b) => a.position - b.position).map((route) => (
          <Sidebar.Item
            key={route.path}
            icon={route.icon}
            href={route.path}
            text={route.name}
            isOpen={isOpen}
          />
        ))}
      </Sidebar>

      <div className="flex-1 overflow-y-auto scrollbar pb-16 sm:pb-0">
        <RequiredContactInfoBanner />
        <Outlet />
        {/* Account details open on top of any page (?accountId=) */}
        <AccountDetails />
      </div>

      <LogoutModal show={showLogoutModal} setShow={setShowLogoutModal} />
      <AppNotifications />

      <MobileNavbar />
    </div>
  );
}

function LogoutModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const { logout } = useProfile();

  return (
    <Modal open={show}>
      <Modal.Header handleClose={() => setShow(false)}>
        <Typography as="h2">Logout</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col justify-center items-center gap-2 w-full">
          <div>
            <Typography center>Are you sure you want to logout?</Typography>
          </div>

          <div className="flex justify-end gap-2">
            <Button intent="secondary" onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button intent="warning" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

type Account = components["schemas"]["Account"];

function MainHeader({ isOpen }: { isOpen: boolean }) {
  const { t } = useTranslation();
  const { user, profile, getAccessTokenSilently } = useProfile();

  // Same SWR key as the Profile screen, so both share one request
  const { data: account } = useSWR<Account | null>(
    user?.email ? "rpc:beginners.accounts.get" : null,
    () => accountsGet(getAccessTokenSilently),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const email = user?.email
    ? `${user.email.username}@${user.email.domain}`
    : undefined;
  const isLoading = account === undefined;
  const progress = onboardingProgress(
    account,
    email,
    isPrivilegedAccount(profile)
  );
  const showProgress = !isLoading && !progress.isComplete;
  const displayName = hasRealAccountName(account, email)
    ? account?.name
    : user?.email?.username;
  const initials = (displayName?.[0] ?? "?").toUpperCase();

  return (
    <Link
      to="/dashboard"
      title={t("Menu.gettingStarted")}
      className="flex items-center mx-1.5 px-2 w-[calc(100%-0.75rem)] min-h-12 rounded-md transition-colors hover:bg-zinc-200/60 dark:hover:bg-surface-800 outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50"
    >
      <AvatarWithProgress
        initials={initials}
        percent={showProgress ? progress.percent : null}
      />

      <div
        className={[
          "flex flex-col min-w-0",
          isOpen
            ? "ml-2.5"
            : "hidden group-hover/sidebar:flex group-hover/sidebar:ml-2.5",
        ].join(" ")}
      >
        <span className="text-sm font-medium text-foreground truncate">
          {displayName ?? "…"}
        </span>
        {isLoading && <Skeleton className="w-16 mt-1" />}
        {showProgress && (
          <span className="text-xs text-muted-foreground">
            {t("Menu.onboardingProgress", { percent: progress.percent })}
          </span>
        )}
        {!isLoading && !showProgress && (
          <span className="text-[11px] leading-tight text-muted-foreground truncate">
            {email}
          </span>
        )}
      </div>
    </Link>
  );
}

/** The user's initial; while onboarding runs, wrapped in a progress ring */
function AvatarWithProgress({
  initials,
  percent,
}: {
  initials: string;
  percent: number | null;
}) {
  const ringSize = 32;
  const strokeWidth = 2;
  const center = ringSize / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="shrink-0 grid" style={{ width: ringSize, height: ringSize }}>
      {percent !== null && (
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          style={{ gridArea: "1/1", transform: "scaleX(-1) rotate(-90deg)" }}
          aria-hidden
        >
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-200 dark:text-zinc-700" />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} className="text-primary dark:text-brand-300 transition-all duration-500" />
        </svg>
      )}
      <div style={{ gridArea: "1/1" }} className="flex items-center justify-center">
        <div
          className={[
            "rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200 ring-1 ring-brand-200 dark:ring-brand-700 flex items-center justify-center font-bold select-none",
            percent !== null ? "size-5 text-xs" : "size-8 text-sm",
          ].join(" ")}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

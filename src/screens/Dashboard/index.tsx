import Sidebar from "@/components/ui/Sidebar";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { Outlet } from "react-router";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import buildRoutes from "@/constants/routes";
import useProfile from "@/hooks/use-profile";
import AppNotifications from "@/components/AppNotifications";
import MobileNavbar from "@/components/ui/MobileNavbar";
import { useTranslation } from "react-i18next";
import { accountsGet } from "@/services/rpc/beginners";
import { components } from "@/services/openapi/mycelium-schema";

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
        <Outlet />
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

const ONBOARDING_TOTAL = 4;

function onboardingSteps(acc: Account | null): number {
  if (!acc) return 0;
  const meta = (acc.meta ?? {}) as Record<string, string>;
  return (
    1 +
    (meta.locale ? 1 : 0) +
    (meta.phone_number ? 1 : 0) +
    (meta.telegram_user || meta.whatsapp_user ? 1 : 0)
  );
}

function MainHeader({ isOpen }: { isOpen: boolean }) {
  const { user, getAccessTokenSilently } = useProfile();
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    accountsGet(getAccessTokenSilently)
      .then((acc) => setCompletedSteps(onboardingSteps(acc)))
      .catch(() => {});
  }, [user?.email, getAccessTokenSilently]);

  const initials = user?.email
    ? (user.email.username[0] ?? "?").toUpperCase()
    : "?";

  const pct = Math.round((completedSteps / ONBOARDING_TOTAL) * 100);
  const sw = 2;

  // SVG ring sized to match the w-4 icon slot (16px) + px-3 sidebar rhythm
  // Avatar fits inside the 2.5rem (40px) row height
  const ringSize = 32;
  const ringCx = ringSize / 2;
  const ringR = ringCx - sw;
  const ringCircumference = 2 * Math.PI * ringR;
  const ringOffset = ringCircumference * (1 - pct / 100);

  return (
    <div className="flex items-center px-3 w-full min-h-[2.5rem]">
      {/* Avatar with progress ring — same slot as nav icons */}
      <div className="shrink-0 grid" style={{ width: ringSize, height: ringSize }}>
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          style={{ gridArea: "1/1", transform: "scaleX(-1) rotate(-90deg)" }}
        >
          <circle cx={ringCx} cy={ringCx} r={ringR} fill="none" stroke="currentColor" strokeWidth={sw} className="text-zinc-200 dark:text-zinc-700" />
          <circle cx={ringCx} cy={ringCx} r={ringR} fill="none" stroke="currentColor" strokeWidth={sw} strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} strokeLinecap="butt" className="text-brand-violet-500 dark:text-brand-violet-400 transition-all duration-500" />
        </svg>
        <div style={{ gridArea: "1/1" }} className="flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-brand-violet-500 dark:bg-brand-violet-400 flex items-center justify-center text-white text-xs font-bold select-none">
            {initials}
          </div>
        </div>
      </div>

      {/* Username + progress — visible when expanded */}
      <div
        className={[
          "flex flex-col min-w-0",
          isOpen
            ? "ml-2"
            : "hidden group-hover/sidebar:flex group-hover/sidebar:ml-2",
        ].join(" ")}
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
          {user?.email?.username ?? "…"}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {pct}%
        </span>
      </div>
    </div>
  );
}

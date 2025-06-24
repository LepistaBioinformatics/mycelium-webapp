import { cva, VariantProps } from "class-variance-authority";
import { TiThMenu } from "react-icons/ti";
import { Link } from "react-router";
import Modal from "./Modal";
import Typography from "./Typography";
import { useMemo, useState } from "react";
import buildRoutes from "@/constants/routes";
import useProfile from "@/hooks/use-profile";
import { IoHomeSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { IoMdSettings } from "react-icons/io";
import LanguageSwitcher from "../LanguageSwitcher";
import SignOutButton from "./SignOutButton";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth0 } from "@auth0/auth0-react";

const styles = cva(
  "sm:hidden h-16 z-[999] fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 flex items-center justify-around px-4 border-t-2 border-gray-200 dark:border-gray-800",
  {
    variants: {},
  }
);

interface Props extends VariantProps<typeof styles> {}

export default function MobileNavbar({}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={styles({})}>
      <NavbarItem
        icon={
          <IoHomeSharp className="text-2xl text-indigo-500 dark:text-lime-500" />
        }
        label="Profile"
        href="/dashboard/profile"
      />

      <NavbarItem
        icon={
          <TiThMenu className="text-2xl text-indigo-500 dark:text-lime-500" />
        }
        label="Menu"
        onClick={() => setIsMenuOpen(true)}
      />

      <NavbarItem
        icon={
          <IoMdSettings className="text-2xl text-indigo-500 dark:text-lime-500" />
        }
        label="Settings"
        onClick={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <MenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}

function NavbarItem({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <Link to={href} title={label} onClick={onClick}>
        {icon}
      </Link>
    );
  }

  return <button onClick={onClick}>{icon}</button>;
}

function MenuModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { profile } = useProfile();

  const ROUTES = useMemo(() => {
    if (!profile) return [];

    return buildRoutes(profile, t, "Menu");
  }, [profile]);

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>{t("Menu.title")}</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-3 px-4">
          {ROUTES.sort((a, b) => a.position - b.position).map((route) => (
            <Link
              key={route.path}
              to={route.path}
              title={route.name}
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <span className="text-2xl text-indigo-500 dark:text-lime-500">
                {route.icon}
              </span>
              <Typography>{route.name}</Typography>
            </Link>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}

function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { logout } = useAuth0();

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>{t("Menu.settings")}</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-3 px-4 w-full">
          <div className="flex flex-col gap-2">
            <Typography>{t("Menu.subtitle")}</Typography>
            <div className="items-center text-center bg-indigo-50 dark:bg-zinc-700 rounded-full p-2 transition-all">
              <LanguageSwitcher horizontal keepOpen />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Typography>{t("Menu.theme")}</Typography>
            <div className="flex justify-center gap-3 items-center text-center bg-indigo-50 dark:bg-zinc-700 rounded-full p-2 transition-all">
              <ThemeSwitcher />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Typography>{t("Menu.logout")}</Typography>
            <SignOutButton logout={logout} />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

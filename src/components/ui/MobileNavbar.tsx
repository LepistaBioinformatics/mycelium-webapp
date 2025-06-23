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

const styles = cva(
  "sm:hidden h-16 fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 flex items-center justify-around px-4 border-t-2 border-gray-200 dark:border-gray-800",
  {
    variants: {},
  }
);

interface Props extends VariantProps<typeof styles> {}

export default function MobileNavbar({}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles({})}>
      <NavbarItem
        icon={<IoHomeSharp className="text-2xl text-lime-500" />}
        label="Profile"
        href="/dashboard/profile"
      />

      <NavbarItem
        icon={<TiThMenu className="text-2xl text-lime-500" />}
        label="Menu"
        onClick={() => setIsMenuOpen(true)}
      />

      <NavbarItem
        icon={<IoMdSettings className="text-2xl text-lime-500" />}
        label="Settings"
        href="/dashboard/settings"
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
        <Typography>Menu</Typography>
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
              <span className="text-2xl text-lime-500 text-indigo-500">
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

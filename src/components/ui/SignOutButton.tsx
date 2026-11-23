import { PiSignOutBold } from "react-icons/pi";
import { useTranslation } from "react-i18next";

const ROW =
  "flex items-center mx-1.5 px-2 w-[calc(100%-0.75rem)] min-h-9 rounded-md text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50";
const ICON = "shrink-0 w-4 h-4 flex items-center justify-center";

interface Props {
  logout: () => void;
  isOpen?: boolean;
}

export default function SignOutButton({ logout, isOpen = false }: Props) {
  const { t } = useTranslation();

  return (
    <button
      onClick={logout}
      title={t("Menu.logout")}
      className={`${ROW} text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors`}
    >
      <span className={ICON}>
        <PiSignOutBold />
      </span>
      <span
        className={[
          "truncate",
          isOpen
            ? "ml-2"
            : "hidden group-hover/sidebar:block group-hover/sidebar:ml-2",
        ].join(" ")}
      >
        {t("Menu.logout")}
      </span>
    </button>
  );
}

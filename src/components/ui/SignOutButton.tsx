import { PiSignOutBold } from "react-icons/pi";
import { useTranslation } from "react-i18next";

const ROW = "flex items-center px-3 w-full min-h-[2.5rem]";
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
      className={`${ROW} border-l-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400 transition-colors`}
    >
      <span className={ICON}>
        <PiSignOutBold />
      </span>
      <span
        className={[
          "whitespace-nowrap transition-all duration-300 overflow-hidden",
          isOpen
            ? "max-w-xs opacity-100 ml-2"
            : "max-w-0 opacity-0 ml-0 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100 group-hover/sidebar:ml-2",
        ].join(" ")}
      >
        {t("Menu.logout")}
      </span>
    </button>
  );
}

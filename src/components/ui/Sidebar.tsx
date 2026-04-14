"use client";

import { cva } from "class-variance-authority";
import { Link, useLocation } from "react-router";
import Typography from "./Typography";
import { PiSidebarSimple } from "react-icons/pi";
import { TbLanguage } from "react-icons/tb";
import Divider from "./Divider";
import SignOutButton from "./SignOutButton";
import { useTranslation } from "react-i18next";
import { Language } from "@/i18n/config";

// Sidebar container — always absolutely positioned so hover-expansion never
// pushes content. A matching spacer div in the parent holds the layout slot.
const containerStyles = cva(
  "hidden sm:flex bg-zinc-50 dark:bg-zinc-900 absolute top-0 left-0 h-full z-40 overflow-hidden pt-2 pb-5 flex-col gap-6 justify-between border-r border-zinc-200 dark:border-zinc-800 group/sidebar transition-all duration-300 ease-in-out",
  {
    variants: {
      open: {
        true: "w-48",
        false: "w-12 hover:w-48",
      },
    },
    defaultVariants: { open: false },
  }
);

// Row skeleton — no gap between children; gap is handled by the text span's
// margin so it disappears completely when the text is hidden (max-w-0 + ml-0).
const ROW = "flex items-center px-3 w-full min-h-[2.5rem]";

// Icon slot — fixed size so layout never shifts
const ICON = "shrink-0 w-4 h-4 flex items-center justify-center";

// Text slot — hidden (display:none) when collapsed so icons are unaffected,
// appears instantly on hover via group-hover. truncate clips long labels.
const labelStyles = cva("truncate", {
  variants: {
    open: {
      true: "ml-2",
      false: "hidden group-hover/sidebar:block group-hover/sidebar:ml-2",
    },
  },
});

interface ContainerProps extends BaseProps {
  isOpen: boolean;
  toggle: () => void;
  mainHeader: React.ReactNode;
  logout: () => void;
}

function Container({
  children,
  isOpen,
  toggle,
  mainHeader,
  logout,
}: ContainerProps) {
  return (
    <aside className={containerStyles({ open: isOpen })}>
      <div className="flex flex-col gap-5 w-full">
        {mainHeader}
        <nav className="flex flex-col gap-0.5 w-full">{children}</nav>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Divider style="partial" marginY="none" thickness="sm" />

        <SidebarLanguage isOpen={isOpen} />

        <button
          onClick={toggle}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={`${ROW} border-l-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors`}
        >
          <span className={ICON}>
            <PiSidebarSimple className={isOpen ? "" : "scale-x-[-1]"} />
          </span>
          <span className={labelStyles({ open: isOpen })}>
            <Typography>
              {isOpen ? "Collapse" : "Expand"}
            </Typography>
          </span>
        </button>

        <Divider style="partial" marginY="none" thickness="sm" />

        <SignOutButton logout={logout} isOpen={isOpen} />
      </div>
    </aside>
  );
}

const itemStyles = cva(
  `${ROW} border-l-2 transition-colors duration-150`,
  {
    variants: {
      active: {
        true: "bg-brand-violet-50 dark:bg-brand-violet-950 text-brand-violet-700 dark:text-brand-violet-300 border-brand-violet-500 dark:border-brand-violet-400",
        false: "border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200",
      },
    },
    defaultVariants: { active: false },
  }
);

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  isOpen: boolean;
}

function SidebarItem({ icon, href, text, isOpen }: SidebarItemProps) {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link to={href} title={text} className={itemStyles({ active: isActive })}>
      <span className={ICON}>{icon}</span>
      <span className={labelStyles({ open: isOpen })}>
        <Typography>{text}</Typography>
      </span>
    </Link>
  );
}

const LANG_LABELS: Record<string, string> = {
  [Language.EN]: "English",
  [Language.PT_BR]: "Português",
  [Language.ES]: "Español",
};

const ALL_LANGS = [Language.EN, Language.PT_BR, Language.ES];

function SidebarLanguage({ isOpen }: { isOpen: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.language as Language;

  return (
    <div
      title="Language"
      className={`${ROW} border-l-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors`}
    >
      <span className={ICON}>
        <TbLanguage />
      </span>
      <span className={`${labelStyles({ open: isOpen })} flex-1 min-w-0`}>
        <select
          value={current}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="w-full bg-transparent text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none cursor-pointer"
        >
          {ALL_LANGS.map((lang) => (
            <option key={lang} value={lang}>
              {LANG_LABELS[lang]}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}

const Sidebar = Object.assign(Container, { Item: SidebarItem });

export default Sidebar;

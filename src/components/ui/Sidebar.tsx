"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Link, useLocation } from "react-router";
import Typography from "./Typography";
import { PiSidebarSimple } from "react-icons/pi";
import ThemeSwitcher from "./ThemeSwitcher";
import Divider from "./Divider";
import LanguageSwitcher from "../LanguageSwitcher";
import SignOutButton from "./SignOutButton";

const containerStyles = cva(
  "hidden sm:flex bg-transparent dark:bg-zinc-700 min-w-md max-h-screen overflow-y-auto scrollbar px-2 pt-2 pb-5 flex flex-col gap-8 justify-between align-middle border-r-2 border-brand-violet-300 dark:border-brand-lime-700 shadow group/sidebar transition-all duration-300 ease-in-out",
  {
    variants: {
      open: {
        true: "min-w-64",
        false: "group-hover/sidebar:min-w-64",
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

const buttonStyles = cva("flex gap-1 w-full", {
  variants: {
    open: {
      true: "flex-row",
      false: "flex-col",
    },
  },
});

interface ContainerProps
  extends BaseProps,
  VariantProps<typeof containerStyles> {
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
  ...props
}: ContainerProps) {
  return (
    <aside className={containerStyles({ open: isOpen })} {...props}>
      <div className="flex flex-col gap-5 w-full">
        {mainHeader}

        <div className="flex flex-col gap-2 w-full">{children}</div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Divider style="partial" marginY="none" thickness="sm" />

        <div className={buttonStyles({ open: isOpen })}>
          <div className="flex justify-center items-center w-full text-center bg-white dark:bg-zinc-700 rounded-lg p-2 hover:bg-brand-violet-200 dark:hover:bg-zinc-600">
            <LanguageSwitcher />
          </div>

          <div className="flex justify-center items-center w-full text-center bg-white dark:bg-zinc-700 rounded-lg p-2 hover:bg-brand-violet-200 dark:hover:bg-zinc-600">
            <ThemeSwitcher />
          </div>

          <button
            onClick={toggle}
            className="flex justify-center items-center w-full text-center bg-white dark:bg-zinc-700 hover:bg-brand-violet-200 dark:hover:bg-zinc-600 rounded-lg p-2"
          >
            <PiSidebarSimple className="text-zinc-800 dark:text-zinc-300" />
          </button>
        </div>

        <Divider style="partial" marginY="none" thickness="sm" />

        <SignOutButton logout={logout} />
      </div>
    </aside>
  );
}

const sidebarItemStyles = cva(
  "flex items-center align-middle gap-2 border border-brand-violet-300 dark:border-brand-lime-500 rounded-lg px-4 py-2 text-zinc-800 dark:text-brand-lime-500 transition-all duration-300 ease-in-out hover:bg-brand-violet-300 dark:hover:bg-zinc-600 w-full min-h-[2.5rem]",
  {
    variants: {
      active: {
        true: "bg-brand-violet-200 dark:bg-zinc-600",
        false: "bg-white dark:bg-zinc-700",
      },
      open: {
        true: "w-fit",
        false: "group-hover/sidebar:justify-start transition-all duration-300 ease-in-out",
      },
    },
    defaultVariants: {
      active: false,
      open: false,
    },
  }
);

const sidebarItemTextStyles = cva("transition-all duration-300 ease-in-out whitespace-nowrap inline-block overflow-hidden flex items-center h-6", {
  variants: {
    open: {
      true: "opacity-100 max-w-xs min-w-0",
      false: "opacity-0 max-w-0 min-w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:max-w-xs",
    },
  },
});

interface SidebarItemProps extends VariantProps<typeof sidebarItemStyles> {
  icon: React.ReactNode;
  text: string;
  href: string;
  isOpen: boolean;
  children?: React.ReactNode;
}

function SidebarItem({
  icon,
  href,
  text,
  isOpen,
  children,
  ...props
}: SidebarItemProps) {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  const Icon = () => (
    <span className="text-brand-violet-800 dark:text-brand-lime-500">{icon}</span>
  );

  return (
    <Link
      to={href}
      className={sidebarItemStyles({ active: isActive, open: isOpen })}
      {...props}
    >
      <Icon />
      <div className={sidebarItemTextStyles({ open: isOpen })}>
        <Typography>{text}</Typography>
      </div>
      {children}
    </Link>
  );
}

const Sidebar = Object.assign(Container, { Item: SidebarItem });

export default Sidebar;

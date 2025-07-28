"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Link, useLocation } from "react-router";
import Typography from "./Typography";
import { PiSidebarSimple } from "react-icons/pi";
import { Tooltip } from "flowbite-react";
import ThemeSwitcher from "./ThemeSwitcher";
import Divider from "./Divider";
import LanguageSwitcher from "../LanguageSwitcher";
import SignOutButton from "./SignOutButton";

const containerStyles = cva(
  "hidden sm:flex bg-indigo-300 dark:bg-zinc-700 min-w-md max-h-screen overflow-y-auto scrollbar px-2 pt-2 pb-5 flex flex-col gap-8 justify-between align-middle border-r-2 border-indigo-300 dark:border-lime-700 shadow",
  {
    variants: {
      open: {
        true: "min-w-64",
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
          <div className="flex justify-center items-center w-full text-center bg-white dark:bg-zinc-700 rounded-full p-2 hover:bg-indigo-200 dark:hover:bg-zinc-600">
            <LanguageSwitcher />
          </div>

          <div className="flex justify-center items-center w-full text-center bg-white dark:bg-zinc-700 rounded-full p-2 hover:bg-indigo-200 dark:hover:bg-zinc-600">
            <ThemeSwitcher />
          </div>

          <button
            onClick={toggle}
            className="flex justify-center items-center w-full text-center bg-white dark:bg-zinc-700 hover:bg-indigo-200 dark:hover:bg-zinc-600 rounded-full p-2"
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
  "flex items-center align-middle gap-2 border border-indigo-300 dark:border-lime-500 rounded-full p-2 text-zinc-800 dark:text-lime-500 transition-all duration-300 ease-in-out hover:bg-indigo-300 dark:hover:bg-zinc-600 w-full",
  {
    variants: {
      active: {
        true: "bg-indigo-200 dark:bg-zinc-600",
        false: "bg-white dark:bg-zinc-700",
      },
      open: {
        true: "w-fit px-4 py-2",
        false: "justify-center",
      },
    },
    defaultVariants: {
      active: false,
      open: false,
    },
  }
);

const sidebarItemTextStyles = cva("animate-slide-in-left", {
  variants: {
    open: {
      true: "block",
      false: "hidden",
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
  isOpen: isOpen,
  children,
  ...props
}: SidebarItemProps) {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  const Icon = () => (
    <span className="text-indigo-800 dark:text-lime-500">{icon}</span>
  );

  return (
    <Link
      to={href}
      className={sidebarItemStyles({ active: isActive, open: isOpen })}
      {...props}
    >
      <Tooltip
        placement="right"
        content={text}
        className="px-4 border-2 border-white dark:border-lime-500 bg-indigo-200 dark:bg-zinc-600 text-indigo-800 dark:text-lime-500"
      >
        <Icon />
      </Tooltip>
      <div className={sidebarItemTextStyles({ open: isOpen })}>
        <Typography>{text}</Typography>
      </div>
      {children}
    </Link>
  );
}

const Sidebar = Object.assign(Container, { Item: SidebarItem });

export default Sidebar;

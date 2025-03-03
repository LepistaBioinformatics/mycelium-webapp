"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Link, useLocation } from "react-router";
import Typography from "./Typography";
import { PiSidebarSimple } from "react-icons/pi";
import { Tooltip } from "flowbite-react";
import ThemeSwitcher from "./ThemeSwitcher";

const containerStyles = cva("bg-slate-200 dark:bg-slate-700 min-w-md px-2 pt-2 pb-5 flex flex-col gap-8 justify-between align-middle border-r-2 dark:border-indigo-900 shadow", {
  variants: {
    open: {
      true: "min-w-64",
    },
  },
  defaultVariants: {
    open: false,
  },
});

interface ContainerProps extends BaseProps, VariantProps<typeof containerStyles> {
  isOpen: boolean;
  toggle: () => void;
  mainHeader: React.ReactNode;
}

function Container({ children, isOpen: isOpen, toggle, mainHeader, ...props }: ContainerProps) {
  return (
    <aside className={containerStyles({ open: isOpen })} {...props}>
      <div className="flex flex-col gap-5 w-full">
        {mainHeader}

        <div className="flex flex-col gap-2 w-full">
          {children}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-center items-center w-full text-center hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-2">
          <ThemeSwitcher />
        </div>

        <button onClick={toggle} className="flex justify-center items-center w-full text-center hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-2">
          <PiSidebarSimple className="text-slate-800 dark:text-slate-300" />
        </button>
      </div>
    </aside>
  )
}

const sidebarItemStyles = cva("flex items-center align-middle gap-2 border border-transparent dark:border-lime-500 rounded-full p-2 text-slate-800 dark:text-lime-500 transition-all duration-300 ease-in-out hover:bg-slate-300 dark:hover:bg-slate-600 w-full", {
  variants: {
    active: {
      true: "bg-blue-200 dark:bg-slate-600",
      false: "bg-slate-100 dark:bg-slate-700",
    },
    open: {
      true: "w-fit px-4 py-2",
      false: "justify-center"
    },
  },
  defaultVariants: {
    active: false,
    open: false,
  },
});

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
}

function SidebarItem({ icon, href, text, isOpen: isOpen, ...props }: SidebarItemProps) {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  const Icon = () => (
    <span className="text-blue-800 dark:text-lime-500">
      {icon}
    </span>
  );

  return (
    <Link to={href} className={sidebarItemStyles({ active: isActive, open: isOpen })} {...props}>
      <Tooltip placement="right" content={text} className="px-4 border-2 border-white dark:border-lime-500 bg-blue-200 dark:bg-slate-600 text-blue-800 dark:text-lime-500">
        <Icon />
      </Tooltip>
      <div className={sidebarItemTextStyles({ open: isOpen })}>
        <Typography>{text}</Typography>
      </div>
    </Link>
  )
}

const Sidebar = Object.assign(Container, { Item: SidebarItem });

export default Sidebar;

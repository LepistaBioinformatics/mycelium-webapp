"use client";

import { cva, VariantProps } from "class-variance-authority";
import { Link } from "react-router";
import Typography from "./Typography";
import { PiSidebarSimple } from "react-icons/pi";

const containerStyles = cva("bg-indigo-600 dark:bg-slate-700 h-screen min-w-md px-2 pt-2 pb-12 flex flex-col gap-8 justify-start align-middle items-center border-r-2 dark:border-indigo-900 shadow", {
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
}

function Container({ children, isOpen: isOpen, toggle, ...props }: ContainerProps) {
  return (
    <aside className={containerStyles({ open: isOpen })} {...props}>
      <button onClick={toggle} className="flex justify-center items-center w-full text-center hover:bg-indigo-700 dark:hover:bg-slate-600 rounded-full p-2">
        <PiSidebarSimple className="text-white dark:text-gray-300" />
      </button>

      <div className="flex flex-col gap-8">
        {children}
      </div>
    </aside>
  )
}

const sidebarItemStyles = cva("flex items-center align-middle gap-2 border-2 border-white dark:border-lime-500 rounded-full px-4 py-2 dark:text-lime-500 transition-all duration-300 ease-in-out hover:bg-indigo-700 dark:hover:bg-slate-600 ", {
  variants: {
    active: {
      true: "bg-indigo-700 dark:bg-slate-600",
    },
    open: {
      true: "w-fit",
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

function SidebarItem({ icon, href, active, text, isOpen: isOpen, ...props }: SidebarItemProps) {
  return (
    <Link to={href} className={sidebarItemStyles({ active, open: isOpen })} {...props}>
      {icon}
      <div className={sidebarItemTextStyles({ open: isOpen })}>
        <Typography>{text}</Typography>
      </div>
    </Link>
  )
}

const Sidebar = Object.assign(Container, { Item: SidebarItem });

export default Sidebar;

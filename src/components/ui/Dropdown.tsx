"use client";

import {
  Dropdown as FlowbiteDropdown,
  DropdownItem as FlowbiteDropdownItem,
  DropdownHeader as FlowbiteDropdownHeader,
} from "flowbite-react";
import { ReactNode } from "react";
import { buttonStyles } from "./button-styles";

// Re-themes Flowbite's Dropdown to the project's flat neobrutalist look
// (rounded-lg, 1px brand border, subtle shadow) instead of its untouched
// gray defaults — see .claude/rules/design-system.md. The trigger reuses
// Button's own cva classes via `inline` so it renders as a real <button>
// DOM node (Button itself isn't ref-forwarding, which floating-ui's
// positioning requires).
const dropdownTheme = {
  arrowIcon: "hidden",
  inlineWrapper: buttonStyles({ intent: "link", size: "sm" }),
  floating: {
    base: "z-10 w-fit rounded-lg border border-brand-600 shadow-sm dark:shadow-none focus:outline-none",
    style: {
      auto: "bg-white text-zinc-800 dark:bg-brand-950 dark:text-zinc-100",
    },
    header: "block px-4 py-3 text-sm",
    divider: "my-1 h-px bg-zinc-200 dark:bg-brand-800",
    item: {
      base: "flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    },
  },
};

interface Props {
  label: ReactNode;
  children: ReactNode;
  dismissOnClick?: boolean;
}

function Container({ label, children, dismissOnClick = true }: Props) {
  return (
    <FlowbiteDropdown
      inline
      label={label}
      arrowIcon={false}
      dismissOnClick={dismissOnClick}
      theme={dropdownTheme}
    >
      {children}
    </FlowbiteDropdown>
  );
}

const Dropdown = Object.assign(Container, {
  Item: FlowbiteDropdownItem,
  Header: FlowbiteDropdownHeader,
});

export default Dropdown;

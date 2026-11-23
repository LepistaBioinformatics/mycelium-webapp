import { ReactNode } from "react";
import { buttonStyles } from "./button-styles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

interface Props {
  label: ReactNode;
  children: ReactNode;
  dismissOnClick?: boolean;
}

function Container({ label, children }: Props) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={buttonStyles({ intent: "link", size: "sm" })}
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-64 max-w-sm border-border"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ItemProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

function Item({ children, disabled, onClick }: ItemProps) {
  return (
    <DropdownMenuItem
      disabled={disabled}
      onSelect={onClick}
      className="cursor-pointer px-3 py-2"
    >
      {children}
    </DropdownMenuItem>
  );
}

function Header({ children }: { children: ReactNode }) {
  return (
    <DropdownMenuLabel className="px-3 py-2 font-normal">
      {children}
    </DropdownMenuLabel>
  );
}

const Dropdown = Object.assign(Container, { Item, Header });

export default Dropdown;

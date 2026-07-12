import { VariantProps } from "class-variance-authority";
import { AriaRole } from "react";
import { buttonStyles } from "./button-styles";

interface Props extends BaseProps, VariantProps<typeof buttonStyles> {
  onClick?: () => void;
  role?: AriaRole | undefined;
  type?: "button" | "submit" | "reset" | undefined;
  disabled?: boolean;
}

export default function Button({
  fullWidth,
  intent,
  size,
  role,
  padding,
  onClick,
  type,
  disabled,
  center,
  ...props
}: Props) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={buttonStyles({
        fullWidth,
        intent,
        size,
        disabled,
        padding,
        center,
      })}
      type={type}
      role={role}
      disabled={disabled}
      {...props}
    />
  );
}

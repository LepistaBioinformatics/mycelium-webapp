import { CgDarkMode } from "react-icons/cg";
import { cva, VariantProps } from "class-variance-authority";
import { useTheme } from "../ThemeProvider";

const themeSwitchStyles = cva(
  "text-indigo-600 dark:text-yellow-400 text-2xl cursor-pointer",
  {
    variants: {
      reverseBackground: {
        true: "text-gray-50 dark:text-gray-600",
      },
    },
    defaultVariants: {
      reverseBackground: false,
    },
  }
);

interface ThemeSwitchProps
  extends BaseProps,
    VariantProps<typeof themeSwitchStyles> {}

export default function ThemeSwitcher({ reverseBackground }: ThemeSwitchProps) {
  const { mode: _, toggleMode } = useTheme();

  return (
    <div
      onClick={toggleMode}
      className={themeSwitchStyles({ reverseBackground })}
    >
      <CgDarkMode />
    </div>
  );
}

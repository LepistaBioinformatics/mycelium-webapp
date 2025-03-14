import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { Link } from "react-router";
import ThemeSwitcher from "./ThemeSwitcher";
import { PiSignOutBold } from "react-icons/pi";

const appHeaderStyles = cva("text-gray-500 dark:text-gray-50 absolute top-0 left-0 right-0", {
  variants: {
    discrete: {
      true: "bg-transparent",
      false: "bg-indigo-800 dark:text-white"
    },
    rounded: {
      true: "rounded-lg",
      false: "rounded-none"
    }
  },
  defaultVariants: {
    discrete: false,
    rounded: false,
  },
});

interface AppHeaderProps extends BaseProps, VariantProps<typeof appHeaderStyles> {
  logout: () => void;
}

export default function AppHeader({ discrete, logout, ...props }: AppHeaderProps) {
  return (
    <header className={appHeaderStyles({ discrete })} {...props}>
      <div className="container mx-auto py-3 flex justify-between align-middle">
        <div>
          <Typography as="h2" reverseBackground={!discrete}>
            <Link to="/">Mycelium</Link>
          </Typography>
        </div>
        <div className="flex items-center gap-8 rounded-full border border-transparent border-dashed hover:border-slate-500 p-2">
          <Typography as="span" reverseBackground={!discrete}>
            <ThemeSwitcher reverseBackground={!discrete} />
          </Typography>
          <div onClick={logout} className="cursor-pointer">
            <PiSignOutBold className="text-slate-800 dark:text-slate-300" />
          </div>
        </div>
      </div>
    </header>
  );
}

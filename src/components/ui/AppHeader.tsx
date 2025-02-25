import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { Link } from "react-router";
import ThemeSwitcher from "./ThemeSwitcher";

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

interface AppHeaderProps extends BaseProps, VariantProps<typeof appHeaderStyles> { }

export default function AppHeader({ discrete, ...props }: AppHeaderProps) {
  return (
    <header className={appHeaderStyles({ discrete })} {...props}>
      <div className="container mx-auto py-3 flex justify-between align-middle">
        <div>
          <Typography as="h2" reverseBackground={!discrete}>
            <Link to="/">Mycelium</Link>
          </Typography>
        </div>
        <div>
          <Typography as="span" reverseBackground={!discrete}>
            <ThemeSwitcher reverseBackground={!discrete} />
          </Typography>
        </div>
      </div>
    </header>
  );
}

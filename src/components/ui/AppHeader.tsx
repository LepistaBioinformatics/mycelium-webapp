import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { Link } from "react-router";
import { PiSignOutBold } from "react-icons/pi";
import useProfile from "@/hooks/use-profile";

const appHeaderStyles = cva(
  "text-white dark:text-white absolute top-0 w-full mx-auto px-2 sm:px-5 z-30",
  {
    variants: {
      discrete: {
        true: "bg-transparent",
        false: "bg-brand-violet-800 dark:text-white",
      },
    },
    defaultVariants: {
      discrete: false,
    },
  }
);

interface AppHeaderProps
  extends BaseProps,
  VariantProps<typeof appHeaderStyles> {
  logout: () => void;
}

export default function AppHeader({
  discrete,
  logout,
  ...props
}: AppHeaderProps) {
  const { user } = useProfile();

  return (
    <header className={appHeaderStyles({ discrete })} {...props}>
      <div className="container mx-auto py-3 flex justify-between align-middle">
        <div>
          <Typography
            as="h2"
            reverseBackground={true}
            uppercase
            decoration="bold"
          >
            <Link to="/">Mycelium</Link>
          </Typography>
        </div>
        <div className="flex items-center gap-8 border border-transparent border-dashed hover:border-zinc-500 p-2">
          {user && (
            <div onClick={logout} className="cursor-pointer">
              <PiSignOutBold className="text-zinc-800 dark:text-zinc-300" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

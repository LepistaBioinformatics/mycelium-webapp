import { PiSignOutBold } from "react-icons/pi";

interface Props {
  logout: () => void;
}

export default function SignOutButton({ logout }: Props) {
  return (
    <button
      onClick={logout}
      className="flex justify-center items-center w-full text-center bg-brand-violet-50 dark:bg-zinc-700 hover:bg-brand-violet-200 dark:hover:bg-zinc-600 rounded-lg p-2"
    >
      <PiSignOutBold className="text-zinc-800 dark:text-zinc-300" />
    </button>
  );
}

import { useTranslation } from "react-i18next";
import Typography from "@/components/ui/Typography";
import { NativeUser } from "@/types/NativeAuth";

interface Props {
  user: NativeUser | null;
}

export default function AuthenticatedUser({ user }: Props) {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 items-center justify-center align-middle h-fit">
      <Typography as="h2" width="xs" center>
        {t("screens.HomePage.AuthenticatedUser.title")}
        <br />
        <span className="text-sm">
        {user?.email ? `${user.email.username}@${user.email.domain}` : ""}
        </span>
      </Typography>
    </div>
  );
}

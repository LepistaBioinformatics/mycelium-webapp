import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { useTranslation } from "react-i18next";
import { FaDiscord, FaSlack, FaWhatsapp } from "react-icons/fa";
import TelegramIdentitySection from "./TelegramIdentitySection";

type Profile = components["schemas"]["Profile"];

interface Props {
  profile: Profile | null;
}

const BASE = "screens.Dashboard.TelegramIdentity";

interface ComingSoonCardProps {
  icon: React.ReactNode;
  name: string;
}

function ComingSoonCard({ icon, name }: ComingSoonCardProps) {
  const { t } = useTranslation();

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 dark:text-zinc-600">{icon}</span>
          <Typography as="h5" decoration="faded">
            {name}
          </Typography>
        </div>
      </Card.Header>

      <Card.Body width="full">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
          {t(`${BASE}.comingSoon`)}
        </span>
      </Card.Body>
    </Card>
  );
}

export default function IdentitySection({ profile }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <TelegramIdentitySection profile={profile} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ComingSoonCard icon={<FaWhatsapp size={18} />} name="WhatsApp" />
        <ComingSoonCard icon={<FaDiscord size={18} />} name="Discord" />
        <ComingSoonCard icon={<FaSlack size={18} />} name="Slack" />
      </div>
    </div>
  );
}

import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { unlinkTelegram } from "@/services/telegram";
import { setNotification } from "@/states/notification.state";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

type Profile = components["schemas"]["Profile"];

interface Props {
  profile: Profile | null;
}

const BASE = "screens.Dashboard.TelegramIdentity";
const SESSION_PROFILE_KEY = "myc-profile";

export default function TelegramIdentitySection({ profile }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isUnlinking, setIsUnlinking] = useState(false);

  const { getAccessTokenSilently } = useProfile();

  const isLinked = !!profile?.meta?.["telegram_user"];

  const handleUnlink = async () => {
    setIsUnlinking(true);

    try {
      await unlinkTelegram(getAccessTokenSilently);

      dispatch(
        setNotification({ type: "success", notification: t(`${BASE}.unlinked`) }),
      );

      sessionStorage.removeItem(SESSION_PROFILE_KEY);
      window.location.reload();
    } catch {
      dispatch(
        setNotification({ type: "error", notification: t(`${BASE}.error`) }),
      );
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t(`${BASE}.title`)}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div className="flex flex-col gap-4">
          <Typography as="p" decoration="smooth">
            {t(`${BASE}.description`)}
          </Typography>

          <div className="flex items-center justify-between gap-4">
            <Typography as="span">
              {isLinked ? t(`${BASE}.linked`) : t(`${BASE}.notLinked`)}
            </Typography>

            {isLinked && (
              <Button
                intent="danger"
                disabled={isUnlinking}
                onClick={handleUnlink}
              >
                {isUnlinking ? t(`${BASE}.unlinking`) : t(`${BASE}.unlink`)}
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

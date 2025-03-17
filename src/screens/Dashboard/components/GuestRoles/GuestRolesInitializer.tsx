import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DetailsBox from "@/components/ui/DetailsBox";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

export default function GuestRolesInitializer({ onSuccess }: Props) {
  const { profile, isLoadingUser, getAccessTokenSilently } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const handleInitialize = async () => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    const response = await fetch(buildPath("/adm/su/managers/guest-roles"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      parseHttpError(response);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onSuccess();
  };

  if (isLoadingUser || !profile?.isManager) return null;

  return (
    <DetailsBox>
      <DetailsBox.Summary>
        <Typography as="span" decoration="smooth">
          Advanced
        </Typography>
      </DetailsBox.Summary>

      <DetailsBox.Content>
        <div className="mt-4">
          <Card height="min" width="full">
            <Card.Header>
              <Typography>
                Use this tool to initialize guest roles for your organization
              </Typography>
            </Card.Header>

            <Card.Body>
              <div className="flex flex-col gap-4">
                <Typography>
                  Guest roles are not initialized. Click the button below to initialize them
                </Typography>
                <div>
                  <Button rounded onClick={handleInitialize} disabled={isLoading}>
                    {isLoading ? "Initializing..." : "Click to initialize guest roles"}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </DetailsBox.Content>
    </DetailsBox>
  );
}

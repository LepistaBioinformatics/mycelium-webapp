import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

export default function GuestRolesInitializer({ onSuccess }: Props) {
  const { profile, isLoadingUser, getAccessTokenSilently } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

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
      throw new Error("Failed to initialize guest roles");
    }

    onSuccess();
    setIsLoading(false);
  };

  if (isLoadingUser || !profile?.isManager) return null;

  return (
    <details className="flex flex-col justify-center gap-4 w-full xl:max-w-4xl mx-auto">
      <summary className="cursor-pointer text-left border-2 border-transparent border-dashed hover:border-slate-500 px-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <Typography as="span" decoration="smooth">
          Advanced
        </Typography>
      </summary>

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
    </details>
  );
}

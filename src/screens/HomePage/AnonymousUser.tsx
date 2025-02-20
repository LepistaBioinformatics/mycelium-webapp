import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { buildPath } from "@/services/openapi/mycelium-api";
import type { components } from "@/services/openapi/mycelium-schema";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth0, User } from "@auth0/auth0-react";

type Inputs = {
  email: string
}

type CheckEmailStatusResponse = components["schemas"]["CheckEmailStatusResponse"];

interface Props {
  setUser: (user: User) => void;
}

export default function AnonymousUser({ setUser }: Props) {
  const {
    user,
    isAuthenticated,
    isLoading: isCheckingForUser,
  } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<CheckEmailStatusResponse | null>(null);

  useEffect(() => {
    if (!isCheckingForUser && isAuthenticated && user) setUser(user);
  }, [isCheckingForUser, isAuthenticated, user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setIsLoading(true);

    await fetch(
      buildPath("/adm/rs/beginners/users/status", { query: { email } }),
    )
      .then(res => res.json() as Promise<CheckEmailStatusResponse>)
      .then(setStatus)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <Card height="full">
      <Card.Header>
        <Typography as="title">
          Welcome
        </Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-12">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 min-w-md"
          >
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="username@domain.com"
              className="border border-gray-300 rounded-md p-2 text-center text-2xl"
              disabled={isLoading}
            />

            {errors.email && <span>This field is required</span>}

            <Button
              type="submit"
              intent="primary"
              size="md"
              rounded
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check"}
            </Button>
          </form>

          {status
            ? (
              <div className="flex flex-col gap-4">
                <Typography as="h2">
                  <span className="text-slate-50">
                    {status.status}
                  </span>
                </Typography>
                <Typography as="span">
                  <p className="text-slate-50">
                    Is the email <span className="font-semibold">{status.email}</span> registered?
                  </p>
                </Typography>
              </div>
            )
            : (
              <div className="m-auto hidden xl:block">
                <Typography as="h2">
                  First time here?
                </Typography>
                <Typography width="sm">
                  Check your email to get started
                </Typography>
                <img
                  alt="Mindfulness"
                  src="/undraw.co/undraw_to_the_moon_re_q21i.svg"
                  width={250}
                  height={250}
                  className="mt-6 mx-auto"
                />
              </div>
            )}
        </div>
      </Card.Body>

    </Card>
  );
}

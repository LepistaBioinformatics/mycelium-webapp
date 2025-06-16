import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { VariantProps } from "class-variance-authority";
import FlowContainer, { flowContainerStyles } from "./FlowContainer";
import { useAuth0 } from "@auth0/auth0-react";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { buildPath } from "@/services/openapi/mycelium-api";
import { TextInput } from "flowbite-react";
import { components } from "@/services/openapi/mycelium-schema";

type CheckEmailStatusResponse = components["schemas"]["CheckEmailStatusResponse"];

type Inputs = {
  name: string;
}

interface Props extends VariantProps<typeof flowContainerStyles> {
  status: CheckEmailStatusResponse | null;
  setStatus: (status: CheckEmailStatusResponse) => void;
};

export default function UnRegisteredUser({ show, status, setStatus }: Props) {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const [
    registeringAccount, setRegisteringAccount
  ] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const handleRegisterAccount = async (name: string) => {
    setRegisteringAccount(true);

    try {
      if (!user?.email) throw new Error("User email is required");

      const token = await getAccessTokenSilently();

      const registeringResponse = await fetch(
        buildPath("/adm/rs/beginners/accounts"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (registeringResponse.ok) {
        setTimeout(() => {
          status && setStatus({ ...status, hasAccount: true });
        }, 1000);

        return;
      }

      console.error(await registeringResponse.text());
    } catch (error) {
      console.error(error);
    } finally {
      setRegisteringAccount(false);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = ({ name }, event) => {
    event?.preventDefault();

    handleRegisterAccount(name);
  };

  return (
    <FlowContainer show={show}>
      <Card minHeight="50vh" height="fit" width="6xl">
        <Card.Header>
          <Typography as="h1">
            Almost there!
          </Typography>
        </Card.Header>

        <Card.Body>
          {user?.name && isAuthenticated && !isLoading
            ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col items-center justify-center gap-2 mt-4"
              >
                <div>
                  <Typography>
                    Check your username
                  </Typography>
                  <TextInput
                    {...register("name", { required: true })}
                    placeholder="Name"
                    defaultValue={user?.name ?? ""}
                    type="text"
                    autoFocus
                  />
                  {errors.name && <span>This field is required</span>}
                </div>

                <div className="flex flex-col items-center justify-center gap-2 mt-4">
                  <Typography>
                    Click to finish registration
                  </Typography>

                  <Button
                    type="submit"
                    fullWidth
                    rounded
                    disabled={registeringAccount}
                  >
                    {registeringAccount ? "Registering..." : "Let's go!"}
                  </Button>

                  <img
                    src="/undraw.co/undraw_partying_3qad.svg"
                    alt="Unable"
                    width={150}
                    height={150}
                    className="mt-4 mx-auto"
                  />
                </div>
              </form>
            )
            : (
              <div className="flex flex-col items-center justify-center gap-8 mt-4">
                <Typography as="h2">
                  All ready!
                </Typography>

                <Typography>
                  User successfully registered
                </Typography>

                <img
                  src="/undraw.co/undraw_page-not-found_6wni.svg"
                  alt="Unable"
                  width={150}
                  height={150}
                  className="mt-4 mx-auto"
                />
              </div>
            )}
        </Card.Body>
      </Card>
    </FlowContainer>
  );
}

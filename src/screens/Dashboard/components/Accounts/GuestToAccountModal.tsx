import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import PermissionIcon from "@/components/ui/PermissionIcon";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import validateEmail from "@/functions/validate-email";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { RootState } from "@/states/store";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import PaginatedRecords from "@/types/PaginatedRecords";
import { TextInput } from "flowbite-react";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import useSWR from "swr";

type Account = components["schemas"]["Account"];
type GuestRole = components["schemas"]["GuestRole"];

type Inputs = {
  email: string;
}

interface Props {
  account: Account,
  isOpen: boolean,
  onClose: () => void;
}

export default function GuestToAccountModal({
  account,
  isOpen,
  onClose
}: Props) {
  const [selectedRole, setSelectedRole] = useState<GuestRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { parseError } = useSuspenseError();

  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      email: ""
    }
  })

  const onSubmit: SubmitHandler<Inputs> = async (data, event) => {
    event?.preventDefault();

    setIsSubmitting(true);

    if (!selectedRole) {
      setIsSubmitting(false);
      return;
    }

    if (!account.id || !selectedRole.id) {
      setIsSubmitting(false);
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(
      buildPath("/adm/rs/subscriptions-manager/guests/accounts/{account_id}/roles/{role_id}", {
        path: { account_id: account.id, role_id: selectedRole?.id },
      }),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(tenantInfo?.id ? { [TENANT_ID_HEADER]: tenantInfo?.id } : {}),
        },
        body: JSON.stringify({
          email: data.email
        })
      });

    if (!response.ok) {
      parseError(response);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
    reset();
  }

  const emailIsValid = useMemo(() => {
    return validateEmail(watch("email"));
  }, [watch("email")]);

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h4">Invite user</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-8 p-3 xl:min-w-[500px] w-full">
          <FormField
            id="email"
            label="1. With the email address"
            title="The email address of the guest user. User will be notified via email about invitation"
          >
            <TextInput
              id="email"
              type="email"
              placeholder="username@example.com"
              color="custom"
              sizing="sm"
              autoFocus
              theme={{
                field: {
                  input: {
                    colors: {
                      custom: "border-slate-400 bg-blue-50 text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    }
                  }
                }
              }}
              {...register("email", { required: true })}
            />

            {watch("email") && !emailIsValid && (
              <Typography as="small" decoration="smooth">
                Waiting for a valid email address...
              </Typography>
            )}

            {errors.email && <span>This field is required</span>}
          </FormField>

          <FormField
            label="2. To work on account"
            title="The account to invite the guest to"
          >
            <Typography as="h3">{account.name}</Typography>
          </FormField>

          <GuestRoleSelect
            selectedRole={selectedRole}
            setSelectedRole={(role) => setSelectedRole(role)}
            shouldBeSystemRole={account.isDefault}
          />

          {selectedRole && emailIsValid && account?.id && (
            <Button
              rounded
              fullWidth
              onClick={() => onSubmit({ email: watch("email") })}
              disabled={isSubmitting}
            >
              Invite
            </Button>
          )}

          <div className="flex flex-col gap-2 w-full max-w-md">
            {errors.email && (
              <Banner title="User error" intent="error">
                <Typography as="p">{errors.email?.message}</Typography>
              </Banner>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

type GuestRoleSelectInputs = {
  name: string;
}

/**
 * A custom implementation of Select component
 * 
 * @param param0 A
 * @returns 
 */
function GuestRoleSelect({
  selectedRole,
  setSelectedRole,
  shouldBeSystemRole,
}: {
  selectedRole?: GuestRole | null,
  setSelectedRole: (role: GuestRole) => void,
  shouldBeSystemRole: boolean
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(selectedRole ? false : true);

  const {
    isAuthenticated,
    hasEnoughPermissions,
    getAccessTokenSilently
  } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Read],
  });

  const { searchTerm, setSearchTerm, pageSize } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: 5,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestRoleSelectInputs>({
    defaultValues: {
      name: ""
    }
  })

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    let searchParams: Record<string, string> = { pageSize: pageSize.toString() };

    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;

    if (shouldBeSystemRole) {
      searchParams.system = "true"
    } else {
      searchParams.system = "false"
    }

    return buildPath("/adm/rs/subscriptions-manager/guest-roles", {
      query: searchParams
    });
  }, [searchTerm, isAuthenticated, hasEnoughPermissions]);

  const {
    data: guestRoles,
    isLoading,
    isValidating,
    mutate
  } = useSWR<PaginatedRecords<GuestRole>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch tenants");
          }

          return res.json();
        })
        .catch(console.error);
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const onSubmit: SubmitHandler<GuestRoleSelectInputs> = async ({ name }) => {
    setIsSubmitting(true);
    setSearchTerm(name);
    mutate(guestRoles, { rollbackOnError: true });
    setIsSubmitting(false);
  }

  const handleSelectRole = (role: GuestRole) => {
    setSelectedRole(role);
    setSearchTerm("");
    setIsEditing(false);
  }

  return (
    <FormField
      label="3. Given the role privileges"
      title="The role of the guest user"
    >
      <div>
        {selectedRole && !isEditing && (
          <div className="flex flex-col gap-2">
            <div onClick={() => setIsEditing(true)}>
              <div className="flex items-center gap-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg pb-2 bg-blue-50 dark:bg-slate-600 px-4 py-2 hover:cursor-pointer">
                {selectedRole?.name}
                {selectedRole?.permission && (
                  <PermissionIcon permission={selectedRole?.permission} />
                )}
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div>
            <form
              className="flex flex-col gap-2 w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <TextInput
                className="mb-2"
                placeholder="Search for a role"
                defaultValue={selectedRole?.name ?? ""}
                sizing="sm"
                color="custom"
                autoComplete="off"
                aria-autocomplete="list"
                theme={{
                  field: {
                    input: {
                      colors: {
                        custom: "border-slate-400 bg-blue-50 text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                      },
                    }
                  }
                }}
                {...register("name")}
              />
              {errors.name && <span>This field is required</span>}

              <input type="submit" className="hidden" />
            </form>

            {(isLoading || isValidating || isSubmitting)
              ? <span>Loading...</span>
              : <Typography as="small" decoration="smooth">Click to select</Typography>
            }

            <div className="flex flex-col mt-2 shadow-lg relative">
              {guestRoles?.records.map((role) => (
                <div
                  key={role.id}
                  className="flex gap-0 bg-blue-50 dark:bg-slate-800 p-2 border-t-2 border-t-blue-200 dark:border-t-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => handleSelectRole(role)}
                >
                  <div className="flex flex-col w-full gap-2">
                    <Typography>{role.name}</Typography>
                    <Typography as="small" decoration="smooth">{role.description}</Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <PermissionIcon permission={role.permission} size="lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  )
}

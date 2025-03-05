import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PermissionIcon from "@/components/ui/PermissionIcon";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
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
  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
  });

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);
  const [selectedRole, setSelectedRole] = useState<GuestRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!tenantInfo?.id) {
      setIsSubmitting(false);
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(buildPath("/adm/rs/subscriptions-manager/guests/accounts/{account_id}/roles/{role_id}", {
      path: { account_id: account.id, role_id: selectedRole?.id },
    }), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        [TENANT_ID_HEADER]: tenantInfo?.id ?? "",
      },
      body: JSON.stringify({
        email: data.email
      })
    })

    if (!response.ok) {
      setIsSubmitting(false);
      return;
    }

    onClose();

    reset();
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h4">Invite user</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-8 p-3 xl:min-w-[500px] w-full">
          <div className="flex flex-col gap-0">
            <Typography as="span">1. Guest to account</Typography>
            <Typography as="h3">{account.name}</Typography>
          </div>

          <div className="flex flex-col gap-0">
            <Typography as="span">2. The email address</Typography>

            <TextInput
              {...register("email")}
              type="email"
              placeholder="username@example.com"
              color="custom"
              sizing="sm"
              autoFocus
              theme={{
                field: {
                  input: { colors: { custom: "border-slate-400 bg-blue-50 text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500", } }
                }
              }}
            />

            {errors.email && <span>This field is required</span>}
          </div>

          <GuestRoleSelect
            selectedRole={selectedRole}
            setSelectedRole={(role) => setSelectedRole(role)}
          />

          {selectedRole && watch("email") && account?.id && (
            <Button
              rounded
              fullWidth
              onClick={() => onSubmit({ email: watch("email") })}
              disabled={isSubmitting}
            >
              Invite
            </Button>
          )}
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
  setSelectedRole
}: {
  selectedRole?: GuestRole | null,
  setSelectedRole: (role: GuestRole) => void
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
    initialPageSize: 3,
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
    <div className="flex flex-col">
      <Typography as="span">3. With role</Typography>

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

            {(isLoading || isValidating || isSubmitting) && <span>Loading...</span>}

            <div className="flex flex-col gap-2">
              {guestRoles?.records.map((role) => (
                <div
                  key={role.id}
                  className="flex flex-col gap-0 bg-slate-100 dark:bg-slate-800 rounded-md p-2 border-b-2 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => handleSelectRole(role)}
                >
                  <div className="flex justify-center items-center gap-2">
                    <Typography>{role.name}</Typography>
                    <PermissionIcon permission={role.permission} />
                  </div>

                  <div className="-mt-2">
                    <Typography as="small" decoration="smooth">{role.description}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

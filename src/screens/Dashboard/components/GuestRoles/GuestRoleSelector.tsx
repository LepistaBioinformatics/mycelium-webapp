import { cva, VariantProps } from "class-variance-authority";
import FormField from "@/components/ui/FomField";
import PermissionIcon from "@/components/ui/PermissionIcon";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import PaginatedRecords from "@/types/PaginatedRecords";
import { TextInput } from "flowbite-react";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";
import { camelCaseToKebabCase } from "@/functions/camel-to-kebab-text";

type GuestRole = components["schemas"]["GuestRole"];
type SystemActor = components["schemas"]["SystemActor"];

type Inputs = {
  name: string;
};

export interface GuestRoleSelectorProps {
  title: string;
  selectedRole?: GuestRole | null;
  parentRole?: GuestRole | null;
  ignoreList?: string[];
  setSelectedRole: (role: GuestRole) => void;
  shouldBeSystemRole: boolean;
  restrictRoleToSlug?: SystemActor;
}

/**
 * A custom implementation of Select component
 *
 * @param param0 A set of props
 * @returns A custom implementation of Select component
 */
export default function GuestRoleSelector({
  title,
  selectedRole,
  parentRole,
  setSelectedRole,
  ignoreList,
  shouldBeSystemRole,
  restrictRoleToSlug,
}: GuestRoleSelectorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(selectedRole ? false : true);

  const { parseHttpError } = useSuspenseError();

  const { isAuthenticated, hasEnoughPermissions, getAccessTokenSilently } =
    useProfile({
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
  } = useForm<Inputs>({
    defaultValues: {
      name: "",
    },
  });

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    let searchParams: Record<string, string> = {
      pageSize: pageSize.toString(),
    };

    if (searchTerm && searchTerm !== "") {
      searchParams.name = searchTerm;
    }

    if (restrictRoleToSlug) {
      searchParams.slug = camelCaseToKebabCase(restrictRoleToSlug as string);
    }

    if (shouldBeSystemRole) {
      searchParams.system = "true";
    } else {
      searchParams.system = "false";
    }

    return buildPath("/adm/rs/subscriptions-manager/guest-roles", {
      query: searchParams,
    });
  }, [
    searchTerm,
    isAuthenticated,
    hasEnoughPermissions,
    restrictRoleToSlug,
    shouldBeSystemRole,
  ]);

  const {
    data: guestRoles,
    isLoading,
    isValidating,
    mutate,
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
        .then(parseHttpError)
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

  const onSubmit: SubmitHandler<Inputs> = async ({ name }) => {
    setIsSubmitting(true);
    setSearchTerm(name);
    mutate(guestRoles, { rollbackOnError: true });
    setIsSubmitting(false);
  };

  const handleSelectRole = (role: GuestRole) => {
    setSelectedRole(role);
    setSearchTerm("");
    setIsEditing(false);
  };

  return (
    <FormField label={title} title="The role of the guest user">
      <div>
        {selectedRole && !isEditing && (
          <div className="flex flex-col gap-2">
            <div onClick={() => setIsEditing(true)}>
              <div className="flex items-center gap-2 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg pb-2 bg-blue-50 dark:bg-zinc-600 px-4 py-2 hover:cursor-pointer">
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
                        custom:
                          "border-zinc-400 bg-blue-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-zinc-500  dark:placeholder-zinc-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                      },
                    },
                  },
                }}
                {...register("name")}
              />
              {errors.name && <span>This field is required</span>}

              <input type="submit" className="hidden" />
            </form>

            {isLoading || isValidating || isSubmitting ? (
              <span>Loading...</span>
            ) : (
              <Typography as="small" decoration="smooth">
                Click to select
              </Typography>
            )}

            <div className="flex flex-col mt-2 shadow-lg relative">
              {guestRoles?.records
                ?.sort(
                  (a, b) =>
                    a.name.localeCompare(b.name) ||
                    getNumericPermission(a.permission as MycPermission) -
                      getNumericPermission(b.permission as MycPermission)
                )
                ?.map((role) => (
                  <SelectionItem
                    key={role.id}
                    desiredRole={role}
                    parentRole={parentRole}
                    onClick={handleSelectRole}
                    ignoreList={ignoreList}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}

const selectionItemStyles = cva(
  "flex gap-0 bg-blue-50 dark:bg-zinc-800 p-2 border-t-2 border-t-blue-200 dark:border-t-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-700",
  {
    variants: {
      active: {
        true: "cursor-pointer",
        false: "cursor-not-allowed opacity-50",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface SelectionItemProps
  extends BaseProps,
    VariantProps<typeof selectionItemStyles> {
  desiredRole: GuestRole;
  parentRole?: GuestRole | null;
  onClick: (role: GuestRole) => void;
  ignoreList?: string[];
}

function SelectionItem({
  desiredRole,
  parentRole,
  onClick,
  ignoreList,
  ...props
}: SelectionItemProps) {
  const active = useMemo(() => {
    //
    // If the role is not in the ignore list, it is active
    //
    if (desiredRole?.id && ignoreList?.includes(desiredRole.id)) {
      return {
        active: false,
        reason: "The role is in the ignore list",
      };
    }

    //
    // If there is no parent role, the role is active
    //
    if (!parentRole)
      return {
        active: true,
        reason: "No parent role",
      };

    //
    // If the parent role is the same as the desired role, the role is not
    // active
    //
    if (parentRole.id === desiredRole.id)
      return {
        active: false,
        reason: "The role is the same as the parent role",
      };

    //
    // If the parent role has the same slug as the desired role, and the
    // permissions are lower or equal, the role is active
    //
    if (parentRole.slug === desiredRole.slug) {
      const desiredRolePermission = getNumericPermission(
        desiredRole.permission as MycPermission
      );

      const parentRolePermission = getNumericPermission(
        parentRole.permission as MycPermission
      );

      if (desiredRolePermission >= parentRolePermission)
        return {
          active: false,
          reason:
            "The role has the same slug as the parent role and the permissions are lower or equal",
        };
    }

    //
    // The role is active
    //
    return {
      active: true,
      reason: "The role is active",
    };
  }, [desiredRole, ignoreList, parentRole]);

  const concreteOnClick = useMemo(() => {
    if (!active) return undefined;

    return () => onClick(desiredRole);
  }, [active, desiredRole, onClick]);

  return (
    <div
      title={active.active ? "Click to select" : active.reason}
      className={selectionItemStyles({ active: active.active })}
      onClick={concreteOnClick}
      {...props}
    >
      <div className="flex flex-col w-full gap-2">
        <Typography>{desiredRole.name}</Typography>
        <Typography as="small" decoration="smooth">
          {desiredRole.description}
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <PermissionIcon permission={desiredRole.permission} size="lg" />
      </div>
    </div>
  );
}

function getNumericPermission(permission: MycPermission): number {
  switch (true) {
    case permission === MycPermission.Read:
      return 0;
    case permission === MycPermission.Write:
      return 1;
    default:
      return 0;
  }
}

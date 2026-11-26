import { cva } from "class-variance-authority";
import Skeleton from "@/components/ui/Skeleton";
import FormField from "@/components/ui/FomField";
import { buttonStyles } from "@/components/ui/button-styles";
import { Check, Loader2, Search } from "lucide-react";
import PermissionBadge from "@/components/ui/PermissionBadge";
import { Popover } from "radix-ui";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { components } from "@/services/openapi/mycelium-schema";
import {
  guestRolesList,
  GuestRolesListParams,
} from "@/services/rpc/subscriptionsManager";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { TextInput } from "@/components/ui/Input";
import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { camelCaseToKebabCase } from "@/functions/camel-to-kebab-text";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";

type GuestRole = components["schemas"]["GuestRole"];
type SystemActor = components["schemas"]["SystemActor"] | string;

const PREFIX = "screens.Dashboard.GuestRoles.GuestRoleSelector";
const LISTBOX_ID = "guest-role-options";

export interface GuestRoleSelectorProps {
  label: string;
  title?: string;
  selectedRole?: GuestRole | null;
  parentRole?: GuestRole | null;
  ignoreList?: string[];
  setSelectedRole: (role: GuestRole) => void;
  shouldBeSystemRole: boolean;
  restrictRoleToSlug?: SystemActor;
  /**
   * The tenant to list roles of. Left undefined, the tenant in the Redux store
   * is used; null lists roles without a tenant filter.
   */
  tenantId?: string | null;
}

/**
 * A custom implementation of Select component
 *
 * @param param0 A set of props
 * @returns A custom implementation of Select component
 */
export default function GuestRoleSelector({
  label,
  title,
  selectedRole,
  parentRole,
  setSelectedRole,
  ignoreList,
  shouldBeSystemRole,
  restrictRoleToSlug,
  tenantId: tenantIdOverride,
}: GuestRoleSelectorProps) {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(selectedRole ? false : true);
  const [isListOpen, setIsListOpen] = useState(false);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);
  const tenantId =
    tenantIdOverride === undefined ? tenantInfo?.id : tenantIdOverride;

  const { isAuthenticated, hasEnoughPermissions, getAccessTokenSilently } =
    useProfile({
      tenantOwnerNeeded: [tenantId || ""],
      roles: [MycRole.SubscriptionsManager],
      permissions: [MycPermission.Read],
    });

  const { searchTerm, setSearchTerm, pageSize } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: 5,
  });

  const swrParams = useMemo<GuestRolesListParams | null>(() => {
    if (!isAuthenticated || !hasEnoughPermissions) return null;

    const params: GuestRolesListParams = {
      pageSize,
      system: shouldBeSystemRole,
      tenantId: tenantId ?? undefined,
    };

    if (searchTerm && searchTerm !== "") {
      params.name = searchTerm;
    }

    if (restrictRoleToSlug) {
      params.slug = camelCaseToKebabCase(restrictRoleToSlug as string);
    }

    return params;
  }, [
    isAuthenticated,
    hasEnoughPermissions,
    pageSize,
    searchTerm,
    restrictRoleToSlug,
    shouldBeSystemRole,
    tenantId,
  ]);

  const swrKey = swrParams
    ? ([
        "rpc",
        "subscriptionsManager.guestRoles.list",
        swrParams.pageSize,
        swrParams.system,
        swrParams.name,
        swrParams.slug,
        swrParams.tenantId,
      ] as const)
    : null;

  const {
    data: guestRolesData,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<GuestRole[]>(
    swrKey,
    () => guestRolesList(swrParams!, getAccessTokenSilently),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  // Search as the user types, debounced so each keystroke does not fire a
  // request.
  const searchDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSearch = (name: string) => {
    if (searchDelay.current) clearTimeout(searchDelay.current);
    searchDelay.current = setTimeout(() => setSearchTerm(name.trim()), 300);
  };

  const searchNow = (name: string) => {
    if (searchDelay.current) clearTimeout(searchDelay.current);
    setSearchTerm(name.trim());
    mutate(guestRolesData, { rollbackOnError: true });
  };

  const handleSelectRole = (role: GuestRole) => {
    setIsListOpen(false);
    setSelectedRole(role);
    setSearchTerm("");
    setIsEditing(false);
  };

  const sortedRoles = [...(guestRolesData ?? [])].sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      getNumericPermission(a.permission as MycPermission) -
        getNumericPermission(b.permission as MycPermission)
  );

  const isSearching = isLoading || isValidating;

  return (
    <FormField label={label} title={title}>
      {selectedRole && !isEditing && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-600/25 dark:border-brand-400/20 bg-card px-4 py-3 shadow-xs">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {selectedRole.name}
              </span>
              <PermissionBadge permission={selectedRole.permission} />
            </span>
            {selectedRole.description && (
              <span className="text-xs text-muted-foreground line-clamp-2">
                {selectedRole.description}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setIsListOpen(true);
            }}
            className={buttonStyles({ intent: "secondary", size: "xs" })}
          >
            {t(`${PREFIX}.change`)}
          </button>
        </div>
      )}

      {isEditing && (
        <Popover.Root open={isListOpen} onOpenChange={setIsListOpen}>
          <Popover.Anchor asChild>
            <div data-role-search>
          <TextInput
            icon={Search}
            placeholder={t(`${PREFIX}.placeholder`)}
            defaultValue={searchTerm ?? ""}
            sizing="md"
            autoComplete="off"
            role="combobox"
            aria-expanded
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            onFocus={() => setIsListOpen(true)}
            onClick={() => setIsListOpen(true)}
            onChange={(event) => {
              setIsListOpen(true);
              scheduleSearch(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsListOpen(false);
                return;
              }
              // The selector lives inside the modal's form: Enter searches,
              // it must not submit the invitation.
              if (event.key !== "Enter") return;
              event.preventDefault();
              searchNow(event.currentTarget.value);
            }}
            rightIcon={
              isSearching
                ? () => (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )
                : undefined
            }
          />
            </div>
          </Popover.Anchor>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              collisionPadding={12}
              // Keep the caret in the search field while the list is open.
              onOpenAutoFocus={(event) => event.preventDefault()}
              onInteractOutside={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest("[data-role-search]")) event.preventDefault();
              }}
              className="z-1001 w-(--radix-popover-trigger-width) outline-none animate-in fade-in-0 slide-in-from-top-1 duration-150"
            >
          <div
            id={LISTBOX_ID}
            role="listbox"
            aria-label={t(`${PREFIX}.title`)}
            className="flex flex-col gap-1 max-h-[min(18rem,var(--radix-popover-content-available-height))] overflow-y-auto scrollbar rounded-xl border border-border bg-popover p-1.5 shadow-raised"
          >
            {isLoading && !guestRolesData && (
              <div className="p-2">
                <Skeleton.ListRows count={3} lines={1} />
              </div>
            )}

            {!isLoading && sortedRoles.length === 0 && (
              <span className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t(`${PREFIX}.empty`)}
              </span>
            )}

            {sortedRoles.map((role) => (
              <SelectionItem
                key={role.id}
                desiredRole={role}
                parentRole={parentRole}
                selected={role.id === selectedRole?.id}
                onClick={handleSelectRole}
                ignoreList={ignoreList}
              />
            ))}
          </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </FormField>
  );
}

const selectionItemStyles = cva(
  "flex items-start justify-between gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      active: {
        true: "cursor-pointer hover:bg-muted focus-visible:bg-muted dark:hover:bg-surface-800",
        false: "cursor-not-allowed opacity-60",
      },
      selected: {
        true: "bg-brand-50 dark:bg-brand-900/40",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      selected: false,
    },
  }
);

interface SelectionItemProps {
  desiredRole: GuestRole;
  parentRole?: GuestRole | null;
  selected: boolean;
  onClick: (role: GuestRole) => void;
  ignoreList?: string[];
}

type Availability = { active: true } | { active: false; reasonKey: string };

function roleAvailability(
  desiredRole: GuestRole,
  parentRole?: GuestRole | null,
  ignoreList?: string[]
): Availability {
  if (desiredRole.id && ignoreList?.includes(desiredRole.id)) {
    return { active: false, reasonKey: "ignored" };
  }

  if (!parentRole) return { active: true };

  if (parentRole.id === desiredRole.id) {
    return { active: false, reasonKey: "sameAsParent" };
  }

  // A child with the parent's slug must have a lower permission.
  if (
    parentRole.slug === desiredRole.slug &&
    getNumericPermission(desiredRole.permission as MycPermission) >=
      getNumericPermission(parentRole.permission as MycPermission)
  ) {
    return { active: false, reasonKey: "notBelowParent" };
  }

  return { active: true };
}

function SelectionItem({
  desiredRole,
  parentRole,
  selected,
  onClick,
  ignoreList,
}: SelectionItemProps) {
  const { t } = useTranslation();
  const availability = roleAvailability(desiredRole, parentRole, ignoreList);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      disabled={!availability.active}
      className={selectionItemStyles({ active: availability.active, selected })}
      onClick={() => onClick(desiredRole)}
    >
      <span className="flex flex-col gap-1 min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{desiredRole.name}</span>
          {desiredRole.slug && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground dark:bg-surface-800">
              {desiredRole.slug}
            </span>
          )}
        </span>
        {desiredRole.description && (
          <span className="text-xs text-muted-foreground line-clamp-2">
            {desiredRole.description}
          </span>
        )}
        {!availability.active && (
          <span className="text-xs text-amber-700 dark:text-amber-300">
            {t(`${PREFIX}.unavailable.${availability.reasonKey}`)}
          </span>
        )}
      </span>

      <span className="flex items-center gap-2 shrink-0">
        <PermissionBadge permission={desiredRole.permission} />
        {selected && <Check className="size-4 text-primary dark:text-brand-300" />}
      </span>
    </button>
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

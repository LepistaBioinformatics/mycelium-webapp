import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import listPendingInvitations, {
  PendingInvitation,
} from "@/functions/list-pending-invitations";
import useProfile from "@/hooks/use-profile";
import { useMemo, useSyncExternalStore } from "react";

// Invitations accepted in this session. The gateway caches the profile for
// `cache.profileTtl` (60 s by default), so a refetch right after accepting can
// still list them as pending.
let accepted: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

export function markInvitationAccepted(key: string): void {
  accepted = new Set([...accepted, key]);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default function usePendingInvitations(): {
  invitations: PendingInvitation[];
  isLoading: boolean;
} {
  const { profile, isLoadingProfile } = useProfile();
  const acceptedKeys = useSyncExternalStore(subscribe, () => accepted);

  const invitations = useMemo(
    () =>
      listPendingInvitations(
        getLicensedResourcesOrNull(profile?.licensedResources),
        acceptedKeys
      ),
    [profile?.licensedResources, acceptedKeys]
  );

  return { invitations, isLoading: isLoadingProfile };
}

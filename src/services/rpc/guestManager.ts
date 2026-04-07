import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { rpcCall } from "./client";

type GuestRole = components["schemas"]["GuestRole"];

// ---------------------------------------------------------------------------
// Guest roles
// ---------------------------------------------------------------------------

export interface GuestRolesListParams {
  name?: string;
  slug?: string;
  system?: boolean;
  pageSize?: number;
  skip?: number;
}

export function guestRolesList(
  params: GuestRolesListParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<GuestRole>> {
  return rpcCall<GuestRolesListParams, PaginatedRecords<GuestRole>>(
    "guestManager.guestRoles.list",
    params,
    getToken
  );
}

export interface GuestRolesCreateParams {
  name: string;
  description: string;
  permission?: number | null;
  system: boolean;
}

export function guestRolesCreate(
  params: GuestRolesCreateParams,
  getToken: () => Promise<string>
): Promise<GuestRole> {
  return rpcCall<GuestRolesCreateParams, GuestRole>(
    "guestManager.guestRoles.create",
    params,
    getToken
  );
}

export interface GuestRolesUpdateNameAndDescriptionParams {
  guestRoleId: string;
  name?: string | null;
  description?: string | null;
}

export function guestRolesUpdateNameAndDescription(
  params: GuestRolesUpdateNameAndDescriptionParams,
  getToken: () => Promise<string>
): Promise<GuestRole> {
  return rpcCall<GuestRolesUpdateNameAndDescriptionParams, GuestRole>(
    "guestManager.guestRoles.updateNameAndDescription",
    params,
    getToken
  );
}

export interface GuestRolesDeleteParams {
  guestRoleId: string;
}

export function guestRolesDelete(
  params: GuestRolesDeleteParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<GuestRolesDeleteParams, void>(
    "guestManager.guestRoles.delete",
    params,
    getToken
  );
}

export interface GuestRolesInsertRoleChildParams {
  guestRoleId: string;
  childId: string;
}

export function guestRolesInsertRoleChild(
  params: GuestRolesInsertRoleChildParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<GuestRolesInsertRoleChildParams, void>(
    "guestManager.guestRoles.insertRoleChild",
    params,
    getToken
  );
}

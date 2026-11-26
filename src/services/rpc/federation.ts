import { components } from "@/services/openapi/mycelium-schema";
import { rpcCall } from "./client";

// The federation DTOs travel only over JSON-RPC and are not part of the
// gateway's OpenAPI document, so they are typed here after the Rust structs
// in `core/src/domain/dtos/federation/`.

type Permission = components["schemas"]["Permission"];
type LicensedResource = components["schemas"]["LicensedResource"];
type WrittenBy = components["schemas"]["WrittenBy"];

export type PeerStatus =
  | "declared"
  | "handshaking"
  | "active"
  | "degraded"
  | "unreachable"
  | "quarantined"
  | "untrusted";

export type LinkStatus = "pending" | "active" | "revoked";

export interface FederationPolicy {
  mayAssert: boolean;
  allowDifferentEmails: boolean;
  allowedLocalRoles: string[];
  allowedLocalPermissions: Permission[];
}

export interface FederationPeer {
  id: string;
  instanceId: string;
  baseUrl: string;
  displayName?: string | null;
  status: PeerStatus;
  consumeKinds: string[];
  serveKinds: string[];
  negotiatedKinds: string[];
  policy: FederationPolicy;
  lastContactAt?: string | null;
  failureCount: number;
  created: string;
  createdBy?: WrittenBy | null;
  updated?: string | null;
  updatedBy?: WrittenBy | null;
}

export interface PeerOverview extends FederationPeer {
  keyIds: string[];
}

export interface IdentityLink {
  id: string;
  localUserId: string;
  localEmail: string;
  peerId: string;
  peerSubjectRef?: string | null;
  localSubjectRef: string;
  status: LinkStatus;
  created: string;
  establishedAt?: string | null;
  revokedAt?: string | null;
  revokedBy?: WrittenBy | null;
}

export interface StoredAssertion {
  linkId: string;
  peerId: string;
  assertion: {
    jws: string;
    payload: {
      grants: LicensedResource[];
      issuerNamespace: { tenants: string[]; accounts: string[] };
    };
    issuedAt: string;
    expiresAt: string;
  };
}

export interface GrantTranslationRule {
  id: string;
  peerId: string;
  issuer: { tenantId: string; role: string; minPerm: Permission };
  local: { accountId: string; guestRoleId: string; perm: Permission };
  enabled: boolean;
}

export interface RoleCatalogEntry {
  slug: string;
  name: string;
  description?: string | null;
  permission: Permission;
  system: boolean;
  children: string[];
}

export type PeerVocabularyAnswer =
  | { outcome: "verified"; roles: RoleCatalogEntry[] }
  | { outcome: "unknown" }
  | { outcome: "rejected"; reason: string };

export interface InstanceSetting {
  key: string;
  value: unknown;
  createdBy?: WrittenBy | null;
  updatedBy?: WrittenBy | null;
  created: string;
  updated?: string | null;
}

/** Rust's `DeletionResponseKind<Uuid>`, externally tagged */
export type TranslationRuleDeletion =
  | "Deleted"
  | { NotDeleted: [string, string] };

export interface PeerParams {
  instanceId: string;
}

export interface SetFederationEnabledParams {
  enabled: boolean;
}

export interface LinkParams {
  linkId: string;
}

export interface ListTranslationRulesParams {
  peerInstanceId?: string;
}

export interface CreateTranslationRuleParams {
  peerInstanceId: string;
  issuerTenantId: string;
  issuerRole: string;
  issuerMinPerm: Permission;
  localAccountId: string;
  localGuestRoleId: string;
  localPerm: Permission;
}

export interface TranslationRuleParams {
  ruleId: string;
}

export interface SetTranslationRuleEnabledParams {
  ruleId: string;
  enabled: boolean;
}

export function peersList(
  getToken: () => Promise<string>
): Promise<PeerOverview[]> {
  return rpcCall<Record<string, never>, PeerOverview[]>(
    "federation.peers.list",
    {},
    getToken
  );
}

export function peersQuarantine(
  params: PeerParams,
  getToken: () => Promise<string>
): Promise<FederationPeer> {
  return rpcCall<PeerParams, FederationPeer>(
    "federation.peers.quarantine",
    params,
    getToken
  );
}

export function peersRelease(
  params: PeerParams,
  getToken: () => Promise<string>
): Promise<FederationPeer> {
  return rpcCall<PeerParams, FederationPeer>(
    "federation.peers.release",
    params,
    getToken
  );
}

export function peersRoles(
  params: PeerParams,
  getToken: () => Promise<string>
): Promise<PeerVocabularyAnswer> {
  return rpcCall<PeerParams, PeerVocabularyAnswer>(
    "federation.peers.roles",
    params,
    getToken
  );
}

export function setEnabled(
  params: SetFederationEnabledParams,
  getToken: () => Promise<string>
): Promise<InstanceSetting> {
  return rpcCall<SetFederationEnabledParams, InstanceSetting>(
    "federation.setEnabled",
    params,
    getToken
  );
}

export function linksList(
  getToken: () => Promise<string>
): Promise<IdentityLink[]> {
  return rpcCall<Record<string, never>, IdentityLink[]>(
    "federation.links.list",
    {},
    getToken
  );
}

export function linksRevoke(
  params: LinkParams,
  getToken: () => Promise<string>
): Promise<IdentityLink> {
  return rpcCall<LinkParams, IdentityLink>(
    "federation.links.revoke",
    params,
    getToken
  );
}

export function assertionsList(
  getToken: () => Promise<string>
): Promise<StoredAssertion[]> {
  return rpcCall<Record<string, never>, StoredAssertion[]>(
    "federation.assertions.list",
    {},
    getToken
  );
}

export function translationsList(
  params: ListTranslationRulesParams,
  getToken: () => Promise<string>
): Promise<GrantTranslationRule[]> {
  return rpcCall<ListTranslationRulesParams, GrantTranslationRule[]>(
    "federation.translations.list",
    params,
    getToken
  );
}

export function translationsCreate(
  params: CreateTranslationRuleParams,
  getToken: () => Promise<string>
): Promise<GrantTranslationRule> {
  return rpcCall<CreateTranslationRuleParams, GrantTranslationRule>(
    "federation.translations.create",
    params,
    getToken
  );
}

export function translationsSetEnabled(
  params: SetTranslationRuleEnabledParams,
  getToken: () => Promise<string>
): Promise<GrantTranslationRule> {
  return rpcCall<SetTranslationRuleEnabledParams, GrantTranslationRule>(
    "federation.translations.setEnabled",
    params,
    getToken
  );
}

/**
 * Delete a translation rule. The gateway answers `NotDeleted` (with a reason)
 * when nothing was removed; that is raised as an error.
 */
export async function translationsDelete(
  params: TranslationRuleParams,
  getToken: () => Promise<string>
): Promise<void> {
  const result = await rpcCall<TranslationRuleParams, TranslationRuleDeletion>(
    "federation.translations.delete",
    params,
    getToken
  );

  if (result !== "Deleted") {
    throw new Error(result.NotDeleted[1]);
  }
}

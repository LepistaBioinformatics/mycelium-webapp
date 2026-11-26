// String keys — never renumber/reorder these. External links (e.g. the
// onboarding flow, RequiredContactInfoBanner) reference tabs by name via
// ?tab=<key>; numeric indices silently broke every time a tab was inserted.
export enum ActiveTab {
  Overview = "overview",
  LicensedResources = "licensedResources",
  Invitations = "invitations",
  TenantOwnership = "tenantOwnership",
  ListConnectionStrings = "listConnectionStrings",
  TelegramIdentity = "telegramIdentity",
  ContactInfo = "contactInfo",
}

// Tabs that were merged into another one; old links keep working.
export const LEGACY_TABS: Record<string, ActiveTab> = {
  advancedOptions: ActiveTab.ListConnectionStrings,
};

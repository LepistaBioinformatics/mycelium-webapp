// String keys — never renumber/reorder these. External links (e.g. the
// onboarding flow, RequiredContactInfoBanner) reference tabs by name via
// ?tab=<key>; numeric indices silently broke every time a tab was inserted.
export enum ActiveTab {
  Overview = "overview",
  LicensedResources = "licensedResources",
  TenantOwnership = "tenantOwnership",
  ListConnectionStrings = "listConnectionStrings",
  AdvancedOptions = "advancedOptions",
  TelegramIdentity = "telegramIdentity",
  ContactInfo = "contactInfo",
}

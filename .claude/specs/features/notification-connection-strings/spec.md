# Feature: Notification-scoped connection strings

**Status:** Specified — executing
**Size:** Medium (two RPC wrappers, one modal, list labels, error mapping)
**Origin:** issue #45 (DEN-22). Depends on gateway `beginners.tokens.listNotificationServices`
(spec `notification-issuance-options` in the gateway).

## Requirements

- **NCS-01** Typed RPC wrappers in `services/rpc/beginners.ts`:
  `tokensListNotificationServices` (`beginners.tokens.listNotificationServices`) and
  `tokensCreateNotification` (`beginners.tokens.createNotification`). No REST.
- **NCS-02** Profile → Connection strings: a "Notification connection string" action, shown only
  when the caller can issue for at least one service.
- **NCS-03** Issuance modal: name; service picker (display name + sender tag); tenant picker
  with the service's `tenantIds` by name, plus "no namespace" when `allowsNoTenant` (tenant
  required otherwise); expiration options capped by `maxConnectionStringTtlInDays` (the cap
  itself offered when it is not a preset).
- **NCS-04** After creation the string is shown once, with a warning: long-lived secret the
  downstream service must store; it only sends notifications.
- **NCS-05** The list labels notification strings by scope (`notify:email`, `scp` bean) and
  service (`svc` bean); revoke/delete work as for the other strings.
- **NCS-06** Issuance errors MYC00035 (invalid expiration / tenant required), MYC00036 (service
  notifications not enabled) and MYC00037 (issuer not allowed) map to readable messages
  (`RpcCallError` carries `error.data.code`).
- **NCS-07** i18n en / pt-br / es; regenerate `mycelium-schema.d.ts` so `ConnectionStringBean`
  has `scp` / `svc`.

## Verification

`yarn build`, `yarn lint`, `yarn test` (error-code mapping, option capping), Cypress e2e with a
stubbed gateway (issue flow, tenant requirement, list labels, error message); screenshots.

# Feature: Accept guest invitations

**Status:** Specified — executing
**Size:** Medium (one RPC wrapper, one Profile tab, one banner, i18n)
**Gateway:** no change. A pending invitation is a `LicensedResource` with `verified: false` in the
caller's profile (`beginners.profile.get` fetches licenses with `was_verified = None`), and
`beginners.guests.acceptInvitation` (`accountId`, `guestRoleName`, `permission` 0 = read,
1 = write) verifies the caller's own pending license.

## Requirements

- **INV-01** Typed RPC wrapper `guestsAcceptInvitation` in `services/rpc/beginners.ts`. No REST.
- **INV-02** Pending invitations are derived from the profile: licenses with `verified === false`,
  one entry per (account, role, permission).
- **INV-03** Profile → new "Invitations" tab (`?tab=invitations`): each pending invitation shows
  the account name, the tenant name, the role and the permission, with an "Accept" action.
  Empty state when nothing is pending.
- **INV-04** A dashboard banner appears while invitations are pending ("You have N pending
  invitations") and links to the tab.
- **INV-05** After accepting, the invitation leaves the list at once and the profile is
  refetched. The gateway caches profiles (`cache.profileTtl`, 60 s by default), so accepted
  invitations stay hidden for the rest of the session even if a stale profile still lists them,
  and the user is told the new access can take up to a minute to apply.
- **INV-06** Accept errors are shown with the RPC error message.
- **INV-07** i18n en / pt-br / es.

## Out of scope

- Declining an invitation: the gateway has no beginner endpoint for it (only managers uninvite).
- A link from the invitation email to this tab (gateway template change).

## Verification

`yarn build`, `yarn lint`, `yarn test` (pending-invitation derivation), Cypress e2e with a
stubbed gateway (list, accept, banner, error).

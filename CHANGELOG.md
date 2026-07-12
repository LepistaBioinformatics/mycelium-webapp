## [1.1.1](https://github.com/LepistaBioinformatics/mycelium-webapp/compare/v1.1.0...v1.1.1) (2026-07-12)


### Bug Fixes

* **docker:** bump builder image to node:22-alpine ([776336d](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/776336db80a62f0ae0430a89db5d06f7a19f0156))

# [1.1.0](https://github.com/LepistaBioinformatics/mycelium-webapp/compare/v1.0.0...v1.1.0) (2026-07-12)


### Features

* tenant/profile overview tabs, mobile UX fixes, design system audit ([0a3c4bc](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/0a3c4bcc4901edcf6542c8a287602e7b397fd866))

# 1.0.0 (2026-07-12)


### Bug Fixes

* fix the account deletion to avoid users account deletions ([2b66f2b](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/2b66f2bf9b584d5ecdc137b8082871bb3abe5b2c))
* fix the profile screen to cleanup the screen organization ([10f896f](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/10f896f206b0e1afabcfa3c333642d498941d596))
* fix the tenant resolving to include alto contained tenant ownership from profile object ([ebd2d61](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/ebd2d6145f5c79acc69a2e3ff1d06a54e6b3a5b4))
* fix translation of the permission details in account details ([ed83132](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/ed831328987cf9f251a9c7171c6ba803ba799021))
* hoist BrowserRouter above NativeAuthProvider to fix useNavigate crash ([60af545](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/60af5454f3bf9925555fac21deb7314febd8e84f))
* include the is-deleted flag to accounts model ([bc684c7](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/bc684c7d4a3fbe66021f37b80f430d16541c0d88))
* **lint:** resolve pre-existing ESLint errors across codebase ([02e9c53](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/02e9c5329ba31454fcd59f030081136f47fc6e9a))
* **notifications:** repair invisible and auto-dismissing notification banner ([a46ec98](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/a46ec983491fcc5b8df933828b1f40429d88ec3e))
* omit namespace and account creation when in outsode of the tenant domain ([8597138](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/85971385c713d2de42a24a95df62e4cbbfc148b5))
* **profile:** show empty state on Shared With Me and Namespaces tabs ([7df9e27](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/7df9e27d72de022f9ed10a019636b39d748766a8))
* remove accidental print of json response ([14444dc](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/14444dc68b732ffc4b1c8698f55c37a28fe96740))
* remove user creation step during the account initialization ([597d2df](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/597d2dfab7e7f8ce6afa9a97573c5eeecb41058a))
* replace permissioned roles by roles on conn string generation ([a364934](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/a364934a61cfa9a1c2b8a7b5a96ef17a8861d416))
* resolve H2/M2 concerns and complete P10 RPC migration ([d2159e1](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/d2159e19da199e9389aafe8bdd0a34cb85cda4e7))
* resolve H3 hooks violation and M4 useAuth0 scatter (concerns) ([f767f52](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/f767f523732c36fba96b8f589e9291cdd025c57e))
* **rpc:** clean up lint errors and migrate AccountModal systemScoped branch to RPC ([9663a8e](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/9663a8ef0cc0fbef4e9aa8b8314c9aaf30493320))
* **sidebar:** absolute overlay, static labels, mobile bottom padding ([739d705](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/739d705c8623c9b07ff428cf0cad298ffb6b0460))
* **sidebar:** uniform icon alignment when collapsed ([0c8b84e](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/0c8b84e10324bc36ec4181960f2e70b057d44fcd))
* **tenants:** remove broken edit button, replace FaGear with MdManageAccounts ([91dcbe7](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/91dcbe79f267c373c3df0ae5d524435ee4171ff8))


### Features

* **account-conn-strings:** implements the functionality to generate account-scopped conneciton-strings ([61b0292](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/61b02925370b88abdf9a19077acd8c6b227e0c61))
* add rpc lib to the project supporting mycelium rpc ([d887948](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/d887948ac44bbd1a6c6f01fa2171f67bf124bd4b))
* **auth:** replace Auth0 with native magic link auth (M4) ([0a9f02b](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/0a9f02b8f9677559eace8b3ef024628702bf9db1))
* **connection-string:** implements global and tenant-scopped connection strings generator ([fbab44d](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/fbab44daabc69827cdb99833ccd7b0921bd1ca07))
* consume public app config endpoint to replace hardcoded brand name ([c22947d](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/c22947deae0787c220ed77f3de66469170ecbd18))
* **design-system:** add brand tokens and migrate UI components ([1d21101](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/1d21101cc7832eed24dcac9e75fb9b6865207c35)), closes [#8b5cf6](https://github.com/LepistaBioinformatics/mycelium-webapp/issues/8b5cf6)
* **design-system:** adopt Lepista DS across dashboard, simplify onboarding ([4a8c2aa](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/4a8c2aa0e77c92609b5c2744d321b413ff5dedc3))
* **design-system:** migrate all components and screens to brand tokens ([70ce778](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/70ce778a1886a0af99677fa63dc211ff08f89232))
* do implements the option to create role-associated accounts ([565f105](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/565f105f1a09c70f279f05e13990405438352791))
* **home:** persist auth step in URL search params ([0750f54](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/0750f54c429bd9dee22596a2d5c0cab7d15ec086))
* **home:** polish homepage — contrast, typography, full-page background ([951a279](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/951a279545ac7752186eb133c82f696bc1cfde5b))
* **home:** redesign as landing page with onboarding timeline in dashboard ([20205c4](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/20205c41579ccd28df94926a7fec6266bc33d0b8))
* **home:** replace old auth flow with onboarding checklist ([2b60cf8](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/2b60cf83831e598e3f840d8288f3444b963e7dae))
* implements the role-associated account creation ([0571c9b](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/0571c9b51bb1bd44fe2b21a563de17e27ae10672))
* include the user permission at the account details and implements the auto update for the tenant ([d64516c](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/d64516ca3cde9f35cfeaa6d3b2492a01fc09760d))
* **mycelium-openapi:** upgrade mycelium openapi documentation ([13da20f](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/13da20fcbb09efe1415f8ceda234194a90541467))
* **onboarding:** phone/whatsapp save fix, locale language switch, post-completion edit ([dbd7d26](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/dbd7d2687b665b11fa39cce76e1ec3a840436d46))
* **profile:** expand Identity tab with WhatsApp, Discord, Slack coming-soon cards ([037ecdb](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/037ecdb08a0c65975d64a855235f8355840df288))
* **pwa:** configure pwa for the application ([bd1853e](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/bd1853e93933be5d30dde9380ca3a68bc640b3eb))
* **rpc:** add rpcCall and rpcBatch client layer ([35d221b](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/35d221b784bbf1d04296d176d422c7f674107c0f))
* **rpc:** migrate beginners tenants/tokens/accounts to JSON-RPC ([91c8233](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/91c8233f419f1e1736d95611e86e4188b104f188))
* **rpc:** migrate gatewayManager discovery to JSON-RPC ([e90426e](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/e90426e140cdf197027553067ca8241f462a971e))
* **rpc:** migrate guestManager guestRoles to JSON-RPC ([e057bdc](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/e057bdc2cf314cc46d58dbed8355e696be008e68))
* **rpc:** migrate managers tenants/accounts/guestRoles to JSON-RPC ([06a0255](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/06a025533d2de1084c5f4e0946e54508535544e5))
* **rpc:** migrate staff account privilege upgrades to JSON-RPC ([76093e4](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/76093e4a9192d7cb37baed13429b0001c25a4ca7))
* **rpc:** migrate subscriptionsManager accounts and guests to JSON-RPC ([b243b6d](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/b243b6d473fd5251958a9b1db9fd874a09479a79))
* **rpc:** migrate systemManager webhooks and errorCodes to JSON-RPC ([4bc34f3](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/4bc34f35a8c597bfb7e73d86edea76e031d1e450))
* **rpc:** migrate tenantManager tenant/accounts/tags to JSON-RPC ([57f12d0](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/57f12d03b7f7d1590e146cefd3fa02c181d5b58f))
* **rpc:** migrate tenantOwner meta and owners to JSON-RPC ([476843f](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/476843f0d4be3a21a361c581521e718f650ffedb))
* **rpc:** migrate tenantOwner meta and owners to JSON-RPC ([385515e](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/385515ebe820d12fc9a8e5fb5f33aac3a1016d72))
* **sidebar:** replace tenant avatar with user avatar + onboarding progress ring ([2a72d35](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/2a72d356d46007e43f0b77ecb95f3f2b1a752cdb))
* **telegram:** complete M5.1 — webhook URL display, link service, onboarding cleanup ([1e3f379](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/1e3f3795d25f8c43642cf94f897cc0f8c02c498e))
* **tenant:** split notifications tab, fix card overflow, add release CI ([0f0e30e](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/0f0e30ea7473fdeaddb117d3c7596eddc3ac2fb7))
* **theme:** system theme + design system color pass ([4fa263a](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/4fa263a062d658febc26ca1179bd5df4d7497570))
* **ux:** vertical nav tabs, inline legal form, brand compression, scrollbar polish ([fcd5c1b](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/fcd5c1b245974a88f77f781f716f50130de41209))
* **webapp:** add Telegram IdP UI — bot config form and identity panel (M5) ([8124779](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/8124779638aa15c8f340b2f7fcd7822bc57bd7e3))
* **webhook-modal:** implements the webhook modal to register new webhooks ([234305d](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/234305db825442e9fa9c01a5d2e5e170857cc312))
* **written-by:** create written-by component to allow users to check resource ownership ([adda0c8](https://github.com/LepistaBioinformatics/mycelium-webapp/commit/adda0c842a2106af25a94154dea155c12827c1e7))

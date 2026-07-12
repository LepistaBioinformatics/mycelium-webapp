# MyWAPP - Mycelium WebAPP

It is the official webapp for the Mycelium API Gateway project.

## Getting Started

Releases published on the [Releases page](https://github.com/LepistaBioinformatics/mycelium-webapp/releases)
are source-only (tag + changelog) — there's no prebuilt static bundle, since the
API endpoint is compiled into the build at build time and can't be swapped
afterwards. To run the app against your own [MAG](https://github.com/LepistaBioinformatics/mycelium)
instance:

```bash
git clone https://github.com/LepistaBioinformatics/mycelium-webapp.git
cd mycelium-webapp
cp .env.example .env.production   # point VITE_MYCELIUM_API_URL at your gateway
yarn install
yarn build
yarn preview                      # serves dist/ locally
```

For local development instead of a static build, copy `.env.example` to
`.env.local` and run `yarn dev`.

## Features

[MAG (Mycelium API Gateway)](https://github.com/LepistaBioinformatics/mycelium) is a
ready-to-use API Gateway for your microservices. MyWAPP is a webapp that allows
you to manage your API Gateway.

### Authentication

MAG should support any identity provider that implements [OAuth
2.0](https://oauth.net/2/) protocol. Then MyWAPP implements the authentication
based on Auth0 identity provider, but feel free to use any other provider.

![MyWAPP Login Page](./docs/screenshots/01-login-page.png "MyWAPP Login Page")

### Dashboard

You should manage your API Gateway resources in the Dashboard page.

![MyWAPP Dashboard](./docs/screenshots/02-profile-page-02.png "MyWAPP Dashboard")

### Tenant Management

![MyWAPP Tenant Management](./docs/screenshots/03-tenant-management.png "MyWAPP Tenant Management")

### Account Details Page

![MyWAPP Account Details Page](./docs/screenshots/04-account-details-page.png "MyWAPP Account Details Page")

### Account Sharing

![MyWAPP Account Sharing](./docs/screenshots/05-account-sharing.png "MyWAPP Account Sharing")

### Fine Grant Connection String Management

![MyWAPP Fine Grant Connection String Management](./docs/screenshots/06-fine-grant-connection-string-management.png "MyWAPP Fine Grant Connection String Management")

### Roles System Page

![MyWAPP Roles System Page](./docs/screenshots/07-roles-system-page.png "MyWAPP Roles System Page")

### Webhooks Page

![MyWAPP Webhooks Page](./docs/screenshots/08-webhooks-page.png "MyWAPP Webhooks Page")

### Operations Page

![MyWAPP Operations Page](./docs/screenshots/09-operations-page.png "MyWAPP Operations Page")

### Mobile App

![MyWAPP Mobile App](./docs/screenshots/10-mobile-profile.png "MyWAPP Mobile App")

### Multi-language support

![MyWAPP Multi-language support](./docs/screenshots/11-mobile-multilang.png "MyWAPP Multi-language support")

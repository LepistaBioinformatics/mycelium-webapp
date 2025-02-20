import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react';

const CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
const DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;
const SCOPE = import.meta.env.VITE_AUTH0_SCOPE;


createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain={DOMAIN}
    clientId={CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      display: 'popup',
      prompt: 'login',
      scope: SCOPE,
      response_type: 'code',
      audience: AUDIENCE,
    }}
  >
    <App />
  </Auth0Provider>
)

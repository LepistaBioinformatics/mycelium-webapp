import './index.css'
import ReactDOM from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import { ThemeProvider } from "./components/ThemeProvider";
import App from "./App";

const CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
const DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;
const SCOPE = import.meta.env.VITE_AUTH0_SCOPE;

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ThemeProvider>
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
    </ThemeProvider>
  </React.StrictMode>
);

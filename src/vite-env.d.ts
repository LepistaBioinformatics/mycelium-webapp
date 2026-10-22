/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MYCELIUM_API_URL: string;
  readonly VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID?: string;
}

declare module 'react-json-pretty/dist/monikai';

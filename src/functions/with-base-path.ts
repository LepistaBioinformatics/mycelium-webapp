/**
 * Prefix a path with the base the app was built for (`VITE_BASE_PATH`), so
 * `public/` assets and URLs outside the router resolve under `/_app/` too.
 */
export function withBasePath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

/** React Router `basename`: the base without its trailing slash. */
export function routerBasename(): string {
  return import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";
}

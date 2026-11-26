import type { paths } from "./mycelium-schema";

/** Gateway URL without a trailing slash; empty means the page's own origin. */
export function resolveApiUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "");
}

export const MYCELIUM_API_URL = resolveApiUrl(
  import.meta.env.VITE_MYCELIUM_API_URL
);

export const buildPath = (
    path: keyof paths,
    params?: {
        query?: Record<string, string>,
        path?: Record<string, string>,
    }
) => {
    const url = new URL(`${MYCELIUM_API_URL}${path}`, window.location.origin);

    if (params?.path) {
        Object.entries(params.path).forEach(([key, value]) => {
            url.pathname = url.pathname.replace(
                encodeURIComponent(`{${key}}`),
                encodeURIComponent(value)
            );
        });
    }

    if (params?.query) {
        url.search = `?${new URLSearchParams(params.query).toString()}`;
    }

    return url.toString();
};

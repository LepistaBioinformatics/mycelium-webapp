import type { paths } from "./mycelium-schema";

export const MYCELIUM_API_URL = import.meta.env.VITE_MYCELIUM_API_URL;

export const buildPath = (
    path: keyof paths,
    params?: {
        query?: Record<string, string>,
        path?: Record<string, string>,
    }
) => {
    const url = new URL(`${MYCELIUM_API_URL}${path}`);

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

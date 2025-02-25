import createClient from "openapi-fetch";
import {
    createQueryHook,
    createImmutableHook,
    createInfiniteHook,
    createMutateHook,
} from "swr-openapi";
import { isMatch } from "lodash-es";
import type { paths } from "./mycelium-schema";

const MYCELIUM_API_URL = import.meta.env.VITE_MYCELIUM_API_URL;

const client = createClient<paths>({ baseUrl: MYCELIUM_API_URL });

const prefix = "mycelium-v7-api";

export const useQuery = createQueryHook(client, prefix);
export const useImmutable = createImmutableHook(client, prefix);
export const useInfinite = createInfiniteHook(client, prefix);
export const useMutate = createMutateHook(
    client,
    prefix,
    isMatch,
);

export const buildPath = (
    path: keyof paths,
    params?: {
        query?: Record<string, string>,
        path?: Record<string, string>,
    }
) => {
    let url = new URL(`${MYCELIUM_API_URL}${path}`);

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

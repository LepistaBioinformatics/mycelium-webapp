import useSWR from "swr";

import {
  AppPublicConfig,
  fetchAppPublicConfig,
} from "@/services/app-config";

export function useAppConfig() {
  const { data, error } = useSWR<AppPublicConfig>(
    "app-public-config",
    fetchAppPublicConfig,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return { appConfig: data, appConfigError: error };
}

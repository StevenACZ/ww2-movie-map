import type { IndexPayload } from "~~/types/view";

export function useIndexData() {
  const { locale } = useI18n();
  return useFetch<IndexPayload>(() => `/api/index/${locale.value}`, {
    key: `index-${locale.value}`,
    dedupe: "defer",
  });
}

import type { Locale } from "~~/types/data";

interface PageSeo {
  /** Locale-agnostic path, e.g. "/films/dunkirk-2017". */
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "video.movie" | "video.tv_show" | "article";
  jsonLd?: unknown[];
  noindex?: boolean;
}

export function usePageSeo(input: () => PageSeo) {
  const { locale } = useI18n();
  const route = useRoute();

  useHead(() => {
    const page = input();
    const current = locale.value as Locale;
    return {
      link: [
        { rel: "canonical", href: absoluteUrl(page.path, current) },
        {
          rel: "alternate",
          hreflang: "en",
          href: absoluteUrl(page.path, "en"),
        },
        {
          rel: "alternate",
          hreflang: "es",
          href: absoluteUrl(page.path, "es"),
        },
        {
          rel: "alternate",
          hreflang: "x-default",
          href: absoluteUrl(page.path, "en"),
        },
      ],
      script: (page.jsonLd ?? []).map((graph) => jsonLdScript(graph)),
    };
  });

  useSeoMeta({
    title: () => input().title,
    description: () => input().description,
    robots: () =>
      input().noindex || Object.keys(route.query).length > 0
        ? NOINDEX_FOLLOW_ROBOTS
        : INDEXABLE_ROBOTS,
    ogType: () => input().type ?? "website",
    ogTitle: () => input().title,
    ogDescription: () => input().description,
    ogUrl: () => absoluteUrl(input().path, locale.value as Locale),
    ogLocale: () => (locale.value === "es" ? "es_ES" : "en_US"),
    ogLocaleAlternate: () => (locale.value === "es" ? ["en_US"] : ["es_ES"]),
    ogImage: () => input().image ?? OG_IMAGE,
    ogImageAlt: () => input().imageAlt ?? input().title,
    ogImageWidth: () => (input().image ? input().imageWidth : OG_IMAGE_WIDTH),
    ogImageHeight: () =>
      input().image ? input().imageHeight : OG_IMAGE_HEIGHT,
    twitterCard: "summary_large_image",
    twitterTitle: () => input().title,
    twitterDescription: () => input().description,
    twitterImage: () => input().image ?? OG_IMAGE,
  });
}

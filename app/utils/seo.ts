import type { Locale } from "~~/types/data";

export const SITE_URL = "https://ww2.stevenacz.com";
export const SITE_NAME = "WW2 Film Map";
export const AUTHOR = "Steven Coaila Zaa";
export const OG_IMAGE = `${SITE_URL}/og-image-20260926.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const INDEXABLE_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOINDEX_FOLLOW_ROBOTS = "noindex, follow";
export const TMDB_IMAGE = "https://image.tmdb.org/t/p";

/** Localized path with the trailing slash the static host serves. */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`;
  if (locale === "en") return clean;
  return clean === "/" ? "/es/" : `/es${clean}`;
}

export function absoluteUrl(path: string, locale: Locale): string {
  return `${SITE_URL}${localizedPath(path, locale)}`;
}

export function tmdbImage(
  path: string | undefined,
  size: string
): string | undefined {
  return path ? `${TMDB_IMAGE}/${size}${path}` : undefined;
}

export function jsonLdScript(graph: unknown) {
  return {
    type: "application/ld+json",
    innerHTML: JSON.stringify(graph).replace(/</g, "\\u003c"),
  } as const;
}

export function siteGraph(locale: Locale, description: string) {
  const home = absoluteUrl("/", locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: [
          "World War II Film Map",
          "Mapa de películas de la Segunda Guerra Mundial",
        ],
        description,
        inLanguage: ["en", "es"],
        publisher: { "@id": `${SITE_URL}/#person` },
        creator: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: AUTHOR,
        alternateName: "StevenACZ",
        url: "https://stevenacz.com",
        sameAs: ["https://stevenacz.com", "https://github.com/StevenACZ"],
      },
      {
        "@type": "WebApplication",
        "@id": `${home}#app`,
        name: SITE_NAME,
        url: home,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires WebGL for the 3D globe",
        inLanguage: locale,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
    ],
  };
}

export function breadcrumbGraph(
  locale: Locale,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, locale),
    })),
  };
}

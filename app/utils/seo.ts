export const SITE_URL = "https://ww2.stevenacz.com";
export const SITE_NAME = "WW2 Film Map";
export const SITE_TITLE =
  "WW2 Film Map - Interactive World War II Cinema Experience";
export const DEFAULT_DESCRIPTION =
  "Explore World War II movies through an interactive film map, curated WW2 cinema collection, battle locations, and historical timeline covering key events from 1936 to 1945.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image-20260518.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT =
  "WW2 Film Map showing World War II cinema locations and historical context";
export const INDEXABLE_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOINDEX_FOLLOW_ROBOTS = "noindex, follow";

export const SITE_ROUTES = [
  {
    path: "/",
    name: "Map",
    description: "Interactive map of World War II films and locations.",
  },
  {
    path: "/films",
    name: "Films",
    description: "Curated World War II film collection.",
  },
  {
    path: "/timeline",
    name: "Timeline",
    description: "Interactive World War II timeline with films and events.",
  },
  {
    path: "/about",
    name: "About",
    description: "Project purpose, credits, and source links.",
  },
] as const;

export function canonicalUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  // The static host serves directory-style URLs and 301-redirects the
  // non-slash form, so canonical URLs must carry the trailing slash to
  // match the URL Google actually indexes.
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${normalized}`;
}

export function robotsForQuery(query: Record<string, unknown>): string {
  return Object.keys(query).length > 0
    ? NOINDEX_FOLLOW_ROBOTS
    : INDEXABLE_ROBOTS;
}

export function decodeUrlValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildPageSeo({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
}: {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  imageAlt?: string;
}) {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    ogType: "website",
    ogTitle: ogTitle ?? title,
    ogDescription: ogDescription ?? description,
    ogUrl: url,
    ogSiteName: SITE_NAME,
    ogLocale: "en_US",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: imageAlt,
    ogImageWidth: DEFAULT_OG_IMAGE_WIDTH,
    ogImageHeight: DEFAULT_OG_IMAGE_HEIGHT,
  } as const;
}

export function jsonLdScript(graph: unknown) {
  return {
    type: "application/ld+json",
    innerHTML: JSON.stringify(graph),
  };
}

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: "World War II Film Map",
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
        creator: { "@id": `${SITE_URL}/#person` },
        keywords:
          "WW2 films, World War II movies, WW2 movie map, war film locations, Second World War cinema, historical war movies",
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Steven Coaila Zaa",
        alternateName: "StevenACZ",
        url: "https://stevenacz.com",
        sameAs: ["https://stevenacz.com", "https://github.com/StevenACZ"],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumbs`,
        itemListElement: SITE_ROUTES.map((route, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: route.name,
          item: canonicalUrl(route.path),
        })),
      },
    ],
  };
}

// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const siteUrl = "https://ww2.stevenacz.com";

const titlesDir = fileURLToPath(new URL("./data/titles", import.meta.url));
const titles: { id: string; journey: { place: string }[] }[] = readdirSync(
  titlesDir
)
  .filter((file) => file.endsWith(".json") && !file.startsWith("._"))
  .flatMap(
    (file) =>
      JSON.parse(readFileSync(join(titlesDir, file), "utf8")).titles as {
        id: string;
        journey: { place: string }[];
      }[]
  );

const placeCounts = new Map<string, number>();
for (const title of titles) {
  for (const place of new Set(title.journey.map((stop) => stop.place))) {
    placeCounts.set(place, (placeCounts.get(place) ?? 0) + 1);
  }
}
const places = [...placeCounts].filter(([, n]) => n >= 2).map(([id]) => id);

const pagePaths = [
  "/",
  "/films",
  "/timeline",
  "/about",
  "/places",
  "/era/ww1",
  "/era/interwar",
  "/era/ww2",
  ...titles.map((title) => `/films/${title.id}`),
  ...places.map((place) => `/places/${place}`),
];

const readData = (path: string) =>
  JSON.parse(
    readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")
  );
const eventCount: number = readData("./data/events.json").events.length;
const operationCount: number = ["europe", "world"].reduce(
  (sum, file) =>
    sum + readData(`./data/operations/${file}.json`).operations.length,
  0
);

const localeAreas = [
  "films",
  "title",
  "places",
  "timeline",
  "about",
  "setpieces",
];
const localeFiles = (code: string) => [
  `${code}.json`,
  ...localeAreas.map((area) => `${code}.${area}.json`),
];

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://image.tmdb.org https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com https://image.tmdb.org",
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  // frame-ancestors is ignored in a <meta> CSP; clickjacking is enforced
  // via the X-Frame-Options: DENY header on the host.
  ...(process.env.NODE_ENV === "production"
    ? ["upgrade-insecure-requests"]
    : []),
].join("; ");

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: ["@nuxtjs/i18n", "@nuxtjs/sitemap"],

  css: [
    "@fontsource-variable/inter/wght",
    "@fontsource-variable/big-shoulders-display/wght",
    "@fontsource-variable/big-shoulders-stencil-display/wght",
    "@fontsource-variable/jetbrains-mono/wght",
    "~/assets/scss/main.scss",
  ],

  // Components rendered only on the client (dialogs, the globe) would lose
  // their scoped styles if Nuxt only inlined the styles used during SSR.
  features: {
    inlineStyles: false,
  },

  i18n: {
    baseUrl: siteUrl,
    defaultLocale: "en",
    strategy: "prefix_except_default",
    locales: [
      {
        code: "en",
        language: "en-US",
        name: "English",
        files: localeFiles("en"),
      },
      { code: "es", language: "es", name: "Español", files: localeFiles("es") },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "ww2_locale",
      redirectOn: "root",
    },
  },

  sitemap: {
    xsl: false,
  },

  site: {
    url: siteUrl,
    name: "WW2 Film Map",
    trailingSlash: true,
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      titleTemplate: "%s | WW2 Film Map",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        {
          "http-equiv": "Content-Security-Policy",
          content: contentSecurityPolicy,
        },
        { name: "author", content: "Steven Coaila Zaa" },
        { name: "referrer", content: "strict-origin-when-cross-origin" },
        { name: "theme-color", content: "#0b0c09" },
        { name: "color-scheme", content: "dark" },
        { name: "format-detection", content: "telephone=no" },
        { property: "og:site_name", content: "WW2 Film Map" },
        { name: "application-name", content: "WW2 Film Map" },
        { name: "apple-mobile-web-app-title", content: "WW2 Film Map" },
        { name: "mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "manifest", href: "/manifest.json" },
        {
          rel: "alternate",
          type: "text/markdown",
          title: "AI-readable WW2 Film Map summary",
          href: "/llms.txt",
        },
        { rel: "preconnect", href: "https://image.tmdb.org", crossorigin: "" },
        { rel: "dns-prefetch", href: "https://www.youtube-nocookie.com" },
      ],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: [
        ...pagePaths,
        ...pagePaths.map((path) => (path === "/" ? "/es" : `/es${path}`)),
        "/data/world.json",
        "/data/atlas.json",
        ...titles.flatMap((title) => [
          `/data/titles/en/${title.id}.json`,
          `/data/titles/es/${title.id}.json`,
        ]),
        "/sitemap.xml",
      ],
    },
    compressPublicAssets: true,
    output: {
      dir: "dist",
      publicDir: "dist/public",
    },
  },

  ssr: true,

  runtimeConfig: {
    public: {
      siteUrl,
      titleCount: titles.length,
      placeCount: places.length,
      eventCount,
      operationCount,
    },
  },

  routeRules: {
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  },

  vite: {
    build: {
      cssTarget: ["chrome111", "edge111", "firefox114", "safari16.4"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/tokens" as *;\n',
        },
      },
    },
  },

  experimental: {
    defaults: {
      nuxtLink: { trailingSlash: "append", prefetchOn: { interaction: true } },
    },
    payloadExtraction: true,
    renderJsonPayloads: true,
  },
});

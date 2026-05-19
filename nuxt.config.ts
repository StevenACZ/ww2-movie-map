// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = "https://ww2.stevenacz.com";
const homeUrl = `${siteUrl}/`;
const ogImageUrl = `${siteUrl}/og-image-20260518.png`;

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    "https://upload.wikimedia.org",
    "https://image.tmdb.org",
    "https://m.media-amazon.com",
    "https://timespacewarps.wordpress.com",
    "https://github.com",
    "https://avatars.githubusercontent.com",
    "https://*.basemaps.cartocdn.com",
  ].join(" "),
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src 'self' https://www.youtube-nocookie.com",
  "object-src 'none'",
  "media-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  // frame-ancestors is ignored in a <meta> CSP; clickjacking is enforced
  // via the X-Frame-Options: DENY header in public/.htaccess.
  "upgrade-insecure-requests",
].join("; ");

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: ["@nuxtjs/sitemap"],

  // Load all component CSS via <link> instead of inlining only the styles
  // used during SSR. Components rendered exclusively on the client (modals
  // gated by localStorage, etc.) would otherwise lose their scoped styles
  // because their CSS is never inlined nor linked on the prerendered pages.
  features: {
    inlineStyles: false,
  },

  // Sitemap configuration
  sitemap: {
    xsl: false, // Disable XSL stylesheet to avoid Vue attribute conflicts in browser
  },

  // Site URL for sitemap and SEO. trailingSlash keeps generated sitemap
  // URLs aligned with the directory-style URLs the host serves.
  site: {
    url: siteUrl,
    trailingSlash: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
        dir: "ltr",
      },
      title: "WW2 Film Map - Interactive World War II Cinema Experience",
      titleTemplate: "%s | WW2 Film Map",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          "http-equiv": "Content-Security-Policy",
          content: contentSecurityPolicy,
        },
        {
          name: "description",
          content:
            "Explore World War II movies through an interactive film map, curated WW2 cinema collection, and historical timeline covering events from 1936 to 1945.",
        },
        {
          name: "keywords",
          content:
            "WW2 films, World War II movies, WW2 movie map, World War II film map, war film locations, World War 2 timeline, WW2 cinema, historical war movies, Second World War movies, films about WW2 battles",
        },
        // SEO Meta Tags
        { name: "author", content: "Steven Coaila Zaa" },
        { name: "creator", content: "StevenACZ" },
        { name: "publisher", content: "StevenACZ" },
        { name: "referrer", content: "strict-origin-when-cross-origin" },
        {
          name: "robots",
          content:
            "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
        { name: "googlebot", content: "index, follow" },
        { name: "theme-color", content: "#14191e" },
        { name: "color-scheme", content: "dark" },
        { name: "format-detection", content: "telephone=no" },

        // Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: homeUrl },
        {
          property: "og:title",
          content: "WW2 Film Map - Interactive World War II Cinema Experience",
        },
        {
          property: "og:description",
          content:
            "Explore World War II movies through an interactive map, curated film collection, battle locations, and historical timeline.",
        },
        {
          property: "og:image",
          content: ogImageUrl,
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content:
            "WW2 Film Map showing World War II cinema locations and historical context",
        },
        { property: "og:site_name", content: "WW2 Film Map" },
        { property: "og:locale", content: "en_US" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: homeUrl },
        {
          name: "twitter:title",
          content: "WW2 Film Map - Interactive World War II Cinema Experience",
        },
        {
          name: "twitter:description",
          content:
            "Explore World War II movies through an interactive film map, curated WW2 cinema collection, and timeline.",
        },
        {
          name: "twitter:image",
          content: ogImageUrl,
        },
        {
          name: "twitter:image:alt",
          content:
            "WW2 Film Map showing World War II cinema locations and historical context",
        },

        // Additional SEO
        { name: "application-name", content: "WW2 Film Map" },
        { name: "apple-mobile-web-app-title", content: "WW2 Film Map" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "msapplication-TileColor", content: "#14191e" },
        { name: "msapplication-config", content: "/browserconfig.xml" },
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
        { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
        {
          rel: "alternate",
          type: "text/markdown",
          title: "AI-readable WW2 Film Map summary",
          href: "/llms.txt",
        },
        // Preconnect for performance
        {
          rel: "preconnect",
          href: "https://upload.wikimedia.org",
          crossorigin: "",
        },
        {
          rel: "preconnect",
          href: "https://image.tmdb.org",
          crossorigin: "",
        },
        {
          rel: "preconnect",
          href: "https://m.media-amazon.com",
          crossorigin: "",
        },
        // DNS prefetch for external resources
        { rel: "dns-prefetch", href: "https://static.cloudflareinsights.com" },
        { rel: "dns-prefetch", href: "https://cloudflareinsights.com" },
        { rel: "dns-prefetch", href: "https://www.youtube-nocookie.com" },
        { rel: "dns-prefetch", href: "https://a.basemaps.cartocdn.com" },
      ],
    },
  },

  // Nitro configuration for better performance
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/films", "/timeline", "/about"],
    },
    compressPublicAssets: true,
    // Output to dist folder for easier deployment
    output: {
      dir: "dist",
      publicDir: "dist/public",
    },
  },

  // Enable SSR for better SEO
  ssr: true,

  // Route rules for caching and prerendering
  routeRules: {
    "/": { prerender: true },
    "/films": { prerender: true },
    "/timeline": { prerender: true },
    "/about": { prerender: true },
    // Cache static assets
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/data/**": { headers: { "cache-control": "public, max-age=86400" } },
  },

  // Experimental features for better performance
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
  },
});

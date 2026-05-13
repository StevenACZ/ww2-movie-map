// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = "https://ww2.stevenacz.com";
const ogImageUrl = `${siteUrl}/og-image.jpg`;

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    "https://upload.wikimedia.org",
    "https://image.tmdb.org",
    "https://m.media-amazon.com",
    "https://timespacewarps.files.wordpress.com",
    "https://github.com",
    "https://avatars.githubusercontent.com",
    "https://*.basemaps.cartocdn.com",
  ].join(" "),
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/sitemap"],

  // Sitemap configuration
  sitemap: {
    xsl: false, // Disable XSL stylesheet to avoid Vue attribute conflicts in browser
  },

  // Site URL for sitemap and SEO
  site: {
    url: siteUrl,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
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
            "Explore World War II through cinema with our interactive map and timeline. Discover iconic WW2 films, filming locations, and historical events from 1939-1945.",
        },
        // SEO Meta Tags
        { name: "author", content: "StevenACZ" },
        {
          name: "robots",
          content:
            "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
        { name: "googlebot", content: "index, follow" },
        {
          name: "keywords",
          content:
            "WW2 films, World War 2 movies, WWII cinema, war movies, historical films, Saving Private Ryan, Schindlers List, Dunkirk, war movie map, WW2 timeline, Second World War films",
        },
        { name: "theme-color", content: "#14191e" },
        { name: "color-scheme", content: "dark" },
        { name: "format-detection", content: "telephone=no" },

        // Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: siteUrl },
        {
          property: "og:title",
          content: "WW2 Film Map - Interactive World War II Cinema Experience",
        },
        {
          property: "og:description",
          content:
            "Explore World War II through cinema with our interactive map and timeline. Discover iconic WW2 films, filming locations, and historical events.",
        },
        {
          property: "og:image",
          content: ogImageUrl,
        },
        { property: "og:image:width", content: "4304" },
        { property: "og:image:height", content: "2558" },
        {
          property: "og:image:alt",
          content:
            "WW2 Film Map - Interactive map showing World War II films and their locations",
        },
        { property: "og:site_name", content: "WW2 Film Map" },
        { property: "og:locale", content: "en_US" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: siteUrl },
        {
          name: "twitter:title",
          content: "WW2 Film Map - Interactive World War II Cinema Experience",
        },
        {
          name: "twitter:description",
          content:
            "Explore World War II through cinema with our interactive map and timeline. Discover iconic WW2 films and their filming locations.",
        },
        {
          name: "twitter:image",
          content: ogImageUrl,
        },
        {
          name: "twitter:image:alt",
          content: "WW2 Film Map - Interactive map showing World War II films",
        },
        { name: "twitter:creator", content: "@StevenACZ" },

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
        { rel: "canonical", href: siteUrl },
        // Preconnect for performance
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        // DNS prefetch for external resources
        { rel: "dns-prefetch", href: "https://upload.wikimedia.org" },
      ],
      script: [
        // Structured Data - WebSite Schema
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                name: "WW2 Film Map",
                alternateName: "World War 2 Film Map",
                url: siteUrl,
                description:
                  "Interactive map and timeline exploring World War II through cinema. Discover iconic WW2 films, filming locations, and historical events from 1939-1945.",
                inLanguage: "en",
                author: {
                  "@id": `${siteUrl}/#person`,
                },
                publisher: {
                  "@id": `${siteUrl}/#person`,
                },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${siteUrl}/films?search={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Person",
                "@id": `${siteUrl}/#person`,
                name: "StevenACZ",
                url: "https://stevenacz.com",
                sameAs: [
                  "https://stevenacz.com",
                  "https://github.com/StevenACZ",
                ],
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${siteUrl}/#breadcrumbs`,
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Map",
                    item: siteUrl,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Films",
                    item: `${siteUrl}/films`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Timeline",
                    item: `${siteUrl}/timeline`,
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: "About",
                    item: `${siteUrl}/about`,
                  },
                ],
              },
              {
                "@type": "ItemList",
                "@id": `${siteUrl}/films#item-list`,
                name: "World War II Films Collection",
                description:
                  "Curated collection of the most impactful films depicting World War II",
                url: `${siteUrl}/films`,
                numberOfItems: 30,
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    item: {
                      "@type": "Movie",
                      name: "Saving Private Ryan",
                      datePublished: "1998",
                      director: { "@type": "Person", name: "Steven Spielberg" },
                    },
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    item: {
                      "@type": "Movie",
                      name: "Schindler's List",
                      datePublished: "1993",
                      director: { "@type": "Person", name: "Steven Spielberg" },
                    },
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    item: {
                      "@type": "Movie",
                      name: "Dunkirk",
                      datePublished: "2017",
                      director: {
                        "@type": "Person",
                        name: "Christopher Nolan",
                      },
                    },
                  },
                ],
              },
            ],
          }),
        },
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

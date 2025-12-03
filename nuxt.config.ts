// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/sitemap"],

  // Site URL for sitemap and SEO
  site: {
    url: "https://ww2.stevenacz.com",
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
        { property: "og:url", content: "https://ww2.stevenacz.com" },
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
          content: "https://ww2.stevenacz.com/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content:
            "WW2 Film Map - Interactive map showing World War II films and their locations",
        },
        { property: "og:site_name", content: "WW2 Film Map" },
        { property: "og:locale", content: "en_US" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: "https://ww2.stevenacz.com" },
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
          content: "https://ww2.stevenacz.com/og-image.png",
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
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "canonical", href: "https://ww2.stevenacz.com" },
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
            "@type": "WebSite",
            name: "WW2 Film Map",
            alternateName: "World War 2 Film Map",
            url: "https://ww2.stevenacz.com",
            description:
              "Interactive map and timeline exploring World War II through cinema. Discover iconic WW2 films, filming locations, and historical events from 1939-1945.",
            inLanguage: "en",
            author: {
              "@type": "Person",
              name: "StevenACZ",
              url: "https://github.com/StevenACZ",
            },
            publisher: {
              "@type": "Person",
              name: "StevenACZ",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://ww2.stevenacz.com/films?search={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        },
        // Structured Data - ItemList Schema for Films
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "World War II Films Collection",
            description:
              "Curated collection of the most impactful films depicting World War II",
            url: "https://ww2.stevenacz.com/films",
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
                  director: { "@type": "Person", name: "Christopher Nolan" },
                },
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

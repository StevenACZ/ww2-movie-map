# WW2 Movie Map - Development Guide

## Scope

This repository contains the public Nuxt application for WW2 Movie Map. Keep changes production-safe, historically focused, accessible, and free of private infrastructure details.

## Security and Privacy

- Never commit secrets, tokens, private keys, internal IPs, environment dumps, local machine paths, or private deployment notes.
- Keep repository documentation public-safe.
- Do not add external scripts, embeds, fonts, map providers, or analytics without updating the CSP and documenting the reason.
- Use only public HTTPS URLs for film, map, trailer, and metadata references.

## Project Overview

| Field           | Value                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Name            | WW2 Movie Map                                                          |
| Production URL  | `https://ww2.stevenacz.com`                                            |
| Repository      | `https://github.com/StevenACZ/ww2-movie-map`                           |
| Framework       | Nuxt 4.x                                                               |
| Purpose         | Interactive map, film collection, and timeline for World War II cinema |
| Package manager | Bun preferred; npm scripts are also available                          |

## Tech Stack

- Nuxt 4 with Vue 3
- TypeScript
- SCSS with shared variables and mixins
- Leaflet for the interactive map
- `@nuxtjs/sitemap` for sitemap generation

## Project Structure

```text
ww2-movie-map/
├── app/
│   ├── app.vue
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── WW2Map.vue
│   │   ├── Timeline.vue
│   │   ├── FilmModal.vue
│   │   ├── TrailerModal.vue
│   │   ├── timeline/
│   │   ├── films/
│   │   └── map/
│   ├── composables/
│   │   ├── useTimeline.ts
│   │   ├── useTimelinePositioning.ts
│   │   ├── useFilmsFilter.ts
│   │   └── useLeafletMap.ts
│   └── pages/
│       ├── index.vue
│       ├── films.vue
│       ├── timeline.vue
│       └── about.vue
├── data/
│   ├── films.json
│   └── historical-events.json
├── types/
│   ├── index.ts
│   └── timeline.ts
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── site.webmanifest
│   ├── og-image.jpg
│   └── robots.txt
├── nuxt.config.ts
└── package.json
```

## Commands

```bash
bun install
bun run dev
bun run format
bun run format:check
bun run typecheck
bun run build
bun run generate
bun run preview
```

Do not commit generated `.output/`, `.nuxt/`, or `dist/` output.

## Key Features

- Home page with Leaflet map and film markers.
- Film collection page with search and sorting.
- Historical timeline page with events and films across 1936-1945.
- About page with project context and portfolio backlink.
- Trailer modal that embeds YouTube on desktop and opens YouTube externally on mobile.

## Data Model

Film data lives in `data/films.json` and should match the shared TypeScript types in `types/index.ts`.

```ts
interface Film {
  id: string;
  title: string;
  year: number;
  eventYears: { start: number; end: number };
  eventDate?: string;
  imdbRating: number;
  country: string;
  poster: string;
  synopsis: string;
  locations: Location[];
  wikipediaUrl?: string;
  imdbUrl?: string;
  trailerUrl?: string;
}
```

```ts
interface Location {
  name: string;
  coordinates: [number, number];
  type: "city" | "region" | "country";
  isPrimary: boolean;
}
```

## SEO and Structured Data

- `nuxt.config.ts` is the source of truth for global metadata, site URL, CSP, manifest links, and the shared JSON-LD graph.
- Page components use `useSeoMeta()` and `useHead()` for page-specific title, description, canonical URL, and Open Graph details.
- Keep structured data consolidated and non-conflicting: `WebSite`, `Person`, `BreadcrumbList`, and `ItemList`.
- Use `public/og-image.jpg` for social previews unless a real replacement asset is committed.
- Keep `public/manifest.json` and `public/site.webmanifest` aligned while both are published.
- Keep `robots.txt` and generated sitemap URLs aligned with the production domain.

## Styling Guidelines

- Shared SCSS variables live in `app/assets/scss/_variables.scss`.
- Shared responsive helpers live in `app/assets/scss/_mixins.scss`.
- Keep component styles scoped when possible.
- Aim to keep components focused. Extract subcomponents when a file becomes difficult to scan.

## Verification

Before marking work complete, run:

```bash
bun run format:check
bun run typecheck
bun run build
bun run generate
```

For SEO work, inspect generated output for:

- `application/ld+json`
- description and Open Graph metadata
- CSP meta tag
- valid `manifest.json`
- valid sitemap XML
- real social preview image

## Git Safety

- Use conventional commits.
- Ask before staging, committing, pushing, creating PRs, or merging unless the user has already granted explicit permission for the current task.
- Do not use destructive git operations unless explicitly requested.

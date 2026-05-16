# WW2 Movie Map Guide

## Scope

Public Nuxt app for WW2 Movie Map. Keep it production-safe, historically focused, accessible, and free of private infrastructure details.

## Security and Privacy

- Never commit secrets, tokens, private keys, internal IPs, environment dumps, local machine paths, or private deployment notes.
- Keep `AGENTS.md`, `CLAUDE.md`, `README.md`, and `CHANGELOG.md` public-safe.
- Keep local/private notes in ignored `docs/`.
- Do not add external scripts, embeds, fonts, map providers, or analytics without updating the CSP and documenting the reason.
- Use only public HTTPS URLs for film, map, trailer, and metadata references.

## Project Overview

| Field   | Value                                                                  |
| ------- | ---------------------------------------------------------------------- |
| URL     | `https://ww2.stevenacz.com`                                            |
| Repo    | `https://github.com/StevenACZ/ww2-movie-map`                           |
| Stack   | Nuxt 4, Vue 3, TypeScript, SCSS, Leaflet, Bun, `@nuxtjs/sitemap`       |
| Purpose | Interactive map, film collection, and timeline for World War II cinema |

## Structure

- `app/pages/`: home, films, timeline, and about pages.
- `app/components/`: map, film, trailer, timeline, and shared UI.
- `app/composables/`: filtering, Leaflet map, and timeline logic.
- `app/utils/seo.ts`: canonical URL, page SEO, and JSON-LD helpers.
- `data/films.json`: canonical film data.
- `data/historical-events.json`: canonical timeline events.
- `types/`: shared TypeScript types.
- `public/`: icons, manifest files, OG image, robots, and security policy contact.
- `nuxt.config.ts`: CSP, sitemap, app head defaults, and build/runtime configuration.

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

Use Bun because this repo tracks `bun.lock`. Do not commit generated `.output/`, `.nuxt/`, `dist/`, local docs, or env files.

## Key Features

- Home page with Leaflet map and film markers.
- Film collection page with search and sorting.
- Historical timeline page with events and films across 1936-1945.
- About page with project context and portfolio backlink.
- Trailer modal that embeds YouTube on desktop and opens YouTube externally on mobile.

## Data Model

Film data lives in `data/films.json` and must match `types/index.ts`. Locations use `[number, number]` coordinates and public HTTPS URLs only.

## SEO and Structured Data

- `app/utils/seo.ts` is the source of truth for site URL, canonical URL generation, page SEO defaults, and JSON-LD helpers.
- `nuxt.config.ts` owns CSP, sitemap configuration, manifest links, app defaults, and security headers.
- Page components use `useSeoMeta()` and `useHead()` for page-specific title, description, canonical URL, Open Graph details, and page JSON-LD.
- Keep structured data truthful and non-conflicting. Do not add fake ratings, reviews, awards, availability, event attendance, or claims that are not present in the public data.
- Use `public/og-image.jpg` for social previews unless a real replacement asset is committed.
- Keep `public/manifest.json` and `public/site.webmanifest` aligned while both are published.
- Keep `robots.txt` and generated sitemap URLs aligned with the production domain.

## External Content Rules

- Use `https://www.youtube-nocookie.com` for embedded trailers.
- Any new external image, map, media, or API host must be added deliberately to the CSP in `nuxt.config.ts`.
- Any URL rendered into HTML/CSS must come from public HTTPS data and should be validated or allowlisted when it can reach attributes, embeds, or inline styles.

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
bun audit
```

For SEO work, inspect generated output for:

- `application/ld+json`
- canonical URL
- description and Open Graph metadata
- CSP meta tag
- valid `manifest.json`
- valid sitemap XML
- real social preview image

For release work, also verify GitHub Actions after pushing to `main` and check the production URL after the deploy finishes.

## Git Safety

- Use conventional commits.
- Do not use destructive git operations unless explicitly requested.
- Do not mention AI tools or automated authorship in commits, PRs, changelogs, or release notes.

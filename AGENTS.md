# WW2 Film Map Guide

## Scope

Public bilingual Nuxt site for WW2 Film Map: a 3D globe, film and series collection, places, and timeline covering WW1, the interwar years, and WW2. Keep it production-safe, historically accurate, accessible, and free of private infrastructure details.

## Security and Privacy

- Never commit secrets, tokens, private keys, internal IPs, environment dumps, local machine paths, or private deployment notes.
- Keep `AGENTS.md`, `README.md`, and `CHANGELOG.md` public-safe.
- Keep local/private notes in ignored `docs/`.
- Do not add external scripts, embeds, fonts, map or tile providers, or analytics without updating the CSP and documenting the reason.
- Use only public HTTPS URLs for film, trailer, image, and metadata references.

## Assistant Surface

- `AGENTS.md` is the source of truth for repo guidance.
- Claude Code 2.1.277+ reads `AGENTS.md` directly; no project bridge is needed.
- Do not add repo-local `.agents/skills/` or `.claude/skills/` unless a reusable workflow genuinely needs one. If skills are added later, `.agents/skills/` is canonical and `.claude/skills/*` must be symlinks to it.

## Project Overview

| Field   | Value                                                                                      |
| ------- | ------------------------------------------------------------------------------------------ |
| URL     | `https://ww2.stevenacz.com` (EN at `/`, ES at `/es/`)                                      |
| Repo    | `https://github.com/StevenACZ/ww2-movie-map`                                               |
| Stack   | Nuxt 4 SSG, Vue 3, TypeScript, SCSS, three.js, topojson-client, Lenis, Bun 1.4.1           |
| Modules | `@nuxtjs/i18n` v10 (`prefix_except_default`), `@nuxtjs/sitemap`, Fontsource variable fonts |
| Output  | `nuxt generate` → `dist/public`, every route prerendered with `crawlLinks` + `failOnError` |

## Structure

- `app/globe/`: own three.js globe engine (countries, historical borders, front lines, units, overlay, palette). No map tiles, no map API keys.
- `app/pages/`: `/` (globe with 1914–1945 timeline), `/films`, `/films/[id]`, `/era/{ww1,interwar,ww2}`, `/places`, `/places/[id]`, `/timeline`, `/about`.
- `app/components/{map,title,collection,place,timeline,about}/`: page areas; shared `Icon.vue`, `TitlePoster.vue`, `TitleTile.vue`, `AppHeader`, `AppFooter`, `AppLogo`.
- `app/composables/`: `usePageSeo`, `useIndexData`, `useSound`, `useLenis`.
- `app/utils/seo.ts`: site URL, localized paths, TMDB image URLs, JSON-LD helpers.
- `app/assets/scss/`: `main.scss` (CSS variables, global classes) and `_tokens.scss` (auto-injected breakpoints, easings, mixins).
- `server/utils/dataset.ts`, `server/api/**`, `server/routes/data/**`: build-time dataset and prerendered JSON payloads.
- `shared/utils/time.ts`: date helpers and era ranges. `types/data.ts` (source schema), `types/view.ts` (payloads).
- `i18n/locales/`: base `en.json`/`es.json` plus one file per area (`en.<area>.json`, `es.<area>.json`).
- `scripts/`: data validator, Wikipedia lookup, border builder, TMDB sync.

## Data

- `data/titles/*.json`: 222 films and series (WW1, interwar, WW2), bilingual text, journeys with stops.
- `data/events.json`: historical events. `data/places.json`: place descriptions.
- `data/operations/{europe,world}.json`: animated units and front-line snapshots.
- `data/geo/countries.json` and `public/geo/borders-{1914,1920,1930,1938,1945}.json`: country metadata and historical borders.
- `data/tmdb.json` and `public/data/watch/{id}.json`: written only by `scripts/tmdb/sync.ts`; never edit by hand.

Invariants:

- Title `id` is kebab-case `slug-year` and the year matches the release year.
- Every title journey has exactly one `primary` stop.
- `bun scripts/data/validate.ts` must pass (errors fail; warnings are reviewed).
- Borders derive from historical-basemaps (GPL-3.0). Keep `public/geo/LICENSE-historical-basemaps.txt` and the About credit; rebuild only with `scripts/geo/build-borders.ts`.
- Any page showing TMDB data keeps the notice "This product uses the TMDB API but is not endorsed or certified by TMDB." and credits JustWatch for watch providers.
- A place page exists only for places referenced by two or more titles; links to other places break static generation.

## Commands

```bash
bun install
bun run dev
bun run format
bun run verify
bun scripts/data/validate.ts
bun scripts/geo/build-borders.ts --check
bun scripts/tmdb/sync.ts
bun scripts/data/wiki-lookup.ts "Stalingrad (1993 film)"
```

- `bun run verify` runs format check, Nuxt typecheck, build, static generation, and `bun audit`.
- TMDB sync reads `TMDB_API_KEY` or `TMDB_READ_TOKEN`; supports `--only <id,id>` and `--fixture <dir>`.
- Never run `nuxt build`, `generate`, `typecheck`, or `prepare` while `nuxt dev` runs on the same checkout; they share `.nuxt`. Typecheck against a running dev server with `bunx vue-tsc -b --noEmit`.
- Use Bun because this repo tracks `bun.lock`. Do not commit `.output/`, `.nuxt/`, `dist/`, local docs, or env files.

## SEO and Structured Data

- Every page calls `usePageSeo()` with the locale-agnostic path; it owns title, description, canonical, hreflang, Open Graph, robots, and JSON-LD.
- `nuxt.config.ts` owns CSP, i18n, sitemap, prerender routes, and head defaults.
- Keep structured data truthful. No fake ratings, reviews, awards, availability, or claims absent from the data.
- Keep `public/manifest.json` and `public/site.webmanifest` aligned, and `robots.txt` declaring the production sitemap.
- Update `public/llms.txt` when routes or coverage change.

## External Content Rules

- Use `https://www.youtube-nocookie.com` for embedded trailers.
- Any new external image, media, or API host must be added deliberately to the CSP in `nuxt.config.ts`.
- Any URL rendered into HTML/CSS must come from public HTTPS data and be validated or allowlisted when it can reach attributes, embeds, or inline styles.

## UI Guidelines

- Icons are inline SVG through `Icon.vue`. Do not use emoji anywhere in the UI.
- Content must be visible and usable without JS and under `prefers-reduced-motion: reduce`; wrap motion in the `motion` mixin.
- Scroll-driven animations live inside `@supports (animation-timeline: view())` with longhand properties.
- Mobile first: no horizontal overflow at 390px; designed at 1440px.
- Reserve image space with `aspect-ratio`; lazy-load everything except the LCP image.
- Component styles are `<style lang="scss" scoped>`; reuse tokens and global classes instead of new ones.
- Spanish copy is neutral Latin American Spanish with correct accents.
- Sound plays only on deliberate user actions, never on scroll or hover.
- Never a left accent border or vertical stripe on cards, callouts, toasts, list items or quotes (`border-left`, `inset Npx 0 0` shadows, left `::before` bars); use a full hairline border, a tint or a top rule.
- Nothing over the globe uses `backdrop-filter` (use the `panel` mixin, not `glass`); the globe renders on demand and caps DPR at 1.5.

## Verification

Before any commit or push, run:

```bash
bun run format
bun scripts/data/validate.ts
bun scripts/geo/build-borders.ts --check
bun run verify
```

For SEO work, inspect the generated `dist/public` output for JSON-LD, canonical and hreflang links, descriptions and Open Graph tags, the CSP meta tag, valid manifests, and a valid `sitemap_index.xml` listing both locale sitemaps (the module turns `/sitemap.xml` into a redirect page).

## Deploy

- Push to `main` triggers GitHub Actions on the self-hosted runner: install, optional TMDB refresh, checks, `generate`, then rsync of `dist/public` to production.
- A daily schedule rebuilds with fresh TMDB data; the refresh step runs only when the `TMDB_API_KEY` secret exists and never blocks the deploy.
- The workflow deploys only when its SSH configuration is present and validates the live site, `robots.txt`, and sitemap after rsync.
- After pushing, verify the Actions run and the production URL.

## Git Safety

- Use conventional commits.
- Do not use destructive git operations unless explicitly requested.
- Do not mention AI tools or automated authorship in commits, PRs, changelogs, or release notes.

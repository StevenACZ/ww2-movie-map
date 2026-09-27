# Changelog

All notable changes to this project will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2026-09-26]

### Added

- Added an own three.js 3D globe with historical borders for 1914, 1920, 1930, 1938, and 1945.
- Added a 1914–1945 timeline that colors countries by side or by war status and animates tanks, ships, planes, and front lines.
- Added 222 films and series across WW1, the interwar years, and WW2, each with a journey of story locations.
- Added 105 historical events on the globe and on the timeline page.
- Added era pages for WW1, the interwar years, and WW2, place pages, and a places index.
- Added a Spanish version of the whole site under `/es/` with hreflang alternates.
- Added TMDB posters, ratings, trailers, and JustWatch watch providers through a sync script and a daily scheduled refresh in the deploy workflow.
- Added data validation, Wikipedia lookup, and historical border build scripts.
- Added special events: 3D reconstructions of Messines, Dunkirk, Pearl Harbor, Midway, D-Day, Hiroshima, and Nagasaki, opened from a list on the map.
- Added a situation report that shows the month, the current event, and the operations in progress while the timeline plays.
- Added a 2D atlas of places with region presets, pan, and zoom on the places index.
- Added archival images with credits and licenses to the timeline events.
- Added 15 dated front lines with a consistency check.
- Added self-hosted posters for 217 titles, sourced from Wikipedia, letterboxed when the original is not a portrait poster, with small variants for globe markers.
- Added mini-maps and poster previews to place cards, and search by country, title, and alternative names on the places index.

### Changed

- Redesigned the site as a dark war-room interface with stencil and condensed typography, film grain, and scroll-driven motion that respects reduced-motion preferences.
- Rebuilt the film collection, title pages, timeline, and about page on a new bilingual data model.
- Updated the README, agent guide, `llms.txt`, robots, manifests, and tile color for the new site.
- Made units move at a calmer pace: planes circle and fly sorties, infantry marches, and density stays capped late in the war.
- Improved globe performance: idle animation runs at 30 fps, rendering stops offscreen, overlays update only on camera moves, and resolution adapts to slow devices.
- Made the mouse wheel zoom toward the cursor.
- Redesigned the era cards on the films index as photo cards.
- Merged overlapping markers on the places atlas until zoomed in, anchored zoom buttons on the places with titles, and kept the atlas view when returning to it.
- Made map panels opaque and kept the date bar clear of the legend.
- Moved special events into the timeline dock as a highlighted launcher that features the event nearest to the current date, with its list opening above the dock and a 3D chip on the globe for events that have a reconstruction.
- Extended the map sidebar and the title panel to the full height of the map, with the timeline dock between them.
- Made globe posters grow as the camera zooms in, loading the larger image up close.
- Replaced the synthesized sounds with real recordings: a WW1 army whistle, interwar radio static, an M1 Garand shot with its clip ping, a typewriter key, a 16 mm projector, and explosions and bomber engines in the special events.
- Made special events play over a neutral terrain globe, with an arcing camera flight, a cinematic vignette, and a less mechanical camera shake.

### Removed

- Removed the Leaflet map and CARTO tiles, which required an API key and stopped rendering.

### Fixed

- Fixed hairline seams across country fills on the globe.
- Fixed a flash of English and a hydration mismatch for returning Spanish visitors on the home page.

## [Unreleased]

### Added

- Added curated historical context paragraphs to the Greyhound, Stalingrad, The Pianist, Patton, and Schindler's List film pages.
- Added a 1200x630 social preview image for richer search and sharing cards.

### Changed

- Standardized frontend repository tooling, assistant guidance, formatting configuration, and verification scripts.
- Improved page-level SEO metadata, canonical URLs, structured data, robots, manifests, and PWA icons.
- Updated README and agent maintenance guidance for the current Nuxt/Vue static deployment flow.
- Updated Nuxt, Vue, `@nuxtjs/sitemap`, Sass, and related build dependencies to patched current releases.
- Reworked the changelog into Keep a Changelog 1.1.0 style with typed change categories.
- Kept `AGENTS.md` as the public maintenance guide and `CLAUDE.md` as a pointer.
- Ignored local `docs/` notes.

### Fixed

- Film markers expose their titles to keyboard and assistive-technology users.

- Made welcome, trailer, and mobile film dialogs keyboard-accessible with named dialogs, managed focus, and Escape dismissal.
- Kept map WASD navigation clear of browser shortcuts and dialogs, stopped movement on focus loss, and removed idle animation frames.
- Removed the README license claim and link because no license file is published in the repository.

- Stabilized timeline date rendering across server and browser time zones to avoid hydration mismatches.
- Hardened the deploy workflow so a superseded run cannot leave the live docroot half-synced, post-deploy validation cannot pass against another site, and a hung run cannot hold the concurrency group.

### Security

- Hardened external content handling for trailers, map marker images, CSP, `target="_blank"` links, and audit coverage.
- Removed unused direct dependencies and pinned the patched `devalue` release through package overrides.
- Pinned patched transitive build and development dependencies for the current Nuxt/Vite audit advisories.
- Tightened the deployment workflow so available quality checks fail the deploy when they fail.

## [2026-05-28]

### Added

- Added a `prefers-reduced-motion` guard and subtle film-card lift micro-interaction.

### Changed

- Replaced all emoji iconography with Lucide-style inline SVG icon components under `app/components/icons/`.
- Flattened the beige/gold gradients to a solid-color identity with new surface tokens and softened panel, map-control, and page surfaces.
- Recompressed PWA icons and the OG image with oxipng and lazy-loaded film poster images in modals and panels.
- Gated the deploy on SSH config, added a post-deploy live-site validation, and bumped CI to Node 22.

## [2026-05-13]

### Added

- Added SEO/security hardening baseline with CSP, JSON-LD consistency, and manifest alias.

### Changed

- Unified social image references to the real public OG asset.

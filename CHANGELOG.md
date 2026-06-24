# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Added a 1200x630 social preview image for richer search and sharing cards.

### Changed

- Improved page-level SEO metadata, canonical URLs, structured data, robots, manifests, and PWA icons.
- Updated README and agent maintenance guidance for the current Nuxt/Vue static deployment flow.
- Updated Nuxt, Vue, `@nuxtjs/sitemap`, Sass, and related build dependencies to patched current releases.
- Reworked the changelog into Keep a Changelog 1.1.0 style with typed change categories.
- Kept `AGENTS.md` as the public maintenance guide and `CLAUDE.md` as a pointer.
- Ignored local `docs/` notes.

### Fixed

- Stabilized timeline date rendering across server and browser time zones to avoid hydration mismatches.

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

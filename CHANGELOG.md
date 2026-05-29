# Changelog

## 2026-05-28

- Replaced all emoji iconography with Lucide-style inline SVG icon components under `app/components/icons/`.
- Flattened the beige/gold gradients to a solid-color identity with new surface tokens and softened panel, map-control, and page surfaces.
- Added a `prefers-reduced-motion` guard and subtle film-card lift micro-interaction.
- Recompressed PWA icons and the OG image with oxipng and lazy-loaded film poster images in modals and panels.
- Gated the deploy on SSH config, added a post-deploy live-site validation, and bumped CI to Node 22.

## Unreleased

- Improved page-level SEO metadata, canonical URLs, structured data, robots, manifests, and PWA icons.
- Added a 1200x630 social preview image for richer search and sharing cards.
- Hardened external content handling for trailers, map marker images, CSP, `target="_blank"` links, and audit coverage.
- Removed unused direct dependencies and pinned the patched `devalue` release through package overrides.
- Tightened the deployment workflow so available quality checks fail the deploy when they fail.
- Updated README and agent maintenance guidance for the current Nuxt/Vue static deployment flow.
- Updated Nuxt/Vue/Sass dependencies to the current 2026 line.
- Kept `AGENTS.md` as the public maintenance guide and `CLAUDE.md` as a pointer.
- Ignored local `docs/` notes.

## 2026-05-13

- Added SEO/security hardening baseline with CSP, JSON-LD consistency, and manifest alias.
- Unified social image references to the real public OG asset.

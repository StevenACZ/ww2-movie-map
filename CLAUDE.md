# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WW2 Map Films** - An interactive web application displaying World War II films on a 2D map with a videogame aesthetic (Hearts of Iron 4 / Victoria 2 style). Users explore films geographically, filter by timeline (1936-1945), and learn about WW2 cinema in an immersive way.

**Tech Stack**: Nuxt 4 + TypeScript + Leaflet.js + CartoDB Dark Matter tiles

## Development Commands

### Installation
```bash
pnpm install
```

### Development Server
```bash
pnpm dev              # Starts dev server at http://localhost:3000
```

### Production Build
```bash
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm generate         # Generate static site (SSG)
```

### Type Checking
```bash
pnpm exec nuxi typecheck
```

## Architecture

### Map Implementation (Leaflet.js)

The project recently **migrated from MapLibre GL JS to Leaflet.js**. Key architectural points:

**Component**: `app/components/WW2Map.vue`
- Uses Leaflet.js for 2D tile-based mapping
- CartoDB Dark Matter basemap provides the dark WW2 aesthetic
- SSR-compatible via dynamic imports (`import('leaflet')` in `onMounted`)
- Leaflet CSS imported dynamically for SSR safety

**WASD Keyboard Navigation**:
- Custom implementation using `requestAnimationFrame` loop
- Tracks keypresses in a state object (`keysPressed`)
- Pans map at `PAN_SPEED = 10` pixels per frame (60fps)
- Leaflet's default keyboard controls disabled (`keyboard: false`)
- Keys: W (north), S (south), A (west), D (east)

**Map Configuration**:
```typescript
Center: [50, 20]  // Europe center (lat, lng)
Zoom: 4           // Shows Western and Eastern Europe
Tile Layer: CartoDB Dark Matter (https://basemaps.cartocdn.com/dark_all/)
```

### Nuxt 4 Architecture

**File Structure**:
```
app/
├── app.vue              # Root layout with WW2Map component
└── components/
    └── WW2Map.vue       # Main map component
```

**SSR Considerations**:
- Leaflet must be imported dynamically in `onMounted` (browser-only)
- Check `typeof window === 'undefined'` for SSR safety
- Leaflet CSS imported dynamically to avoid SSR errors

**Styling**:
- Global reset in `app.vue` (margin: 0, padding: 0, box-sizing: border-box)
- Full viewport map: `html, body, #__nuxt { height: 100%; overflow: hidden }`
- Map container fills entire viewport (100vw × 100vh)

### TypeScript

- Strict TypeScript usage throughout
- Nuxt auto-imports for Vue 3 Composition API
- Type definitions extend from Nuxt-generated tsconfig references
- Use `@types/leaflet` for Leaflet type support

## Important Patterns

### Adding Map Markers (Future)
When adding film markers:
- Import markers in `onMounted` after Leaflet initialization
- Use `L.marker([lat, lng]).addTo(map.value)`
- Store marker references for cleanup in `onUnmounted`

### Cleanup Pattern
The WW2Map component demonstrates proper cleanup:
```typescript
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (map.value) map.value.remove()
})
```

### Vue 3 Composition API
- Always use `<script setup lang="ts">`
- Use `ref()` for reactive map instance: `const map = ref<any>(null)`
- Lifecycle hooks: `onMounted`, `onUnmounted`

## Key Dependencies

- `nuxt: ^4.2.1` - Latest Nuxt framework
- `vue: ^3.5.25` - Vue 3
- `leaflet: ^1.9.4` - 2D mapping library
- `@types/leaflet: ^1.9.21` - TypeScript definitions

## Development Notes

### Why Leaflet.js?
- Free and open-source (no API keys required)
- Excellent 2D tile performance
- Lightweight and simple API
- Perfect for marker-heavy applications
- Better suited for this use case than 3D WebGL (MapLibre)

### Why CartoDB Dark Matter?
- Free CDN-hosted basemap
- Dark grey aesthetic matches WW2 theme
- No API key required
- Optimized for data visualization

### Free & Open Philosophy
This project prioritizes free, open-source tools without API key requirements.

## Common Tasks

### Testing Map Changes
1. Run `pnpm dev`
2. Open http://localhost:3000
3. Test mouse (drag, zoom) and keyboard (WASD) navigation
4. Check browser console for errors

### Adding New Vue Components
```bash
# Create in app/components/
touch app/components/ComponentName.vue
```
Components are auto-imported by Nuxt.

### Adding New Pages
```bash
# Nuxt uses file-based routing
touch app/pages/page-name.vue
```

## Project Context (from .claude/ docs)

**Note**: The `.claude/` directory contains detailed project documentation but is gitignored. Key points:

- **Current Phase**: Phase 1 MVP (Setup y Mapa Base) - ✓ Completed
- **Next Phase**: Phase 2 - Film markers and data
- **Language**: Bilingual project (EN/ES)
- **Philosophy**: Built "con mucho cariño" (with love and care)

Refer to `.claude/PROJECT_OVERVIEW.md`, `.claude/PHASES.md`, `.claude/USER_STORIES.md`, and `.claude/DATA_MODEL.md` for comprehensive context.

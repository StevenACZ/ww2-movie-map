# WW2 Map Films - Technology Stack

## Core Framework

### Nuxt 4
**Version**: 4.2.1
**Purpose**: Full-stack Vue.js framework

**Why Nuxt 4**:
- Latest stable version with long-term support until 2026
- Server-side rendering (SSR) capabilities
- File-based routing system
- Auto-imports for components and composables
- Excellent developer experience
- Built-in TypeScript support
- Strong ecosystem and community

### Vue 3
**Version**: 3.5.25
**Purpose**: Reactive UI framework

**Why Vue 3**:
- Composition API for better code organization
- Improved performance over Vue 2
- Better TypeScript integration
- Native to Nuxt 4
- Reactive state management built-in

### TypeScript
**Version**: Latest
**Purpose**: Type-safe development

**Why TypeScript**:
- Catch errors at compile time
- Better IDE support and autocomplete
- Improved code maintainability
- Self-documenting code through types
- Industry standard for large projects

---

## Map Library

### MapLibre GL JS
**Version**: 5.13.0
**Purpose**: WebGL-based map rendering

**Why MapLibre GL JS**:
- Free and open-source (fork of Mapbox GL JS)
- No API keys required
- High performance WebGL rendering
- Vector tile support
- Highly customizable styles
- Active development and maintenance
- No usage limits or costs

### @indoorequal/vue-maplibre-gl
**Version**: 8.4.2
**Purpose**: Vue 3 wrapper for MapLibre GL JS

**Why This Wrapper**:
- Built specifically for Vue 3 Composition API
- Full TypeScript support out of the box
- Component-based architecture (MglMap, MglNavigationControl)
- Reactive map properties
- Active maintenance
- Works seamlessly with Nuxt 4
- Better than nuxt-maplibre (more docs, better Vue 3 integration)

### OpenMapTiles - Dark Matter Style
**URL**: `https://openmaptiles.github.io/dark-matter-gl-style/style-cdn.json`
**Purpose**: Map visual style

**Why Dark Matter**:
- Free CDN-hosted style
- No API key required
- Dark grey aesthetic perfect for WW2 theme
- Optimized for data visualization
- Clean, minimalist design
- Works perfectly with MapLibre GL JS

---

## Future Dependencies (Not in MVP)

### Nuxt UI v4
**Purpose**: Component library

**Why Nuxt UI v4**:
- 110+ pre-built components
- Native i18n support
- Dark mode built-in
- TailwindCSS v4 integration
- Perfect for modals, sliders, buttons
- Highly customizable

**When**: Phase 2 (Películas y Marcadores)

### TailwindCSS v4
**Purpose**: Utility-first CSS framework

**Why TailwindCSS v4**:
- Rapid styling development
- Highly customizable
- Integrated with Nuxt UI
- Small production bundle
- Industry standard

**When**: Phase 2 (Películas y Marcadores)

### @nuxtjs/i18n
**Purpose**: Internationalization

**Why @nuxtjs/i18n**:
- Official Nuxt module
- Lazy-loading of translations
- Auto-detection of user language
- SEO-friendly localized routes
- Vue I18n under the hood

**When**: Phase 3 (Timeline e i18n)

---

## Data Sources

### Natural Earth Data
**URL**: https://www.naturalearthdata.com/
**Purpose**: GeoJSON for country borders

**Why Natural Earth**:
- Free public domain data
- Different resolution levels
- Well-maintained
- Widely used in GIS applications
- No attribution required

**When**: Phase 2 (for region highlighting)

### historical-basemaps
**URL**: https://github.com/aourednik/historical-basemaps
**Purpose**: Historical WW2-era borders

**Why This Resource**:
- GeoJSON format
- Historically accurate
- Free to use
- Shows border changes during WW2

**When**: Future enhancement (Phase 6)

### Local JSON Files
**Purpose**: Film data storage

**Why Local JSON**:
- No external dependencies
- Fast access
- Easy to edit and maintain
- Version controlled
- No API rate limits

**Structure**: See DATA_MODEL.md

---

## Development Tools

### pnpm
**Version**: 10.22.0
**Purpose**: Package manager

**Why pnpm**:
- Faster than npm/yarn
- Disk space efficient
- Strict dependency management
- Better monorepo support
- Growing adoption

### Vite
**Purpose**: Build tool (bundled with Nuxt 4)

**Why Vite**:
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ESM support
- Built into Nuxt 4

---

## Deployment Platform (Phase 4)

### Vercel or Netlify
**Purpose**: Static site hosting

**Why These Platforms**:
- Free tier sufficient for project
- Automatic deployments from Git
- Global CDN
- HTTPS by default
- Great Nuxt support
- Easy custom domain setup

---

## Browser Support

### Target Browsers
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

### Minimum Requirements
- WebGL support (for MapLibre GL JS)
- ES6+ JavaScript support
- Modern CSS features

---

## Architecture Principles

1. **Free & Open Source**: All libraries are free with no API keys
2. **Performance First**: Fast load times, smooth interactions
3. **Type Safety**: Full TypeScript coverage
4. **Component-Based**: Modular, reusable components
5. **Progressive Enhancement**: Core features work, enhanced features optional
6. **Desktop-First**: Optimize for desktop, support mobile
7. **SEO-Friendly**: Server-side rendering for better indexing

# WW2 Map Films - Claude Code Instructions

## Project Context

This is **WW2 Map Films**, an interactive web application that displays World War II films on a 2D map with a videogame aesthetic similar to Hearts of Iron 4 and Victoria 2. Users can explore films geographically, filter by timeline (1936-1945), and learn about WW2 cinema in an immersive way.

This project is built with **love and care** (proyecto con mucho cariño), so always prioritize quality, user experience, and maintainability.

---

## Current Status

**Phase**: Phase 1 - MVP (Setup y Mapa Base)
**Status**: ✓ Completed
**Last Updated**: November 2025

### What's Working
- ✓ Nuxt 4 project initialized with TypeScript
- ✓ MapLibre GL JS integrated via @indoorequal/vue-maplibre-gl
- ✓ Dark Matter map style applied (WW2 aesthetic)
- ✓ Mouse navigation (drag, zoom)
- ✓ Keyboard navigation (WASD keys)
- ✓ Map centered on Europe
- ✓ Comprehensive documentation in .claude/

### What's Next
- Phase 2: Film markers and data
- Phase 3: Timeline and i18n
- Phase 4: Polish and deployment

---

## Architecture Decisions

### Why Nuxt 4?
- Latest stable framework with long-term support
- Server-side rendering for better SEO
- File-based routing and auto-imports
- Excellent TypeScript integration
- Strong ecosystem

### Why MapLibre GL JS?
- **Free and open-source** (no API keys required)
- High-performance WebGL rendering
- Fork of Mapbox GL JS with active development
- Highly customizable
- Perfect for this use case

### Why @indoorequal/vue-maplibre-gl?
- Built specifically for Vue 3 Composition API
- Full TypeScript support
- Component-based architecture (MglMap, MglNavigationControl)
- Reactive map properties
- Better Nuxt 4 integration than nuxt-maplibre

### Why Dark Matter Style?
- Free CDN-hosted style (no API key)
- Dark grey aesthetic perfect for WW2 theme
- Optimized for data visualization
- Evokes strategy game aesthetics

---

## Key Files and Structure

```
ww2-movie-map/
├── .claude/                    # Documentation (gitignored)
│   ├── PROJECT_OVERVIEW.md     # Vision and objectives
│   ├── PHASES.md               # Development phases
│   ├── TECH_STACK.md           # Technology decisions
│   ├── USER_STORIES.md         # All user stories
│   ├── DATA_MODEL.md           # TypeScript interfaces
│   ├── TASKS_MVP.md            # MVP checklist
│   ├── FUTURE_ENHANCEMENTS.md  # Future features
│   └── CLAUDE.md               # This file
├── app/
│   ├── app.vue                 # Main layout
│   └── components/
│       └── WW2Map.vue          # Map component with WASD navigation
├── nuxt.config.ts              # Nuxt configuration
├── package.json                # Dependencies
└── .gitignore                  # Git exclusions
```

### Important: .claude/ is gitignored
All documentation in `.claude/` is private and not committed to git. Only team members with local access can see these files.

---

## Development Guidelines

### When Adding Features
1. Read relevant documentation in `.claude/` first
2. Check USER_STORIES.md for acceptance criteria
3. Follow the TypeScript interfaces in DATA_MODEL.md
4. Update TASKS_MVP.md or create new task files
5. Test thoroughly before considering complete
6. Update documentation after implementation

### Code Style
- **TypeScript**: Always use TypeScript, never `any` types
- **Composition API**: Use Vue 3 Composition API with `<script setup>`
- **Components**: Single-file components with clear, descriptive names
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Write comments for complex logic, not obvious code
- **Imports**: Use auto-imports where possible (Nuxt feature)

### Git Workflow
- **DO NOT commit** without explicit user approval
- **DO NOT commit** .claude/ directory (it's gitignored)
- **DO NOT create** README.md until Phase 4 (user request)
- Write clear, descriptive commit messages
- One logical change per commit

---

## Map Configuration

### MapLibre Style
```typescript
const styleUrl = 'https://openmaptiles.github.io/dark-matter-gl-style/style-cdn.json'
```

### Initial View
```typescript
const center: [number, number] = [13.41, 52.52]  // Berlin, Europe
const zoom = 4  // Shows Western and Eastern Europe
```

### WASD Navigation
- **W**: Pan up (north)
- **A**: Pan left (west)
- **S**: Pan down (south)
- **D**: Pan right (east)
- **Pan Speed**: 100px
- **Easing**: `t * (2 - t)` for smooth movement

---

## Common Tasks

### Adding a New Component
```bash
# Create in app/components/
touch app/components/ComponentName.vue
```

```vue
<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
// TypeScript with Composition API
</script>

<style scoped>
/* Component styles */
</style>
```

### Adding a New Page
```bash
# Nuxt uses file-based routing
# Create in app/pages/
touch app/pages/page-name.vue
```

### Installing New Dependencies
```bash
pnpm add package-name          # Regular dependency
pnpm add -D package-name       # Dev dependency
```

### Running the Development Server
```bash
pnpm run dev
```

### Type Checking
```bash
pnpm exec nuxi typecheck
```

---

## Troubleshooting

### Map Not Loading
1. Check MapLibre CSS is imported in nuxt.config.ts
2. Verify container has width and height set
3. Check browser console for errors
4. Ensure style URL is accessible

### WASD Keys Not Working
1. Verify canvas is focused (click on map)
2. Check event listener is attached on mount
3. Verify cleanup on unmount
4. Check for conflicting keyboard shortcuts

### TypeScript Errors
1. Run `pnpm exec nuxi typecheck`
2. Check all imports are correct
3. Verify interfaces match usage
4. Ensure no `any` types are used

---

## Testing Checklist

Before considering a feature complete:

- [ ] Code works as expected
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Mouse interactions work
- [ ] Keyboard interactions work
- [ ] Responsive (if applicable)
- [ ] Documentation updated
- [ ] User story acceptance criteria met

---

## Important Reminders

### User Preferences
- **Language**: User is Spanish-speaking, but project is bilingual (EN/ES)
- **Approach**: User values quality and careful implementation
- **README**: Do NOT create until user explicitly asks (Phase 4)
- **Commits**: Do NOT commit without user approval

### Project Philosophy
- **Free & Open**: Use only free, open-source tools
- **No API Keys**: Avoid services requiring API keys
- **Type Safety**: Full TypeScript coverage
- **Performance**: Fast load times, smooth interactions
- **Desktop-First**: Optimize for desktop, support mobile
- **Con Cariño**: This is a passion project, treat it with care

---

## Future Context (Phase 2+)

### When Implementing Film Data
- Use DATA_MODEL.md for TypeScript interfaces
- Store data in `data/films.json`
- Include bilingual content (EN/ES)
- Use WGS84 coordinates `[longitude, latitude]`
- At least one `isPrimary: true` location per film

### When Adding UI Components
- Install Nuxt UI v4 first: `pnpm add @nuxt/ui`
- Use Nuxt UI components for modals, sliders, buttons
- Follow Nuxt UI documentation for theming
- Maintain dark WW2 aesthetic

### When Adding Translations
- Install @nuxtjs/i18n: `pnpm add @nuxtjs/i18n`
- Create locales/en.json and locales/es.json
- Use i18n for all user-facing text
- Default language: English
- Support language switching

---

## Reference Links

### Documentation
- All docs in `.claude/` directory
- Start with PROJECT_OVERVIEW.md for context
- Check USER_STORIES.md for requirements
- Reference DATA_MODEL.md for data structures

### External Resources
- [Nuxt 4 Docs](https://nuxt.com/docs/4.x)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Vue MapLibre GL](https://github.com/indoorequal/vue-maplibre-gl)
- [OpenMapTiles](https://openmaptiles.org/)
- [Natural Earth Data](https://www.naturalearthdata.com/)

---

## Questions to Ask

When uncertain, ask the user:
- Should this feature be in MVP or later phase?
- Which approach do you prefer? (present options)
- Should I create a commit now or continue?
- Do you want to review before I proceed?

---

## Final Note

This project is built with care and attention to detail. Always:
- ✓ Read the documentation before coding
- ✓ Follow established patterns
- ✓ Test thoroughly
- ✓ Ask when uncertain
- ✓ Keep the user informed
- ✓ Maintain high code quality
- ✓ Update docs after changes

**Remember**: Este es un proyecto con mucho cariño - treat it with love!

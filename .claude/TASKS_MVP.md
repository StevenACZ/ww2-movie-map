# WW2 Map Films - MVP Task Checklist

## Phase 1: Setup y Mapa Base

### ✓ 1. Project Initialization
- [x] Create Nuxt 4 project with TypeScript
- [x] Verify Node.js and pnpm versions
- [x] Initialize git repository
- [x] Create initial project structure

### ✓ 2. Dependency Installation
- [x] Install maplibre-gl (5.13.0)
- [x] Install @indoorequal/vue-maplibre-gl (8.4.2)
- [x] Verify package.json dependencies
- [x] Run pnpm install to ensure all dependencies are installed

### ✓ 3. Configuration Files
- [x] Update nuxt.config.ts
  - [x] Add MapLibre CSS import
  - [x] Configure app metadata (title, description)
  - [x] Set compatibility date
  - [x] Enable devtools
- [x] Update .gitignore
  - [x] Add .claude/ directory
  - [x] Add CLAUDE.md file exclusion

### 4. Documentation Creation
- [x] Create .claude/ directory
- [x] Create PROJECT_OVERVIEW.md
- [x] Create PHASES.md
- [x] Create TECH_STACK.md
- [x] Create USER_STORIES.md
- [x] Create DATA_MODEL.md
- [x] Create TASKS_MVP.md (this file)
- [ ] Create FUTURE_ENHANCEMENTS.md
- [ ] Create CLAUDE.md

### 5. Map Component Development
- [ ] Create app/components/ directory
- [ ] Create WW2Map.vue component
  - [ ] Import MapLibre GL CSS
  - [ ] Import MglMap and MglNavigationControl from vue-maplibre-gl
  - [ ] Configure map with Dark Matter style
  - [ ] Set initial center to Europe [13.41, 52.52]
  - [ ] Set initial zoom level to 4
  - [ ] Add MglNavigationControl component
- [ ] Implement WASD keyboard navigation
  - [ ] Add keydown event listener
  - [ ] Implement W (up) pan
  - [ ] Implement A (left) pan
  - [ ] Implement S (down) pan
  - [ ] Implement D (right) pan
  - [ ] Set pan speed to 100px
  - [ ] Implement smooth easing function: `t * (2 - t)`
  - [ ] Handle both uppercase and lowercase keys
  - [ ] Focus canvas on mount
  - [ ] Clean up event listener on unmount
- [ ] Style map container
  - [ ] Set width to 100vw
  - [ ] Set height to 100vh
  - [ ] Remove margins and padding

### 6. App Layout Update
- [ ] Update app/app.vue
  - [ ] Remove NuxtWelcome component
  - [ ] Import WW2Map component
  - [ ] Add WW2Map to template
  - [ ] Add global styles for fullscreen display
  - [ ] Remove default body margins
  - [ ] Set html, body, #__nuxt to height 100%

### 7. Testing & Verification
- [ ] Start development server (pnpm run dev)
- [ ] Verify map loads successfully
- [ ] Test map appearance
  - [ ] Confirm Dark Matter style is applied
  - [ ] Check color scheme is dark/grey
  - [ ] Verify Europe is centered on load
  - [ ] Confirm appropriate zoom level
- [ ] Test mouse navigation
  - [ ] Click and drag to pan
  - [ ] Scroll wheel to zoom in
  - [ ] Scroll wheel to zoom out
  - [ ] Verify smooth animations
- [ ] Test keyboard navigation
  - [ ] Press W key (pan up)
  - [ ] Press A key (pan left)
  - [ ] Press S key (pan down)
  - [ ] Press D key (pan right)
  - [ ] Test with SHIFT+keys (uppercase)
  - [ ] Verify smooth easing
- [ ] Browser testing
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Check console for errors
- [ ] Verify no warnings in browser console
- [ ] Test page load performance

### 8. Code Quality
- [ ] Run TypeScript type check (nuxi typecheck)
- [ ] Verify no TypeScript errors
- [ ] Check code formatting
- [ ] Ensure all imports are used
- [ ] Remove debug console.logs

### 9. Documentation Review
- [ ] Review all .claude/ markdown files
- [ ] Verify links between documents
- [ ] Check for typos and formatting
- [ ] Ensure all code examples are correct
- [ ] Update TASKS_MVP.md with completion status

### 10. Git Preparation
- [ ] Review git status
- [ ] Stage all changes
- [ ] Verify .claude/ is not staged (should be gitignored)
- [ ] Prepare commit message
- [ ] Ready for first commit (DO NOT commit yet, wait for user approval)

---

## Acceptance Criteria

### Map Display
✓ Map loads without errors
✓ Dark Matter style is applied
✓ Map is centered on Europe (Berlin area)
✓ Zoom level shows Western and Eastern Europe
✓ Navigation controls are visible

### Mouse Navigation
✓ Drag with mouse pans the map
✓ Scroll wheel zooms in/out
✓ Zoom centers on cursor position
✓ All movements are smooth

### Keyboard Navigation
✓ W key pans up
✓ A key pans left
✓ S key pans down
✓ D key pans right
✓ Keys work with both lowercase and SHIFT
✓ Pan movements are smooth with easing

### Performance
✓ Page loads in < 3 seconds
✓ No lag when panning or zooming
✓ No console errors
✓ No memory leaks

### Documentation
✓ All 8 .claude/ files created
✓ Documentation is comprehensive
✓ Code examples are accurate
✓ Future phases are clearly outlined

---

## Estimated Time

- Dependencies & Configuration: 30 minutes
- Documentation Creation: 1 hour
- Map Component Implementation: 1.5 hours
- Testing & Refinement: 30 minutes
- **Total: 3.5 hours**

---

## Notes

- README.md will NOT be created in this phase (per user request)
- No commit will be made until user explicitly requests it
- .claude/ directory and contents are gitignored
- Focus is on getting a working, navigable map as the foundation
- All UI components and film data come in Phase 2

---

## Next Steps After MVP

1. **Phase 2 Planning**
   - Design film data structure
   - Create sample film data (5-10 films)
   - Design FilmMarker component
   - Plan region highlighting approach

2. **Technology Additions**
   - Add Nuxt UI v4
   - Add TailwindCSS v4
   - Set up component library structure

3. **Data Preparation**
   - Research WW2 films for database
   - Gather poster images
   - Collect location coordinates
   - Write film synopses

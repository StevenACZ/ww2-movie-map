# WW2 Map Films - Development Phases

## Phase 1: Setup y Mapa Base (MVP) ✓ Current Phase

**Duration**: Week 1
**Status**: In Progress

### Goals
- Initialize Nuxt 4 project with TypeScript
- Set up MapLibre GL JS with Vue integration
- Implement basic map navigation
- Configure WW2 dark aesthetic

### Tasks
1. ✓ Initialize Nuxt 4 project
2. ✓ Install MapLibre GL JS and @indoorequal/vue-maplibre-gl
3. ✓ Configure Dark Matter style from OpenMapTiles
4. ✓ Implement WASD keyboard navigation
5. ✓ Implement mouse navigation (drag, zoom)
6. ✓ Center map on Europe with appropriate zoom level
7. ✓ Create project documentation in .claude/

### Deliverable
A navigable map with WW2 aesthetic, keyboard and mouse controls, centered on Europe.

---

## Phase 2: Películas y Marcadores

**Duration**: Week 2
**Status**: Planned

### Goals
- Create film data structure
- Display film posters on map
- Implement film selection and details
- Add region highlighting

### Tasks
1. Create JSON structure for film data (5-10 example films)
2. Implement FilmMarker component to display posters
3. Create FilmModal component with detailed information
4. Implement zoom functionality when clicking film poster
5. Create SelectedFilm component (bottom-left corner display)
6. Implement region highlighting with red opacity (0.5)
7. Add click interactions for film selection

### Deliverable
Films visible on map with interactive markers, detail modals, and region highlighting.

---

## Phase 3: Timeline e i18n

**Duration**: Week 3
**Status**: Planned

### Goals
- Implement timeline slider
- Add year-based filtering
- Configure internationalization
- Support English and Spanish

### Tasks
1. Implement Timeline component with slider (1936-1945)
2. Create filtering logic for films by year range
3. Implement useTimeline composable for state management
4. Configure @nuxtjs/i18n module
5. Create translation files (en.json, es.json)
6. Implement SettingsMenu with language selector
7. Translate all interface elements

### Deliverable
Functional timeline with year filtering and complete bilingual support (EN/ES).

---

## Phase 4: Polish y Deploy

**Duration**: Week 4
**Status**: Planned

### Goals
- Create welcome experience
- Add project links
- Optimize performance
- Deploy to production

### Tasks
1. Create WelcomeModal with instructions (localStorage for first visit)
2. Add GitHub link to interface
3. Optimize performance (lazy loading, code splitting)
4. Test across different browsers (Chrome, Firefox, Safari, Edge)
5. Basic responsive design testing for mobile
6. Deploy to Vercel or Netlify
7. Create comprehensive README.md
8. Final testing and bug fixes

### Deliverable
Complete MVP deployed to production with welcome experience and optimizations.

---

## Future Phases (Post-MVP)

### Phase 5: Enhanced Features
- Advanced filtering (country, rating, genre)
- Search functionality
- Film routes (connecting multiple locations)
- User favorites/bookmarks

### Phase 6: Historical Context
- Historical map borders (changing with timeline)
- Battle locations and dates
- Historical context for each film
- Integration with historical databases

### Phase 7: Advanced Visualizations
- 3D map mode with pitch controls
- Heat maps for film density
- Animated timeline progression
- Data visualizations and statistics

### Phase 8: External Integrations
- TMDB API integration for automatic film data
- Trailer embeds
- User reviews and ratings
- Social sharing features

### Phase 9: PWA & Offline
- Progressive Web App conversion
- Offline map caching
- Service worker implementation
- Push notifications for new films

---

## Version History

- **v1.0.0** - MVP Release (Phase 1-4)
- **v1.1.0** - Enhanced Features (Phase 5)
- **v1.2.0** - Historical Context (Phase 6)
- **v2.0.0** - Advanced Visualizations (Phase 7)
- **v2.1.0** - External Integrations (Phase 8)
- **v3.0.0** - PWA & Offline Support (Phase 9)

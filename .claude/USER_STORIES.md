# WW2 Map Films - User Stories

## Navigation (Map Controls)

### US-001: WASD Keyboard Navigation
**As a** user
**I want to** move around the map using the WASD keys
**So that** I can explore different regions of the world easily

**Acceptance Criteria**:
- W key pans the map upward
- A key pans the map to the left
- S key pans the map downward
- D key pans the map to the right
- Pan movement is smooth with easing
- Keys work in both uppercase and lowercase

**Priority**: High (MVP)
**Status**: ✓ Completed

---

### US-002: Mouse Wheel Zoom
**As a** user
**I want to** zoom in and out using my mouse wheel
**So that** I can see more or less detail of a region

**Acceptance Criteria**:
- Scroll up zooms in
- Scroll down zooms out
- Zoom is smooth and centered on cursor position
- Zoom limits prevent over-zooming in or out

**Priority**: High (MVP)
**Status**: ✓ Completed

---

### US-003: Mouse Drag Navigation
**As a** user
**I want to** drag the map with my mouse
**So that** I can navigate intuitively

**Acceptance Criteria**:
- Click and drag moves the map
- Cursor changes to indicate draggable state
- Drag movement is smooth and responsive
- Works with left mouse button

**Priority**: High (MVP)
**Status**: ✓ Completed

---

### US-004: WW2 Aesthetic Map Style
**As a** user
**I want** the map to have a dark/grey aesthetic similar to WW2 strategy games
**So that** the experience is immersive and thematic

**Acceptance Criteria**:
- Map uses dark grey color scheme
- Styling reminiscent of Hearts of Iron 4 / Victoria 2
- Text is readable against dark background
- Borders and labels are clearly visible

**Priority**: High (MVP)
**Status**: ✓ Completed

---

## Films & Locations

### US-005: View Film Posters on Map
**As a** user
**I want to** see movie posters displayed at the locations where events occurred
**So that** I can visually identify films on the map

**Acceptance Criteria**:
- Film posters appear as markers on the map
- Posters are sized appropriately for visibility
- Multiple films in close proximity don't overlap badly
- Posters load efficiently

**Priority**: High (Phase 2)
**Status**: Planned

---

### US-006: Click Poster to Zoom
**As a** user
**I want to** click on a film poster to zoom to that location
**So that** I can focus on a specific film's geographical context

**Acceptance Criteria**:
- Clicking poster smoothly zooms to location
- Zoom level is appropriate to show region detail
- Animation is smooth and not jarring
- Selected film remains centered

**Priority**: Medium (Phase 2)
**Status**: Planned

---

### US-007: Region Highlighting
**As a** user
**I want** regions/cities where film events occurred to be highlighted
**So that** I can see the geographical scope of the film

**Acceptance Criteria**:
- Regions are colored red with 0.5 opacity
- Multiple regions can be highlighted simultaneously
- Highlighting doesn't obscure map details
- Highlighting clears when deselecting film

**Priority**: Medium (Phase 2)
**Status**: Planned

---

### US-008: View Film Details Modal
**As a** user
**I want to** see detailed information about a film in a modal
**So that** I can learn more about the movie

**Acceptance Criteria**:
- Modal shows: title, release year, IMDb rating, country, synopsis
- Modal is well-designed and readable
- Modal can be closed easily (X button, ESC key, click outside)
- Information is in the selected language

**Priority**: High (Phase 2)
**Status**: Planned

---

### US-009: Selected Film Display
**As a** user
**I want to** see the currently selected film's name/poster in the bottom-left corner
**So that** I always know which film I'm viewing

**Acceptance Criteria**:
- Film name and small poster shown in bottom-left
- Display updates when selecting different films
- Display clears when no film is selected
- Doesn't obstruct important map controls

**Priority**: Medium (Phase 2)
**Status**: Planned

---

## Timeline

### US-010: Timeline Slider
**As a** user
**I want** a timeline slider from 1936 to 1945
**So that** I can filter films by year

**Acceptance Criteria**:
- Slider ranges from 1936 to 1945
- Current year is clearly displayed
- Slider is easy to drag and click
- Year updates smoothly as slider moves

**Priority**: High (Phase 3)
**Status**: Planned

---

### US-011: Multi-Year Film Visibility
**As a** user
**I want** films that span multiple years to remain visible while the slider is within their date range
**So that** I can see films that cover extended periods

**Acceptance Criteria**:
- Films with start/end years show if slider is in range
- Films appear/disappear smoothly as slider moves
- Film count updates to reflect visible films
- Performance remains smooth with many films

**Priority**: Medium (Phase 3)
**Status**: Planned

---

### US-012: Default Year and Location
**As a** user
**I want** the map to start centered on Europe with the year 1940 selected
**So that** I see relevant content immediately

**Acceptance Criteria**:
- Map centers on Europe (Berlin area) on load
- Timeline defaults to 1940
- Appropriate zoom level to see Western and Eastern Europe
- Films from 1940 are visible

**Priority**: Medium (Phase 3)
**Status**: Planned (MVP centers on Europe, timeline in Phase 3)

---

## Interface & Configuration

### US-013: Welcome Modal
**As a** first-time user
**I want to** see a welcome modal with navigation instructions
**So that** I know how to use the application

**Acceptance Criteria**:
- Modal appears on first visit only (localStorage)
- Shows keyboard shortcuts (WASD)
- Explains mouse controls
- Explains basic features
- Can be dismissed and won't show again
- Has option to "show again"

**Priority**: Medium (Phase 4)
**Status**: Planned

---

### US-014: Language Switcher
**As a** user
**I want to** change the interface language between English and Spanish
**So that** I can use the app in my preferred language

**Acceptance Criteria**:
- Language selector in settings menu
- Supports English and Spanish
- All UI text translates
- Film titles/descriptions translate if available
- Language preference is saved
- Page doesn't reload when switching

**Priority**: High (Phase 3)
**Status**: Planned

---

### US-015: GitHub Link
**As a** user
**I want** a link to the GitHub repository
**So that** I can view the source code and contribute

**Acceptance Criteria**:
- GitHub icon/link visible in interface
- Link opens in new tab
- Positioned appropriately (not intrusive)
- Tooltipped to explain purpose

**Priority**: Low (Phase 4)
**Status**: Planned

---

## Summary by Phase

### Phase 1 (MVP): 4 stories ✓ Completed
- US-001: WASD Navigation
- US-002: Mouse Wheel Zoom
- US-003: Mouse Drag
- US-004: WW2 Aesthetic

### Phase 2: 5 stories
- US-005: Film Posters
- US-006: Click to Zoom
- US-007: Region Highlighting
- US-008: Film Details Modal
- US-009: Selected Film Display

### Phase 3: 4 stories
- US-010: Timeline Slider
- US-011: Multi-Year Films
- US-012: Default Settings
- US-014: Language Switcher

### Phase 4: 2 stories
- US-013: Welcome Modal
- US-015: GitHub Link

**Total**: 15 user stories

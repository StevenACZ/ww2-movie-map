<template>
  <div class="timeline-page">
    <!-- Background Map -->
    <div class="world-map-bg"></div>

    <!-- Subtle grid pattern -->
    <div class="grid-pattern"></div>

    <div class="header-content">
      <span class="period-badge"
        >{{ visibleStartYear }} - {{ visibleEndYear }}</span
      >
      <h1>Interactive Timeline</h1>
      <h2>The War and Cinema</h2>
      <p class="subtitle">
        Explore key historical events and related film releases
      </p>
    </div>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot event-dot"></span>
        <span>Historical Events</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot film-dot"></span>
        <span>Films</span>
      </div>
    </div>

    <!-- Mobile Timeline (Card-based) -->
    <div class="mobile-timeline" v-if="isMobile">
      <TransitionGroup name="mobile-card">
        <!-- Events -->
        <div
          v-for="event in mobileTimelineItems.events"
          :key="'event-' + event.id"
          class="mobile-timeline-card event-card"
        >
          <div class="mobile-card-icon">{{ event.icon || "⚔️" }}</div>
          <div class="mobile-card-content">
            <span class="mobile-card-date">{{ formatDate(event.date) }}</span>
            <h3>{{ event.title }}</h3>
          </div>
          <div class="mobile-card-badge event-badge">Event</div>
        </div>

        <!-- Films -->
        <div
          v-for="film in mobileTimelineItems.films"
          :key="'film-' + film.id"
          class="mobile-timeline-card film-card"
          @click="toggleFilmPopup(film)"
        >
          <div class="mobile-card-icon">🎬</div>
          <div class="mobile-card-content">
            <span class="mobile-card-date">
              {{ film.year }} • {{ formatEventPeriod(film) }}
            </span>
            <h3>{{ film.title }}</h3>
          </div>
          <div class="mobile-card-badge film-badge">Film</div>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div
        v-if="
          mobileTimelineItems.events.length === 0 &&
          mobileTimelineItems.films.length === 0
        "
        class="empty-state"
      >
        <span class="empty-icon">📅</span>
        <p>No events or films in this period</p>
      </div>
    </div>

    <!-- Desktop Timeline -->
    <div class="timeline-container" ref="timelineContainer" v-if="!isMobile">
      <!-- Timeline Axis (Center) -->
      <div class="timeline-axis">
        <div class="axis-line"></div>

        <!-- Year Markers -->
        <div
          v-for="year in visibleYears"
          :key="year"
          class="year-marker"
          :style="{ left: getYearPosition(year) + '%' }"
        >
          <div class="year-tick"></div>
          <div class="year-label">{{ year }}</div>
        </div>
      </div>

      <!-- Events Section (Top Half) -->
      <div class="timeline-section events-section">
        <TransitionGroup name="card">
          <div
            v-for="(event, index) in positionedEvents"
            :key="event.id"
            class="timeline-card event-card"
            :style="{
              left: event.position + '%',
              bottom: event.offsetY + 'px',
              '--delay': index * 0.05 + 's',
              zIndex: 20 - event.level,
            }"
          >
            <div class="card-body">
              <div class="card-icon-wrapper">
                <span class="card-icon">{{ event.icon || "⚔️" }}</span>
              </div>
              <div class="card-text">
                <h3>{{ event.title }}</h3>
                <p class="card-date">{{ formatDate(event.date) }}</p>
              </div>
            </div>
            <!-- Connector (Down to axis) -->
            <div
              class="connector-line"
              :style="{ height: event.connectorHeight + 'px' }"
            ></div>
            <div class="timeline-dot"></div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Films Section (Bottom Half) -->
      <div class="timeline-section films-section">
        <TransitionGroup name="card">
          <div
            v-for="(film, index) in positionedFilms"
            :key="film.id"
            class="timeline-card film-card"
            :class="{ active: selectedFilm?.id === film.id }"
            :style="{
              left: film.position + '%',
              top: film.offsetY + 'px',
              '--delay': index * 0.05 + 's',
              zIndex: 20 - film.level,
            }"
            @click.stop="selectFilm(film)"
          >
            <!-- Connector (Up to axis) -->
            <div class="timeline-dot"></div>
            <div
              class="connector-line"
              :style="{ height: film.connectorHeight + 'px' }"
            ></div>

            <div class="card-body">
              <div class="card-icon-wrapper">
                <span class="card-icon">🎬</span>
              </div>
              <div class="card-text">
                <h3>{{ film.title }}</h3>
                <p class="card-date">
                  {{ film.year }}
                  <span class="event-period"
                    >• {{ formatEventPeriod(film) }}</span
                  >
                </p>
              </div>
            </div>

            <!-- Detail Popup -->
            <Transition name="popup">
              <div v-if="selectedFilm?.id === film.id" class="film-popup">
                <button class="close-btn" @click.stop="selectedFilm = null">
                  ×
                </button>
                <div class="popup-content">
                  <img
                    :src="film.poster"
                    :alt="film.title"
                    class="popup-poster"
                  />
                  <div class="popup-info">
                    <h4>{{ film.title }} ({{ film.year }})</h4>
                    <p class="popup-meta">
                      <span class="imdb-rating">⭐ {{ film.imdbRating }}</span>
                      <span class="country">{{ film.country }}</span>
                    </p>
                    <p class="popup-desc">{{ film.synopsis }}</p>
                    <div class="popup-actions">
                      <button class="btn-primary">Watch Trailer</button>
                      <button class="btn-secondary">View Details</button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Mobile Film Popup Modal -->
    <Transition name="modal">
      <div
        v-if="mobileSelectedFilm"
        class="mobile-film-modal"
        @click.self="mobileSelectedFilm = null"
      >
        <div class="mobile-modal-content">
          <button class="mobile-modal-close" @click="mobileSelectedFilm = null">
            ×
          </button>
          <div class="mobile-modal-body">
            <img
              :src="mobileSelectedFilm.poster"
              :alt="mobileSelectedFilm.title"
              class="mobile-modal-poster"
            />
            <div class="mobile-modal-info">
              <h3>{{ mobileSelectedFilm.title }}</h3>
              <p class="mobile-modal-year">{{ mobileSelectedFilm.year }}</p>
              <div class="mobile-modal-meta">
                <span class="imdb-rating"
                  >⭐ {{ mobileSelectedFilm.imdbRating }}</span
                >
                <span class="country">{{ mobileSelectedFilm.country }}</span>
              </div>
              <p class="mobile-modal-desc">{{ mobileSelectedFilm.synopsis }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Bottom Navigation -->
    <div class="timeline-nav">
      <button
        class="nav-btn prev"
        @click="prevPeriod"
        :disabled="currentPeriodIndex === 0"
      >
        <span class="arrow">‹</span>
      </button>
      <div class="year-ranges">
        <button
          v-for="(period, index) in periods"
          :key="index"
          class="range-btn"
          :class="{ active: currentPeriodIndex === index }"
          @click="setPeriod(index)"
        >
          <span class="range-label">{{ period.label }}</span>
          <span class="range-indicator"></span>
        </button>
      </div>
      <button
        class="nav-btn next"
        @click="nextPeriod"
        :disabled="currentPeriodIndex === periods.length - 1"
      >
        <span class="arrow">›</span>
      </button>
    </div>

    <!-- Period info tooltip -->
    <div class="period-info">
      <span class="info-text">
        {{ positionedEvents.length }} events •
        {{ positionedFilms.length }} films
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// State
const events = ref([]);
const films = ref([]);
const selectedFilm = ref(null);
const mobileSelectedFilm = ref(null);
const currentPeriodIndex = ref(0); // Start with first period (1936-1938)
const isMobile = ref(false);

// Películas seleccionadas para mostrar en el timeline (IDs del JSON principal)
const timelineFilmIds = [
  "the-eight-hundred-2020", // 1937
  "dunkirk-2017", // 1940
  "das-boot-1981", // 1941
  "tora-tora-tora-1970", // 1941 Pearl Harbor
  "schindlers-list-1993", // 1942
  "come-and-see-1985", // 1943
  "saving-private-ryan-1998", // 1944 D-Day
  "downfall-2004", // 1945
  "hacksaw-ridge-2016", // 1945
];

// Periods Configuration - 3 años por cada slide
const periods = [
  { label: "1936-1938", start: 1936, end: 1938 },
  { label: "1939-1941", start: 1939, end: 1941 },
  { label: "1942-1945", start: 1942, end: 1945 },
];

const visibleStartYear = computed(
  () => periods[currentPeriodIndex.value].start
);
const visibleEndYear = computed(() => periods[currentPeriodIndex.value].end);
const totalVisibleYears = computed(
  () => visibleEndYear.value - visibleStartYear.value + 1
);

// Generate visible years array
const visibleYears = computed(() => {
  const arr = [];
  for (let y = visibleStartYear.value; y <= visibleEndYear.value; y++) {
    arr.push(y);
  }
  return arr;
});

// Mobile timeline items (sorted by date)
const mobileTimelineItems = computed(() => {
  const filteredEvents = positionedEvents.value;
  const filteredFilms = positionedFilms.value;

  return {
    events: filteredEvents,
    films: filteredFilms,
  };
});

// Check mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Load data
onMounted(async () => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  try {
    const eventsResponse = await fetch("/data/historical-events.json");
    const eventsData = await eventsResponse.json();
    events.value = eventsData.events;

    // Usar el JSON principal de películas y filtrar las que queremos en el timeline
    const filmsResponse = await fetch("/data/films.json");
    const filmsData = await filmsResponse.json();
    films.value = filmsData.films.filter((film) =>
      timelineFilmIds.includes(film.id)
    );
  } catch (error) {
    console.error("Error loading data:", error);
  }

  // Click outside handler para cerrar el modal
  document.addEventListener("click", handleClickOutside);
});

// Cerrar modal al hacer click afuera
const handleClickOutside = (event) => {
  if (selectedFilm.value) {
    const popup = document.querySelector(".film-popup");
    const filmCards = document.querySelectorAll(".film-card");

    let clickedOnCard = false;
    filmCards.forEach((card) => {
      if (card.contains(event.target)) {
        clickedOnCard = true;
      }
    });

    if (!clickedOnCard && popup && !popup.contains(event.target)) {
      selectedFilm.value = null;
    }
  }
};

// Limpiar event listener
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", checkMobile);
});

// Positioning Logic - Cálculo preciso basado en fecha exacta
const calculatePosition = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();

  // Filtrar elementos fuera del rango visible
  if (year < visibleStartYear.value || year > visibleEndYear.value) return -999;

  const month = date.getMonth(); // 0-11
  const day = date.getDate(); // 1-31

  // Calcular el número total de días desde el inicio del período visible
  const startOfRange = new Date(visibleStartYear.value, 0, 1); // 1 de enero del año inicial
  const endOfRange = new Date(visibleEndYear.value + 1, 0, 1); // 1 de enero del siguiente año después del final

  const totalDaysInRange = (endOfRange - startOfRange) / (1000 * 60 * 60 * 24);
  const daysFromStart = (date - startOfRange) / (1000 * 60 * 60 * 24);

  // Calcular el porcentaje de progreso dentro del rango
  const progress = daysFromStart / totalDaysInRange;

  // El timeline ocupa del 5% al 95% del ancho (dejando márgenes)
  const marginLeft = 5;
  const usableWidth = 90;

  return marginLeft + progress * usableWidth;
};

const getYearPosition = (year) => {
  // Calcular posición del marcador del año (inicio del año)
  const startOfRange = new Date(visibleStartYear.value, 0, 1);
  const endOfRange = new Date(visibleEndYear.value + 1, 0, 1);
  const yearDate = new Date(year, 0, 1);

  const totalDaysInRange = (endOfRange - startOfRange) / (1000 * 60 * 60 * 24);
  const daysFromStart = (yearDate - startOfRange) / (1000 * 60 * 60 * 24);

  const progress = daysFromStart / totalDaysInRange;

  const marginLeft = 5;
  const usableWidth = 90;

  return marginLeft + progress * usableWidth;
};

// Navigation Methods
const nextPeriod = () => {
  if (currentPeriodIndex.value < periods.length - 1) {
    currentPeriodIndex.value++;
  }
};

const prevPeriod = () => {
  if (currentPeriodIndex.value > 0) {
    currentPeriodIndex.value--;
  }
};

const setPeriod = (index) => {
  currentPeriodIndex.value = index;
};

// Collision Detection & Spacing
const resolveCollisions = (items) => {
  if (items.length === 0) return [];

  // Filter visible items first
  const visibleItems = items.filter(
    (item) => item.position > -10 && item.position < 110
  );

  const result = visibleItems.map((item, index) => ({
    ...item,
    offsetY: 0,
    connectorHeight: 40, // Initial connector height
    level: 0,
  }));

  // Sort by position (left to right)
  result.sort((a, b) => a.position - b.position);

  // Minimum distance between cards (in percentage) to trigger a level change
  const minDistance = 22;

  for (let i = 0; i < result.length; i++) {
    let currentLevel = 0;
    let hasCollision = true;

    // Try to find the lowest level that doesn't collide with previous neighbors
    while (hasCollision && currentLevel < 5) {
      // Limit levels to prevent infinite loop
      hasCollision = false;

      // Look back at previous items to check for overlap
      for (let j = 0; j < i; j++) {
        const distance = Math.abs(result[i].position - result[j].position);

        // If they are close horizontally AND on the same level, it's a collision
        if (distance < minDistance && result[j].level === currentLevel) {
          hasCollision = true;
          break;
        }
      }

      if (hasCollision) {
        currentLevel++;
      }
    }

    result[i].level = currentLevel;

    // Calculate POSITIVE offset (distance from axis)
    // CSS will handle direction (bottom for events, top for films)
    const baseDistance = 40; // Initial distance from axis for level 0
    const levelStep = 100; // Additional distance for each subsequent level

    const totalDistance = baseDistance + currentLevel * levelStep;

    result[i].offsetY = totalDistance;
    result[i].connectorHeight = totalDistance;
  }

  return result;
};

const positionedEvents = computed(() => {
  const positioned = events.value.map((event) => ({
    ...event,
    position: calculatePosition(event.date),
  }));
  return resolveCollisions(positioned);
});

const positionedFilms = computed(() => {
  const positioned = films.value.map((film) => {
    // Usar fecha específica del evento si está disponible, sino calcular el punto medio
    let eventDate;

    if (film.eventDate) {
      // Si tiene fecha específica del evento
      eventDate = film.eventDate;
    } else {
      // Calcular el punto medio del período del evento
      const startYear = film.eventYears.start;
      const endYear = film.eventYears.end;

      if (startYear === endYear) {
        // Si es un solo año, posicionar a mitad del año
        eventDate = `${startYear}-06-15`;
      } else {
        // Calcular punto medio entre inicio y fin
        const midYear = (startYear + endYear) / 2;
        const year = Math.floor(midYear);
        const monthProgress = (midYear - year) * 12;
        const month = Math.floor(monthProgress) + 1;
        eventDate = `${year}-${String(month).padStart(2, "0")}-15`;
      }
    }

    return {
      ...film,
      position: calculatePosition(eventDate),
      displayEventDate: eventDate,
    };
  });
  return resolveCollisions(positioned);
});

// Formatters
const formatDate = (dateString) => {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatFilmDate = (film) => {
  return film.year;
};

const formatEventPeriod = (film) => {
  if (film.eventYears.start === film.eventYears.end) {
    return film.eventYears.start;
  }
  return `${film.eventYears.start}-${film.eventYears.end}`;
};

const selectFilm = (film) => {
  selectedFilm.value = selectedFilm.value?.id === film.id ? null : film;
};

const toggleFilmPopup = (film) => {
  mobileSelectedFilm.value = film;
};
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.timeline-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 50%,
    rgba(25, 30, 35, 0.95) 100%
  );
  color: $text-primary;
  font-family: "Inter", sans-serif;
  overflow-x: hidden;
  position: relative;
  padding-top: 120px;

  @include mobile {
    padding-top: 80px;
    padding-bottom: 120px;
  }
}

.world-map-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.03;
  pointer-events: none;
  filter: invert(1);
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.header-content {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: $z-dropdown;
  padding: 0 $spacing-lg;

  @include mobile {
    margin-bottom: $spacing-lg;
    padding: 0 $spacing-md;
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 $spacing-xs 0;
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      rgba(255, 255, 255, 0.85) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;

    @include mobile {
      font-size: 1.75rem;
    }

    @include mobile-small {
      font-size: 1.5rem;
    }
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 300;
    margin: 0 0 12px 0;
    color: $text-secondary;
    letter-spacing: 4px;
    text-transform: uppercase;

    @include mobile {
      font-size: 0.85rem;
      letter-spacing: 2px;
    }
  }
}

.period-badge {
  display: inline-block;
  padding: 6px $spacing-md;
  background: rgba($beige, 0.12);
  border: 1px solid rgba($beige, 0.25);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: $beige;
  letter-spacing: 2px;
  margin-bottom: $spacing-md;

  @include mobile {
    font-size: 0.75rem;
    padding: 4px 12px;
    letter-spacing: 1px;
  }
}

.subtitle {
  color: $text-muted;
  font-size: 1rem;
  margin: 0;

  @include mobile {
    font-size: 0.85rem;
    display: none;
  }
}

// Legend
.legend {
  display: flex;
  justify-content: center;
  gap: $spacing-xl;
  margin-bottom: $spacing-lg;
  position: relative;
  z-index: $z-dropdown;

  @include mobile {
    gap: $spacing-lg;
    margin-bottom: $spacing-md;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.85rem;
  color: $text-secondary;

  @include mobile {
    font-size: 0.75rem;
    gap: $spacing-xs;
  }
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;

  @include mobile {
    width: 10px;
    height: 10px;
  }

  &.event-dot {
    background: $danger;
    box-shadow: 0 0 10px rgba($danger, 0.5);
  }

  &.film-dot {
    background: $beige;
    box-shadow: 0 0 10px rgba($beige, 0.5);
  }
}

// ===== MOBILE TIMELINE =====
.mobile-timeline {
  display: none;
  padding: 0 $spacing-md;
  padding-bottom: 80px;

  @include mobile {
    display: block;
  }
}

.mobile-timeline-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-md;
  margin-bottom: $spacing-sm;
  transition: all $transition-normal;

  &.event-card {
    border-left: 3px solid $danger;

    .mobile-card-icon {
      background: rgba($danger, 0.15);
      color: #fca5a5;
    }
  }

  &.film-card {
    border-left: 3px solid $beige;
    cursor: pointer;

    .mobile-card-icon {
      background: rgba($beige, 0.15);
      color: $beige;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.mobile-card-icon {
  width: 44px;
  height: 44px;
  border-radius: $border-radius-sm;
  @include flex-center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.mobile-card-content {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: $text-primary;
    @include line-clamp(1);
  }
}

.mobile-card-date {
  font-size: 0.75rem;
  color: $text-muted;
  display: block;
  margin-bottom: 2px;
}

.mobile-card-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.event-badge {
    background: rgba($danger, 0.2);
    color: #fca5a5;
  }

  &.film-badge {
    background: rgba($beige, 0.2);
    color: $beige;
  }
}

.empty-state {
  text-align: center;
  padding: 60px $spacing-lg;
  color: $text-muted;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: $spacing-md;
  opacity: 0.5;
}

// ===== MOBILE FILM MODAL =====
.mobile-film-modal {
  @include fixed-fill;
  background: rgba(0, 0, 0, 0.85);
  z-index: $z-modal;
  @include flex-center;
  padding: $spacing-md;
  backdrop-filter: blur(8px);
}

.mobile-modal-content {
  background: $bg-dark;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.mobile-modal-close {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: $text-primary;
  font-size: 1.5rem;
  @include flex-center;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.mobile-modal-body {
  padding: $spacing-lg;
}

.mobile-modal-poster {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-md;
}

.mobile-modal-info {
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 $spacing-xs 0;
    color: $text-primary;
  }
}

.mobile-modal-year {
  font-size: 0.9rem;
  color: $beige;
  margin: 0 0 $spacing-sm 0;
}

.mobile-modal-meta {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  font-size: 0.85rem;

  .imdb-rating {
    color: $beige;
    font-weight: 600;
  }

  .country {
    color: $text-secondary;
  }
}

.mobile-modal-desc {
  font-size: 0.9rem;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
}

// Modal Transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .mobile-modal-content {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .mobile-modal-content {
    transform: translateY(20px) scale(0.95);
  }
}

// ===== DESKTOP TIMELINE =====
.timeline-container {
  position: relative;
  height: 700px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @include mobile {
    display: none;
  }
}

// Axis
.timeline-axis {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  z-index: $z-base;
  transform: translateY(-50%);
}

.axis-line {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.year-marker {
  position: absolute;
  top: -10px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.year-tick {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: $spacing-sm;
}

.year-label {
  color: $text-secondary;
  font-size: 0.9rem;
  font-weight: 500;
}

// Timeline Sections
.timeline-section {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: visible;
}

.events-section {
  top: 0;
}

.films-section {
  top: 50%;
}

// Cards Common
.timeline-card {
  position: absolute;
  width: 220px;
  transform: translateX(-50%);
  cursor: pointer;
}

.card-body {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: $border-radius-md;
  backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow: $shadow-md;
  transition: transform $transition-normal, box-shadow $transition-normal;
  position: relative;
  z-index: 2;
}

.card-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.card-text {
  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
    color: $text-primary;
  }
}

.card-date {
  font-size: 0.75rem;
  margin: $spacing-xs 0 0 0;
  opacity: 0.8;
}

// Event Cards (Red)
.event-card {
  .card-body {
    background: rgba(69, 10, 10, 0.8);
    border-color: $danger;
  }

  .card-icon-wrapper {
    background: rgba($danger, 0.2);
    color: #fca5a5;
  }

  .card-date {
    color: #fca5a5;
  }

  &:hover {
    z-index: 50 !important;

    .card-body {
      transform: scale(1.05);
      box-shadow: 0 10px 40px rgba($danger, 0.6);
    }
  }
}

// Film Cards (Beige - colores apagados)
.film-card {
  .card-body {
    background: rgba(50, 40, 30, 0.85);
    border-color: $beige;
  }

  .card-icon-wrapper {
    background: rgba($beige, 0.2);
    color: $beige-light;
  }

  .card-date {
    color: $beige-light;
  }

  // Hover state (only when not active)
  &:hover:not(.active) {
    z-index: 50 !important;

    .card-body {
      transform: scale(1.05);
      box-shadow: 0 10px 40px rgba($beige, 0.5);
    }
  }

  // Active state - always on top
  &.active {
    z-index: 9999 !important; // Ensure active card with popup is above everything

    .card-body {
      background: rgba($beige, 0.15);
      box-shadow: 0 0 30px rgba($beige, 0.3);
      border-color: $beige-light;
    }

    // Keep z-index even on hover when active
    &:hover {
      z-index: 9999 !important;
    }
  }
}

// Connectors
.connector-line {
  position: absolute;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-50%);
  z-index: -1;
  pointer-events: none;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: $z-base;
}

// Event Connectors (Top)
.events-section .event-card {
  .connector-line {
    top: 100%;
    transform-origin: top;
  }

  .timeline-dot {
    top: 100%;
    background: $danger;
    box-shadow: 0 0 10px rgba($danger, 0.8);
  }
}

// Film Connectors (Bottom)
.films-section .film-card {
  .connector-line {
    bottom: 100%;
    transform-origin: bottom;
  }

  .timeline-dot {
    bottom: 100%;
    background: $beige;
    box-shadow: 0 0 10px rgba($beige, 0.8);
  }
}

// Popup Modal
.film-popup {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background: $bg-dark;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-lg;
  z-index: 9999; // Higher than timeline-nav to appear above it
  backdrop-filter: blur(20px);
  animation: fadeIn $transition-normal ease;
}

.close-btn {
  position: absolute;
  top: $spacing-sm;
  right: 12px;
  background: none;
  border: none;
  color: $text-secondary;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color $transition-fast;

  &:hover {
    color: $text-primary;
  }
}

.popup-content {
  display: flex;
  gap: $spacing-md;
}

.popup-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: $border-radius-sm;
}

.popup-info {
  flex: 1;

  h4 {
    margin: 0 0 $spacing-sm 0;
    font-size: 1rem;
    color: $text-primary;
  }
}

.popup-desc {
  font-size: 0.75rem;
  color: $text-secondary;
  margin-bottom: 12px;
  line-height: 1.4;
  @include line-clamp(3);
}

.popup-actions {
  display: flex;
  gap: $spacing-sm;
}

.btn-primary,
.btn-secondary {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all $transition-fast;
}

.btn-primary {
  background: $beige;
  color: $bg-darker;

  &:hover {
    background: $beige-light;
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: $text-primary;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

// Bottom Nav
.timeline-nav {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: $bg-dark;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  z-index: $z-modal;
  box-shadow: $shadow-lg;

  @include mobile {
    bottom: 20px;
    left: $spacing-sm;
    right: $spacing-sm;
    transform: none;
    padding: 4px;
    gap: 4px;
    @include safe-area-bottom;
  }
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-md;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-secondary;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  @include mobile {
    width: 44px;
    height: 44px;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .arrow {
    line-height: 1;
  }
}

.year-ranges {
  display: flex;
  gap: $spacing-xs;

  @include mobile {
    flex: 1;
    gap: 2px;
  }
}

.range-btn {
  position: relative;
  padding: 10px $spacing-lg;
  border-radius: $border-radius-sm;
  font-size: 0.9rem;
  font-weight: 500;
  color: $text-muted;
  cursor: pointer;
  transition: all $transition-normal;
  background: transparent;
  border: none;
  overflow: hidden;

  @include mobile {
    flex: 1;
    padding: 10px 8px;
    font-size: 0.75rem;
  }

  @include mobile-small {
    font-size: 0.7rem;
    padding: 10px 4px;
  }

  &:hover {
    color: $text-secondary;
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    color: $text-primary;
    background: rgba($beige, 0.15);

    .range-indicator {
      transform: scaleX(1);
    }
  }
}

.range-indicator {
  position: absolute;
  bottom: $spacing-xs;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, $beige, $beige-light);
  border-radius: 2px;
  transform: scaleX(0);
  transition: transform $transition-normal;
}

.range-label {
  position: relative;
  z-index: $z-base;
  letter-spacing: 1px;

  @include mobile {
    letter-spacing: 0;
  }
}

// Period info
.period-info {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: $z-sticky;

  @include mobile {
    bottom: 95px;
  }
}

.info-text {
  font-size: 0.8rem;
  color: $text-muted;
  background: $bg-dark;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  @include mobile {
    font-size: 0.75rem;
    padding: 4px 12px;
  }
}

// Card Transitions
.card-enter-active,
.card-leave-active {
  transition: all 0.4s ease;
  transition-delay: var(--delay, 0s);
}

.card-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.card-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

// Mobile Card Transitions
.mobile-card-enter-active,
.mobile-card-leave-active {
  transition: all 0.3s ease;
}

.mobile-card-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.mobile-card-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// Popup Transitions
.popup-enter-active,
.popup-leave-active {
  transition: all $transition-normal;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

// Event period styling for films
.event-period {
  font-size: 0.7rem;
  opacity: 0.7;
}

// Popup enhancements
.popup-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 0.8rem;
}

.imdb-rating {
  color: $beige;
  font-weight: 600;
}

.country {
  color: $text-secondary;
}
</style>

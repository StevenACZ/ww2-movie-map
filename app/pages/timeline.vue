<template>
  <main class="timeline-page" role="main" aria-label="WW2 Interactive Timeline">
    <!-- Background Map -->
    <div class="world-map-bg" aria-hidden="true"></div>

    <!-- Subtle grid pattern -->
    <div class="grid-pattern" aria-hidden="true"></div>

    <header class="header-content">
      <span class="period-badge"
        >{{ visibleStartYear }} - {{ visibleEndYear }}</span
      >
      <h1>Interactive Timeline</h1>
      <h2>The War and Cinema</h2>
      <p class="subtitle">
        Explore key historical events and related film releases
      </p>
    </header>

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
        <TimelineMobileCard
          v-for="event in mobileTimelineItems.events"
          :key="'event-' + event.id"
          :item="event"
          type="event"
        />

        <!-- Films -->
        <TimelineMobileCard
          v-for="film in mobileTimelineItems.films"
          :key="'film-' + film.id"
          :item="film"
          type="film"
          @select="toggleFilmPopup"
        />
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
          <TimelineEventCard
            v-for="(event, index) in positionedEvents"
            :key="event.id"
            :event="event"
            :index="index"
          />
        </TransitionGroup>
      </div>

      <!-- Films Section (Bottom Half) -->
      <div class="timeline-section films-section">
        <TransitionGroup name="card">
          <TimelineFilmCard
            v-for="(film, index) in positionedFilms"
            :key="film.id"
            :film="film"
            :index="index"
            :is-selected="selectedFilm?.id === film.id"
            @select="selectFilm"
            @open-trailer="openTrailer"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Mobile Film Popup Modal -->
    <TimelineMobileModal
      :film="mobileSelectedFilm"
      @close="mobileSelectedFilm = null"
    />

    <!-- Bottom Navigation -->
    <TimelineNav
      :periods="periods"
      :current-index="currentPeriodIndex"
      @prev="prevPeriod"
      @next="nextPeriod"
      @set-period="setPeriod"
    />

    <!-- Period info tooltip -->
    <footer class="period-info" role="status" aria-live="polite">
      <span class="info-text">
        {{ positionedEvents.length }} events •
        {{ positionedFilms.length }} films
      </span>
    </footer>

    <!-- Trailer Modal (Desktop Only) -->
    <TrailerModal
      :is-open="isTrailerOpen"
      :trailer-url="activeTrailerUrl"
      :film-title="activeFilmTitle"
      @close="closeTrailer"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTimelinePositioning } from "../composables/useTimelinePositioning";
import type { Film } from "../../types";
import type {
  HistoricalEvent,
  TimelinePeriod,
  PositionedFilm,
} from "../../types/timeline";

// Import JSON data
import filmsData from "../../data/films.json";
import eventsData from "../../data/historical-events.json";

// Import components
import TimelineEventCard from "../components/timeline/TimelineEventCard.vue";
import TimelineFilmCard from "../components/timeline/TimelineFilmCard.vue";
import TimelineMobileCard from "../components/timeline/TimelineMobileCard.vue";
import TimelineMobileModal from "../components/timeline/TimelineMobileModal.vue";
import TimelineNav from "../components/timeline/TimelineNav.vue";

// SEO Configuration for Timeline Page
useSeoMeta({
  title: "WW2 Interactive Timeline",
  ogTitle: "World War II Timeline - Historical Events & Films (1936-1945)",
  description:
    "Navigate through World War II with our interactive timeline. Explore key historical events from 1936-1945 and discover the films that bring these stories to life.",
  ogDescription:
    "Interactive WW2 timeline showing key historical events and related films from 1936-1945. Explore D-Day, Pearl Harbor, and more.",
  ogUrl: "https://ww2.stevenacz.com/timeline",
  ogImage: "https://ww2.stevenacz.com/og-image.png",
  twitterCard: "summary_large_image",
  twitterTitle: "WW2 Interactive Timeline - Events & Films",
  twitterDescription:
    "Explore World War II events and related films in an interactive timeline from 1936-1945.",
  twitterImage: "https://ww2.stevenacz.com/og-image.png",
});

// Canonical URL and Structured Data
useHead({
  link: [{ rel: "canonical", href: "https://ww2.stevenacz.com/timeline" }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "World War II Interactive Timeline",
        description:
          "Interactive timeline exploring key events of World War II (1936-1945) and related cinema.",
        url: "https://ww2.stevenacz.com/timeline",
        isPartOf: {
          "@type": "WebSite",
          name: "WW2 Film Map",
          url: "https://ww2.stevenacz.com",
        },
        about: {
          "@type": "HistoricalEvent",
          name: "World War II",
          startDate: "1939-09-01",
          endDate: "1945-09-02",
          description:
            "The Second World War, a global conflict from 1939 to 1945",
          sameAs: "https://en.wikipedia.org/wiki/World_War_II",
        },
        mainEntity: {
          "@type": "ItemList",
          name: "WW2 Timeline Events",
          description: "Chronological list of significant World War II events",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
        },
      }),
    },
  ],
});

// State
const events = ref<HistoricalEvent[]>([]);
const films = ref<Film[]>([]);
const selectedFilm = ref<PositionedFilm | null>(null);
const mobileSelectedFilm = ref<PositionedFilm | null>(null);
const currentPeriodIndex = ref(2); // Start with last period (1942-1945)
const isMobile = ref(false);

// Trailer Modal State
const isTrailerOpen = ref(false);
const activeTrailerUrl = ref("");
const activeFilmTitle = ref("");

// Films to display on timeline (selected IDs from main JSON)
const timelineFilmIds = [
  "the-eight-hundred-2020",
  "dunkirk-2017",
  "das-boot-1981",
  "tora-tora-tora-1970",
  "schindlers-list-1993",
  "come-and-see-1985",
  "saving-private-ryan-1998",
  "downfall-2004",
  "hacksaw-ridge-2016",
];

// Periods Configuration - 3 years per slide
const periods: TimelinePeriod[] = [
  { label: "1936-1938", start: 1936, end: 1938 },
  { label: "1939-1941", start: 1939, end: 1941 },
  { label: "1942-1945", start: 1942, end: 1945 },
];

// Use the timeline positioning composable
const {
  visibleStartYear,
  visibleEndYear,
  visibleYears,
  getYearPosition,
  positionedEvents,
  positionedFilms,
} = useTimelinePositioning({
  events,
  films,
  currentPeriodIndex,
  periods,
});

// Mobile timeline items (sorted by date)
const mobileTimelineItems = computed(() => ({
  events: positionedEvents.value,
  films: positionedFilms.value,
}));

// Check mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Load data from imported JSON files
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Use imported data directly
  events.value = eventsData.events as HistoricalEvent[];
  films.value = filmsData.films.filter((film: Film) =>
    timelineFilmIds.includes(film.id)
  );

  // Click outside handler to close modal
  document.addEventListener("click", handleClickOutside);
});

// Close modal when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (selectedFilm.value) {
    const popup = document.querySelector(".film-popup");
    const filmCards = document.querySelectorAll(".film-card");

    let clickedOnCard = false;
    filmCards.forEach((card) => {
      if (card.contains(event.target as Node)) {
        clickedOnCard = true;
      }
    });

    if (!clickedOnCard && popup && !popup.contains(event.target as Node)) {
      selectedFilm.value = null;
    }
  }
};

// Cleanup event listeners
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", checkMobile);
});

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

const setPeriod = (index: number) => {
  currentPeriodIndex.value = index;
};

// Film selection
const selectFilm = (film: PositionedFilm) => {
  selectedFilm.value = selectedFilm.value?.id === film.id ? null : film;
};

const toggleFilmPopup = (film: PositionedFilm) => {
  mobileSelectedFilm.value = film;
};

// Trailer handling - Desktop shows modal, Mobile redirects to YouTube
const openTrailer = (film: PositionedFilm) => {
  if (isMobile.value) {
    window.open(film.trailerUrl, "_blank");
  } else {
    activeTrailerUrl.value = film.trailerUrl || "";
    activeFilmTitle.value = `${film.title} (${film.year})`;
    isTrailerOpen.value = true;
    selectedFilm.value = null;
  }
};

const closeTrailer = () => {
  isTrailerOpen.value = false;
  activeTrailerUrl.value = "";
  activeFilmTitle.value = "";
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

// Mobile Timeline
.mobile-timeline {
  display: none;
  padding: 0 $spacing-md;
  padding-bottom: 80px;

  @include mobile {
    display: block;
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

// Desktop Timeline
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
</style>

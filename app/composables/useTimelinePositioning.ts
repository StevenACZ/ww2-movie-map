import { computed } from "vue";
import type { Ref } from "vue";
import type { Film } from "../../types";
import type {
  HistoricalEvent,
  TimelinePeriod,
  PositionedEvent,
  PositionedFilm,
} from "../../types/timeline";

interface UseTimelinePositioningOptions {
  events: Ref<HistoricalEvent[]>;
  films: Ref<Film[]>;
  currentPeriodIndex: Ref<number>;
  periods: TimelinePeriod[];
}

const fallbackPeriod: TimelinePeriod = {
  label: "1936-1945",
  start: 1936,
  end: 1945,
};

export const useTimelinePositioning = ({
  events,
  films,
  currentPeriodIndex,
  periods,
}: UseTimelinePositioningOptions) => {
  const currentPeriod = computed(
    () => periods[currentPeriodIndex.value] ?? periods[0] ?? fallbackPeriod,
  );

  // Computed values for current period
  const visibleStartYear = computed(() => currentPeriod.value.start);
  const visibleEndYear = computed(() => currentPeriod.value.end);
  const totalVisibleYears = computed(
    () => visibleEndYear.value - visibleStartYear.value + 1,
  );

  // Generate visible years array
  const visibleYears = computed(() => {
    const arr: number[] = [];
    for (let y = visibleStartYear.value; y <= visibleEndYear.value; y++) {
      arr.push(y);
    }
    return arr;
  });

  /**
   * Calculate position percentage for a given date string
   * Uses precise date calculation for accurate timeline placement
   */
  const calculatePosition = (dateString: string): number => {
    const date = new Date(dateString);
    const year = date.getFullYear();

    // Filter items outside the visible range
    if (year < visibleStartYear.value || year > visibleEndYear.value)
      return -999;

    // Calculate total days from the start of the visible range
    const startOfRange = new Date(visibleStartYear.value, 0, 1);
    const endOfRange = new Date(visibleEndYear.value + 1, 0, 1);

    const totalDaysInRange =
      (endOfRange.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24);
    const daysFromStart =
      (date.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate progress percentage within the range
    const progress = daysFromStart / totalDaysInRange;

    // Timeline occupies 5% to 95% of width (leaving margins)
    const marginLeft = 5;
    const usableWidth = 90;

    return marginLeft + progress * usableWidth;
  };

  /**
   * Calculate position for year markers
   */
  const getYearPosition = (year: number): number => {
    const startOfRange = new Date(visibleStartYear.value, 0, 1);
    const endOfRange = new Date(visibleEndYear.value + 1, 0, 1);
    const yearDate = new Date(year, 0, 1);

    const totalDaysInRange =
      (endOfRange.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24);
    const daysFromStart =
      (yearDate.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24);

    const progress = daysFromStart / totalDaysInRange;

    const marginLeft = 5;
    const usableWidth = 90;

    return marginLeft + progress * usableWidth;
  };

  /**
   * Resolve collisions between overlapping timeline cards
   * Uses level-based stacking to prevent overlaps
   */
  const resolveCollisions = <T extends { position: number }>(
    items: T[],
  ): (T & { offsetY: number; connectorHeight: number; level: number })[] => {
    if (items.length === 0) return [];

    // Filter visible items first
    const visibleItems = items.filter(
      (item) => item.position > -10 && item.position < 110,
    );

    const result = visibleItems.map((item) => ({
      ...item,
      offsetY: 0,
      connectorHeight: 40,
      level: 0,
    }));

    // Sort by position (left to right)
    result.sort((a, b) => a.position - b.position);

    // Minimum distance between cards (in percentage) to trigger a level change
    const minDistance = 22;

    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      if (!current) continue;

      let currentLevel = 0;
      let hasCollision = true;

      // Try to find the lowest level that doesn't collide with previous neighbors
      while (hasCollision && currentLevel < 5) {
        hasCollision = false;

        // Look back at previous items to check for overlap
        for (let j = 0; j < i; j++) {
          const previous = result[j];
          if (!previous) continue;

          const distance = Math.abs(current.position - previous.position);

          // If they are close horizontally AND on the same level, it's a collision
          if (distance < minDistance && previous.level === currentLevel) {
            hasCollision = true;
            break;
          }
        }

        if (hasCollision) {
          currentLevel++;
        }
      }

      current.level = currentLevel;

      // Calculate POSITIVE offset (distance from axis)
      const baseDistance = 40;
      const levelStep = 100;
      const totalDistance = baseDistance + currentLevel * levelStep;

      current.offsetY = totalDistance;
      current.connectorHeight = totalDistance;
    }

    return result;
  };

  // Positioned events with collision resolution
  const positionedEvents = computed<PositionedEvent[]>(() => {
    const positioned = events.value.map((event) => ({
      ...event,
      position: calculatePosition(event.date),
    }));
    return resolveCollisions(positioned) as PositionedEvent[];
  });

  // Positioned films with collision resolution
  const positionedFilms = computed<PositionedFilm[]>(() => {
    const positioned = films.value.map((film) => {
      // Use event-specific date if available, otherwise calculate midpoint
      let eventDate: string;

      if (film.eventDate) {
        eventDate = film.eventDate;
      } else {
        const startYear = film.eventYears.start;
        const endYear = film.eventYears.end;

        if (startYear === endYear) {
          eventDate = `${startYear}-06-15`;
        } else {
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

    return resolveCollisions(positioned) as PositionedFilm[];
  });

  return {
    // Period data
    visibleStartYear,
    visibleEndYear,
    totalVisibleYears,
    visibleYears,
    // Positioning functions
    calculatePosition,
    getYearPosition,
    resolveCollisions,
    // Positioned items
    positionedEvents,
    positionedFilms,
  };
};

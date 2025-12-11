import type { Film } from "./index";

// Historical Event from events JSON
export interface HistoricalEvent {
  id: string;
  date: string;
  title: string;
  icon?: string;
}

// Period configuration for timeline navigation
export interface TimelinePeriod {
  label: string;
  start: number;
  end: number;
}

// Positioned item with collision-resolved layout data
export interface PositionedItem {
  position: number;
  offsetY: number;
  connectorHeight: number;
  level: number;
}

// Positioned historical event
export interface PositionedEvent extends HistoricalEvent, PositionedItem {}

// Positioned film extends Film with position data
export interface PositionedFilm extends Film, PositionedItem {
  displayEventDate: string;
}

// Props for timeline cards
export interface TimelineEventCardProps {
  event: PositionedEvent;
  index: number;
}

export interface TimelineFilmCardProps {
  film: PositionedFilm;
  index: number;
  isSelected: boolean;
  isMobile: boolean;
}

// Emits for timeline cards
export interface TimelineFilmCardEmits {
  (e: "select", film: PositionedFilm): void;
  (e: "openTrailer", film: PositionedFilm): void;
}

// Mobile timeline items grouped
export interface MobileTimelineItems {
  events: PositionedEvent[];
  films: PositionedFilm[];
}

import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { Film } from "../../types";

export interface SortOption {
  value: string;
  label: string;
}

export const sortOptions: SortOption[] = [
  { value: "rating", label: "Top Rated" },
  { value: "year", label: "Newest" },
  { value: "title", label: "A-Z" },
  { value: "period", label: "War Period" },
];

interface UseFilmsFilterOptions {
  films: Film[];
}

export const useFilmsFilter = ({ films }: UseFilmsFilterOptions) => {
  const searchQuery = ref("");
  const sortBy = ref("rating");

  const filteredFilms = computed(() => {
    let result = [...films];

    // Filter by search
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (film) =>
          film.title.toLowerCase().includes(query) ||
          film.synopsis.toLowerCase().includes(query) ||
          film.country.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy.value) {
        case "year":
          return b.year - a.year;
        case "title":
          return a.title.localeCompare(b.title);
        case "rating":
          return b.imdbRating - a.imdbRating;
        case "period":
          return a.eventYears.start - b.eventYears.start;
        default:
          return 0;
      }
    });

    return result;
  });

  const clearSearch = () => {
    searchQuery.value = "";
  };

  return {
    searchQuery,
    sortBy,
    sortOptions,
    filteredFilms,
    clearSearch,
  };
};

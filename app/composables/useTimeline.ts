import { ref, computed } from 'vue'
import type { Film } from '../types'
import filmsData from '../data/films.json'

const startYear = ref(1936)
const endYear = ref(1945)

export const useTimeline = () => {
  const setYearRange = (start: number, end: number) => {
    startYear.value = Math.max(1936, Math.min(start, 1945))
    endYear.value = Math.max(1936, Math.min(end, 1945))
    
    // Ensure startYear is not greater than endYear
    if (startYear.value > endYear.value) {
      const temp = startYear.value
      startYear.value = endYear.value
      endYear.value = temp
    }
  }

  const resetYearRange = () => {
    startYear.value = 1936
    endYear.value = 1945
  }

  const filteredFilms = computed<Film[]>(() => {
    return filmsData.films.filter((film: Film) => {
      // A film is shown if its event years overlap with the selected timeline range
      // Overlap occurs when: film.eventYears.start <= timeline.endYear AND film.eventYears.end >= timeline.startYear
      return film.eventYears.start <= endYear.value && film.eventYears.end >= startYear.value
    })
  })

  return {
    startYear,
    endYear,
    setYearRange,
    resetYearRange,
    filteredFilms
  }
}

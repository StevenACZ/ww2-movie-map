export interface Location {
  name: string
  coordinates: [number, number] // [longitude, latitude]
  type: 'city' | 'region' | 'country'
  isPrimary: boolean
}

export interface Film {
  id: string
  title: {
    en: string
    es: string
  }
  year: number
  eventYears: {
    start: number
    end: number
  }
  imdbRating: number
  country: string
  poster: string
  synopsis: {
    en: string
    es: string
  }
  locations: Location[]
}

export interface FilmsData {
  films: Film[]
}

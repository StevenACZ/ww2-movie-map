export interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: "city" | "region" | "country";
  isPrimary: boolean;
}

export interface Film {
  id: string;
  title: string;
  year: number;
  eventYears: {
    start: number;
    end: number;
  };
  eventDate?: string;
  imdbRating: number;
  country: string;
  poster: string;
  synopsis: string;
  locations: Location[];
  // External links
  wikipediaUrl?: string;
  imdbUrl?: string;
  trailerUrl?: string;
}

export interface FilmsData {
  films: Film[];
}

# WW2 Map Films - Data Model

## TypeScript Interfaces

### Film Interface

```typescript
interface Film {
  id: string                    // Unique identifier (e.g., "stalingrad-1993")
  title: {
    en: string                  // English title
    es: string                  // Spanish title
  }
  year: number                  // Release year (e.g., 1993)
  eventYears: {
    start: number               // Year when events begin (e.g., 1942)
    end: number                 // Year when events end (e.g., 1943)
  }
  imdbRating: number            // IMDb rating (e.g., 7.5)
  country: string               // Country of production (e.g., "Germany")
  poster: string                // Path to poster image (e.g., "/posters/stalingrad-1993.jpg")
  synopsis: {
    en: string                  // English synopsis
    es: string                  // Spanish synopsis
  }
  locations: Location[]         // Array of filming/event locations
}
```

### Location Interface

```typescript
interface Location {
  name: string                  // Location name (e.g., "Stalingrad")
  coordinates: [number, number] // [longitude, latitude] (e.g., [44.516, 48.708])
  type: 'city' | 'region' | 'country'  // Type of location
  isPrimary: boolean            // Whether this is the main location for the film
}
```

### Films Collection

```typescript
interface FilmsData {
  films: Film[]
}
```

---

## JSON Structure

### Complete Example: films.json

```json
{
  "films": [
    {
      "id": "stalingrad-1993",
      "title": {
        "en": "Stalingrad",
        "es": "Stalingrado"
      },
      "year": 1993,
      "eventYears": {
        "start": 1942,
        "end": 1943
      },
      "imdbRating": 7.5,
      "country": "Germany",
      "poster": "/posters/stalingrad-1993.jpg",
      "synopsis": {
        "en": "German soldiers face the brutal reality of the Battle of Stalingrad during World War II.",
        "es": "Soldados alemanes enfrentan la brutal realidad de la Batalla de Stalingrado durante la Segunda Guerra Mundial."
      },
      "locations": [
        {
          "name": "Stalingrad",
          "coordinates": [44.516, 48.708],
          "type": "city",
          "isPrimary": true
        }
      ]
    },
    {
      "id": "saving-private-ryan-1998",
      "title": {
        "en": "Saving Private Ryan",
        "es": "Salvar al Soldado Ryan"
      },
      "year": 1998,
      "eventYears": {
        "start": 1944,
        "end": 1944
      },
      "imdbRating": 8.6,
      "country": "United States",
      "poster": "/posters/saving-private-ryan-1998.jpg",
      "synopsis": {
        "en": "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",
        "es": "Tras el desembarco de Normandía, un grupo de soldados estadounidenses va tras las líneas enemigas para rescatar a un paracaidista cuyos hermanos han muerto en combate."
      },
      "locations": [
        {
          "name": "Normandy",
          "coordinates": [-0.3707, 49.3990],
          "type": "region",
          "isPrimary": true
        },
        {
          "name": "Omaha Beach",
          "coordinates": [-0.8776, 49.3711],
          "type": "city",
          "isPrimary": true
        }
      ]
    },
    {
      "id": "dunkirk-2017",
      "title": {
        "en": "Dunkirk",
        "es": "Dunkerque"
      },
      "year": 2017,
      "eventYears": {
        "start": 1940,
        "end": 1940
      },
      "imdbRating": 7.8,
      "country": "United Kingdom",
      "poster": "/posters/dunkirk-2017.jpg",
      "synopsis": {
        "en": "Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II.",
        "es": "Soldados aliados de Bélgica, la Commonwealth británica y Francia son rodeados por el ejército alemán y evacuados durante una feroz batalla en la Segunda Guerra Mundial."
      },
      "locations": [
        {
          "name": "Dunkirk",
          "coordinates": [2.3767, 51.0343],
          "type": "city",
          "isPrimary": true
        }
      ]
    }
  ]
}
```

---

## Data Validation Rules

### Film Validation
- `id`: Must be unique, lowercase, hyphen-separated
- `title`: Both `en` and `es` required
- `year`: Between 1930 and present
- `eventYears.start`: Between 1936 and 1945
- `eventYears.end`: >= `eventYears.start`, <= 1945
- `imdbRating`: Between 0 and 10
- `country`: Non-empty string
- `poster`: Valid path to image file
- `synopsis`: Both `en` and `es` required, max 500 characters
- `locations`: At least 1 location required

### Location Validation
- `name`: Non-empty string
- `coordinates`: Valid [longitude, latitude] pair
  - Longitude: -180 to 180
  - Latitude: -90 to 90
- `type`: Must be 'city', 'region', or 'country'
- `isPrimary`: Boolean value
- At least one location per film must have `isPrimary: true`

---

## Coordinate Reference System

All coordinates use **WGS84** (EPSG:4326):
- Format: `[longitude, latitude]`
- Note: MapLibre GL JS uses `[lng, lat]` order (opposite of typical lat/lng)

### Example Coordinates

```typescript
// Correct format for MapLibre GL JS
const berlin: [number, number] = [13.4050, 52.5200]  // [lng, lat]

// Common locations
const locations = {
  berlin: [13.4050, 52.5200],
  paris: [2.3522, 48.8566],
  london: [-0.1276, 51.5074],
  moscow: [37.6173, 55.7558],
  warsaw: [21.0122, 52.2297],
  rome: [12.4964, 41.9028],
  stalingrad: [44.5167, 48.7083]
}
```

---

## Storage Location

### Development
- File: `data/films.json`
- Imported directly into components
- Version controlled

### Future (Production)
- Could be moved to CMS or database
- API endpoints for dynamic loading
- Caching strategy for performance

---

## Future Enhancements

### Additional Film Properties
```typescript
interface FilmExtended extends Film {
  director?: string
  cast?: string[]
  duration?: number              // minutes
  genres?: string[]
  trailerUrl?: string
  externalLinks?: {
    imdb?: string
    wikipedia?: string
    tmdb?: string
  }
  userRating?: number
  reviewCount?: number
  languages?: string[]
  productionCompanies?: string[]
}
```

### Battle/Event Data
```typescript
interface HistoricalEvent {
  id: string
  name: {
    en: string
    es: string
  }
  date: {
    start: string              // ISO date format
    end: string
  }
  type: 'battle' | 'campaign' | 'operation' | 'bombing'
  location: Location
  description: {
    en: string
    es: string
  }
  relatedFilms: string[]       // Film IDs
  casualties?: {
    axis?: number
    allies?: number
  }
}
```

### Timeline Data
```typescript
interface TimelineEvent {
  year: number
  month: number
  day?: number
  title: {
    en: string
    es: string
  }
  type: 'military' | 'political' | 'film-release'
  location?: Location
  relatedFilms?: string[]
}
```

---

## GeoJSON for Region Highlighting

### Structure for Country/Region Polygons

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Germany",
        "year": 1942
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [13.4050, 52.5200],
            [10.4515, 51.1657],
            ...
          ]
        ]
      }
    }
  ]
}
```

This will be used in Phase 2 for region highlighting when a film is selected.

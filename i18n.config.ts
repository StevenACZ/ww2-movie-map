export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      common: {
        close: 'Close',
        loading: 'Loading...',
        error: 'Error'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        english: 'English',
        spanish: 'Spanish'
      },
      timeline: {
        title: 'Timeline',
        yearRange: 'Year Range',
        from: 'From',
        to: 'To',
        reset: 'Reset'
      },
      film: {
        close: 'Close',
        year: 'Year',
        eventYears: 'Event Years',
        rating: 'Rating',
        country: 'Country',
        locations: 'Locations',
        viewDetails: 'View Details',
        primaryLocation: 'Primary Location'
      },
      selectedFilm: {
        viewDetails: 'View Details',
        year: 'Year',
        selected: 'Selected Film'
      },
      map: {
        title: 'WW2 Film Map',
        navigation: 'Use WASD or mouse to navigate'
      }
    },
    es: {
      common: {
        close: 'Cerrar',
        loading: 'Cargando...',
        error: 'Error'
      },
      settings: {
        title: 'Configuración',
        language: 'Idioma',
        english: 'Inglés',
        spanish: 'Español'
      },
      timeline: {
        title: 'Línea de Tiempo',
        yearRange: 'Rango de Años',
        from: 'Desde',
        to: 'Hasta',
        reset: 'Restablecer'
      },
      film: {
        close: 'Cerrar',
        year: 'Año',
        eventYears: 'Años del Evento',
        rating: 'Calificación',
        country: 'País',
        locations: 'Ubicaciones',
        viewDetails: 'Ver Detalles',
        primaryLocation: 'Ubicación Principal'
      },
      selectedFilm: {
        viewDetails: 'Ver Detalles',
        year: 'Año',
        selected: 'Película Seleccionada'
      },
      map: {
        title: 'Mapa de Películas WWII',
        navigation: 'Usa WASD o el ratón para navegar'
      }
    }
  }
}))

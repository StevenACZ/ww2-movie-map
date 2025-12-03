<template>
  <div class="timeline-page">
    <!-- Background Map -->
    <div class="world-map-bg"></div>
    
    <div class="header-content">
      <h1>Interactive Timeline: The War and Cinema</h1>
      <p>Explore key historical events and related film releases from 1939 to 1945.</p>
    </div>

    <div class="timeline-container" ref="timelineContainer">
      
      <!-- Timeline Axis (Center) -->
      <div class="timeline-axis">
        <div class="axis-line"></div>
        
        <!-- Year Markers -->
        <div 
          v-for="year in years" 
          :key="year"
          class="year-marker"
          :style="{ left: getYearPosition(year) + '%' }"
        >
          <div class="year-tick"></div>
          <div class="year-label">{{ year }}</div>
        </div>
      </div>

      <!-- Events Section (Top of Axis) -->
      <div class="timeline-layer events-layer">
        <div 
          v-for="(event, index) in positionedEvents" 
          :key="event.id"
          class="timeline-card event-card"
          :style="{ left: event.position + '%', bottom: 'calc(50% + ' + event.distance + 'px)' }"
        >
          <div class="card-body">
            <div class="card-icon-wrapper">
              <span class="card-icon">{{ event.icon || '⚔️' }}</span>
            </div>
            <div class="card-text">
              <h3>{{ event.title }}</h3>
              <p class="card-date">{{ formatDate(event.date) }}</p>
            </div>
          </div>
          <!-- Connector (Down to axis) -->
          <div class="connector-line" :style="{ height: event.distance + 'px' }"></div>
          <div class="timeline-dot" :style="{ top: 'calc(100% + ' + event.distance + 'px)' }"></div>
        </div>
      </div>

      <!-- Films Section (Bottom of Axis) -->
      <div class="timeline-layer films-layer">
        <div 
          v-for="(film, index) in positionedFilms" 
          :key="film.id"
          class="timeline-card film-card"
          :class="{ 'active': selectedFilm?.id === film.id }"
          :style="{ left: film.position + '%', top: 'calc(50% + ' + film.distance + 'px)' }"
          @click.stop="selectFilm(film)"
        >
          <!-- Connector (Up to axis) -->
          <div class="connector-line" :style="{ height: film.distance + 'px' }"></div>
          <div class="timeline-dot" :style="{ bottom: 'calc(100% + ' + film.distance + 'px)' }"></div>
          
          <div class="card-body">
            <div class="card-icon-wrapper">
              <span class="card-icon">🎬</span>
            </div>
            <div class="card-text">
              <h3>{{ film.title }}</h3>
              <p class="card-date">{{ formatFilmDate(film) }}</p>
            </div>
          </div>

          <!-- Detail Popup -->
          <div v-if="selectedFilm?.id === film.id" class="film-popup">
            <button class="close-btn" @click.stop="selectedFilm = null">×</button>
            <div class="popup-content">
              <img :src="film.poster" :alt="film.title" class="popup-poster" />
              <div class="popup-info">
                <h4>{{ film.title }} ({{ film.year }})</h4>
                <p class="popup-desc">{{ film.synopsis }}</p>
                <div class="popup-actions">
                  <button class="btn-primary">Watch Trailer</button>
                  <button class="btn-secondary">View Film Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="timeline-nav">
      <button class="nav-btn prev">‹</button>
      <div class="year-ranges">
        <span class="range">1939</span>
        <span class="range active">1940-1942</span>
        <span class="range">1943-1945</span>
      </div>
      <button class="nav-btn next">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// State
const events = ref([])
const films = ref([])
const selectedFilm = ref(null)

// Constants
const START_YEAR = 1939
const END_YEAR = 1945
const TOTAL_YEARS = END_YEAR - START_YEAR

// Generate years array
const years = computed(() => {
  const arr = []
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    arr.push(y)
  }
  return arr
})

// Load data
onMounted(async () => {
  try {
    const eventsResponse = await fetch('/data/historical-events.json')
    const eventsData = await eventsResponse.json()
    events.value = eventsData.events

    const filmsResponse = await fetch('/data/films-timeline.json')
    const filmsData = await filmsResponse.json()
    films.value = filmsData.films
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

// Positioning Logic
const calculatePosition = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  
  const yearProgress = year - START_YEAR
  const monthProgress = month / 12
  const dayProgress = day / 365
  
  const totalProgress = (yearProgress + monthProgress + dayProgress) / TOTAL_YEARS
  return 5 + (totalProgress * 90)
}

const getYearPosition = (year) => {
  return 5 + (((year - START_YEAR) / TOTAL_YEARS) * 90)
}

// Collision Detection & Spacing
const resolveCollisions = (items) => {
  if (items.length === 0) return []
  
  const result = items.map((item, index) => ({
    ...item,
    distance: 0, // Distance from axis
    level: 0
  }))
  
  result.sort((a, b) => a.position - b.position)
  
  const minDistance = 18 // % width of card
  
  for (let i = 0; i < result.length; i++) {
    let currentLevel = 0
    let hasCollision = true
    
    while (hasCollision && currentLevel < 4) {
      hasCollision = false
      for (let j = 0; j < i; j++) {
        const distance = Math.abs(result[i].position - result[j].position)
        if (distance < minDistance && result[j].level === currentLevel) {
          hasCollision = true
          break
        }
      }
      if (hasCollision) currentLevel++
    }
    
    result[i].level = currentLevel
    // Base distance from axis is 40px, each level adds 100px
    result[i].distance = 40 + (currentLevel * 100)
  }
  
  return result
}

const positionedEvents = computed(() => {
  const positioned = events.value.map(event => ({
    ...event,
    position: calculatePosition(event.date)
  }))
  return resolveCollisions(positioned)
})

const positionedFilms = computed(() => {
  const positioned = films.value.map(film => {
    const startYear = film.eventYears.start
    const endYear = film.eventYears.end
    const midYear = (startYear + endYear) / 2
    const midDate = `${Math.floor(midYear)}-06-15`
    
    return {
      ...film,
      position: calculatePosition(midDate)
    }
  })
  return resolveCollisions(positioned)
})

// Formatters
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const formatFilmDate = (film) => {
  return film.year
}

const selectFilm = (film) => {
  selectedFilm.value = selectedFilm.value?.id === film.id ? null : film
}
</script>

<style scoped>
.timeline-page {
  min-height: 100vh;
  background-color: #0f172a;
  color: white;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
  padding-top: 80px;
}

.world-map-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.05;
  pointer-events: none;
  filter: invert(1);
}

.header-content {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-content p {
  color: #94a3b8;
  font-size: 1.1rem;
}

.timeline-container {
  position: relative;
  height: 700px; /* Increased height for better spacing */
  width: 100%;
  margin: 0 auto;
}

/* Axis */
.timeline-axis {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  z-index: 1;
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
  margin-bottom: 8px;
}

.year-label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Cards Common */
.timeline-card {
  position: absolute;
  width: 220px;
  transform: translateX(-50%);
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-body {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
}

.card-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.card-text h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  color: white;
}

.card-date {
  font-size: 0.75rem;
  margin: 4px 0 0 0;
  opacity: 0.8;
}

/* Event Cards (Red) */
.event-card .card-body {
  background: rgba(69, 10, 10, 0.8);
  border-color: #ef4444;
}

.event-card .card-icon-wrapper {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.event-card .card-date {
  color: #fca5a5;
}

.event-card:hover {
  z-index: 50;
  transform: translateX(-50%) scale(1.05);
}

/* Film Cards (Gold) */
.film-card .card-body {
  background: rgba(66, 32, 6, 0.8);
  border-color: #f59e0b;
}

.film-card .card-icon-wrapper {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.film-card .card-date {
  color: #fcd34d;
}

.film-card.active .card-body {
  background: rgba(245, 158, 11, 0.15);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
  border-color: #fbbf24;
}

.film-card:hover {
  z-index: 50;
  transform: translateX(-50%) scale(1.05);
}

/* Connectors */
.connector-line {
  position: absolute;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-50%);
  z-index: 1;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateX(-50%) translateY(-50%); /* Center on axis */
  z-index: 5;
}

/* Event Connectors (Down from card) */
.event-card .connector-line {
  top: 100%;
}

.event-card .timeline-dot {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
}

/* Film Connectors (Up from card) */
.film-card .connector-line {
  bottom: 100%;
}

.film-card .timeline-dot {
  background: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
}

/* Popup Modal */
.film-popup {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 100;
  backdrop-filter: blur(20px);
  animation: fadeIn 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

.popup-content {
  display: flex;
  gap: 16px;
}

.popup-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.popup-info {
  flex: 1;
}

.popup-info h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: white;
}

.popup-desc {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popup-actions {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: white;
  color: #0f172a;
}

.btn-primary:hover {
  background: #e2e8f0;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Bottom Nav */
.timeline-nav {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 100;
}

.nav-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 12px;
}

.year-ranges {
  display: flex;
  gap: 4px;
}

.range {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.range.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.range:hover {
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>

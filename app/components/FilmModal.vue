<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="close">
    <div class="relative w-full max-w-4xl bg-stone-900 border border-stone-700 shadow-2xl rounded-lg overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
      
      <!-- Close Button -->
      <button @click="close" class="absolute top-4 right-4 z-10 text-stone-400 hover:text-white transition-colors" :aria-label="$t('film.close')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Poster Image -->
      <div class="w-full md:w-1/3 h-64 md:h-auto relative">
        <img :src="film.poster" :alt="currentTitle" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent md:bg-gradient-to-r"></div>
      </div>

      <!-- Content -->
      <div class="w-full md:w-2/3 p-8 overflow-y-auto text-stone-300">
        <div class="mb-6">
          <h2 class="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{{ currentTitle }}</h2>
          <h3 v-if="alternateTitle !== currentTitle" class="text-xl text-stone-500 font-serif italic">{{ alternateTitle }}</h3>
        </div>

        <div class="flex flex-wrap gap-4 mb-6 text-sm">
          <span class="px-3 py-1 bg-stone-800 border border-stone-600 rounded text-stone-300">
            {{ $t('film.year') }}: {{ film.year }}
          </span>
          <span class="px-3 py-1 bg-stone-800 border border-stone-600 rounded text-stone-300">
            {{ $t('film.eventYears') }}: {{ film.eventYears.start }}-{{ film.eventYears.end }}
          </span>
          <span class="px-3 py-1 bg-stone-800 border border-stone-600 rounded text-stone-300">
            {{ $t('film.country') }}: {{ film.country }}
          </span>
          <span class="px-3 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-500 font-bold">
            {{ $t('film.rating') }}: {{ film.imdbRating }}
          </span>
        </div>

        <div class="space-y-6">
          <div>
            <h4 class="text-stone-500 uppercase tracking-widest text-xs font-bold mb-2">{{ $t('film.viewDetails') }}</h4>
            <p class="leading-relaxed text-lg">{{ currentSynopsis }}</p>
          </div>

          <div>
            <h4 class="text-stone-500 uppercase tracking-widest text-xs font-bold mb-2">{{ $t('film.locations') }}</h4>
            <ul class="space-y-2">
              <li v-for="loc in film.locations" :key="loc.name" class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="loc.isPrimary ? 'bg-red-500' : 'bg-stone-600'"></span>
                <span :class="loc.isPrimary ? 'text-white font-bold' : 'text-stone-400'">{{ loc.name }}</span>
                <span class="text-xs text-stone-600 uppercase border border-stone-700 px-1 rounded">{{ loc.type }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Film } from '../../types'

const props = defineProps<{
  film: Film
  isOpen: boolean
}>()

const emit = defineEmits(['close'])
const { locale } = useI18n()

const currentTitle = computed(() => {
  return props.film.title[locale.value as 'en' | 'es'] || props.film.title.en
})

const alternateTitle = computed(() => {
  const altLocale = locale.value === 'en' ? 'es' : 'en'
  return props.film.title[altLocale as 'en' | 'es']
})

const currentSynopsis = computed(() => {
  return props.film.synopsis[locale.value as 'en' | 'es'] || props.film.synopsis.en
})

const close = () => {
  emit('close')
}
</script>

<style scoped>
/* Custom scrollbar for the modal content */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #1c1917; 
}
::-webkit-scrollbar-thumb {
  background: #44403c; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #57534e; 
}
</style>

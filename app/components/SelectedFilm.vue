<template>
  <div v-if="film" class="fixed bottom-8 left-8 z-[900] bg-stone-900/90 backdrop-blur border border-stone-700 p-4 rounded-lg shadow-xl max-w-sm transition-all duration-300 hover:bg-stone-900">
    <div class="flex gap-4 items-center">
      <div class="w-16 h-24 flex-shrink-0 overflow-hidden rounded border border-stone-600">
        <img :src="film.poster" :alt="film.title.en" class="w-full h-full object-cover" />
      </div>
      <div>
        <h3 class="text-white font-bold font-serif leading-tight mb-1">{{ film.title.en }}</h3>
        <p class="text-stone-400 text-sm mb-2">{{ film.year }} • {{ film.country }}</p>
        <button @click="$emit('view-details')" class="text-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-400 transition-colors">
          View Details →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Film } from '../../types'

defineProps<{
  film: Film | null
}>()

defineEmits(['view-details'])
</script>


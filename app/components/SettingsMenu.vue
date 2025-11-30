<template>
  <div class="settings-container">
    <button @click="toggleMenu" class="settings-button" :title="$t('settings.title')">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m0-18a9 9 0 0 1 9 9m-9-9a9 9 0 0 0-9 9m18 0a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9 9"></path>
        <path d="M19.071 4.929A10 10 0 0 0 4.93 19.07M4.929 4.929A10 10 0 0 0 19.07 19.07"></path>
      </svg>
    </button>
    
    <Transition name="menu">
      <div v-if="isOpen" class="settings-menu">
        <div class="menu-header">
          <h3>{{ $t('settings.title') }}</h3>
          <button @click="toggleMenu" class="close-btn">×</button>
        </div>
        
        <div class="menu-section">
          <label class="setting-label">{{ $t('settings.language') }}</label>
          <div class="language-selector">
            <button
              v-for="locale in availableLocales"
              :key="locale.code"
              @click="changeLanguage(locale.code)"
              :class="['language-btn', { active: currentLocale === locale.code }]"
            >
              <span class="flag">{{ getFlag(locale.code) }}</span>
              <span class="lang-name">{{ locale.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <div v-if="isOpen" @click="toggleMenu" class="overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, availableLocales: locales } = useI18n()
const isOpen = ref(false)

const currentLocale = computed(() => locale.value)

const availableLocales = computed(() => {
  return locales.map((loc: any) => {
    if (typeof loc === 'string') {
      return { code: loc, name: loc }
    }
    return loc
  })
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const changeLanguage = (code: string) => {
  locale.value = code
  // Close menu after selection
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

const getFlag = (code: string) => {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    es: '🇪🇸'
  }
  return flags[code] || '🌐'
}
</script>

<style scoped>
.settings-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1001;
}

.settings-button {
  background: rgba(30, 30, 35, 0.95);
  border: 2px solid rgba(139, 69, 19, 0.6);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.settings-button:hover {
  background: rgba(40, 40, 45, 0.95);
  border-color: #d4af37;
  transform: rotate(90deg);
}

.settings-button svg {
  transition: transform 0.3s ease;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.settings-menu {
  position: absolute;
  top: 60px;
  left: 0;
  background: rgba(30, 30, 35, 0.98);
  border: 2px solid rgba(139, 69, 19, 0.6);
  border-radius: 8px;
  padding: 16px;
  min-width: 240px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(15px);
  font-family: 'Courier New', monospace;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.4);
}

.menu-header h3 {
  color: #d4af37;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.close-btn:hover {
  color: #f4cf5f;
  transform: rotate(90deg);
}

.menu-section {
  margin-bottom: 12px;
}

.setting-label {
  display: block;
  color: #d4af37;
  font-size: 13px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.language-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(139, 69, 19, 0.2);
  border: 1px solid rgba(139, 69, 19, 0.4);
  border-radius: 6px;
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.language-btn:hover {
  background: rgba(139, 69, 19, 0.4);
  border-color: #d4af37;
  transform: translateX(4px);
}

.language-btn.active {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(212, 175, 55, 0.3));
  border-color: #d4af37;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
}

.flag {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.lang-name {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

/* Transitions */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s ease;
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

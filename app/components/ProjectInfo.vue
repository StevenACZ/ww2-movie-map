<template>
  <div class="project-info-container">
    <button class="info-btn" @click="toggleInfo" aria-label="Project Information">
      <span class="icon">ℹ️</span>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="info-panel">
        <div class="panel-header">
          <h3>PROJECT INFO</h3>
          <button class="close-btn" @click="closeInfo">×</button>
        </div>
        
        <div class="panel-content">
          <p class="description">
            An interactive map visualization of World War II films, exploring cinema through geography and history.
          </p>
          
          <div class="links">
            <a href="https://github.com/yourusername/ww2-movie-map" target="_blank" rel="noopener noreferrer" class="link-item">
              <span class="link-icon">📂</span> GitHub Repository
            </a>
            <a href="#" class="link-item">
              <span class="link-icon">📄</span> Documentation
            </a>
            <a href="#" class="link-item">
              <span class="link-icon">💬</span> Feedback
            </a>
          </div>

          <div class="credits">
            <p>Created with Nuxt 3 & Leaflet</p>
            <p class="version">v1.0.0</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const toggleInfo = () => {
  isOpen.value = !isOpen.value
}

const closeInfo = () => {
  isOpen.value = false
}
</script>

<style scoped>
.project-info-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  font-family: 'Courier New', monospace;
}

.info-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(30, 30, 35, 0.9);
  border: 2px solid #8b4513;
  color: #d4af37;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.info-btn:hover {
  background: rgba(139, 69, 19, 0.8);
  transform: scale(1.1);
}

.info-panel {
  position: absolute;
  top: 50px;
  left: 0;
  width: 300px;
  background: rgba(30, 30, 35, 0.95);
  border: 2px solid #8b4513;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.panel-header {
  background: rgba(139, 69, 19, 0.2);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(139, 69, 19, 0.4);
}

.panel-header h3 {
  margin: 0;
  color: #d4af37;
  font-size: 14px;
  letter-spacing: 1px;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.panel-content {
  padding: 16px;
  color: #ccc;
}

.description {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
  color: #bbb;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d4af37;
  text-decoration: none;
  font-size: 14px;
  padding: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.2s;
}

.link-item:hover {
  background: rgba(139, 69, 19, 0.3);
}

.credits {
  text-align: center;
  font-size: 11px;
  color: #666;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}

.credits p {
  margin: 2px 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

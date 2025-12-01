<template>
  <div class="project-info-container">
    <button
      class="info-btn"
      @click="toggleInfo"
      aria-label="Project Information"
    >
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
            An interactive map visualization of World War II films, exploring
            cinema through geography and history.
          </p>

          <div class="links">
            <a
              href="https://github.com/yourusername/ww2-movie-map"
              target="_blank"
              rel="noopener noreferrer"
              class="link-item"
            >
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
import { ref } from "vue";

const isOpen = ref(false);

const toggleInfo = () => {
  isOpen.value = !isOpen.value;
};

const closeInfo = () => {
  isOpen.value = false;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.project-info-container {
  position: absolute;
  top: $spacing-lg;
  left: 11px;
  z-index: $z-modal;
  font-family: "Courier New", monospace;
}

.info-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba($bg-dark, 0.9);
  border: $border-width solid $brown;
  color: $gold;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all $transition-normal;
  box-shadow: $shadow-sm;

  &:hover {
    background: rgba($brown, 0.8);
    border-color: $gold;
  }
}

.info {
  &-panel {
    position: absolute;
    top: 50px;
    left: 0;
    width: 300px;
    background: $bg-dark;
    border: $border-width solid $brown;
    border-radius: $border-radius-sm;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
}

.panel {
  &-header {
    background: rgba($brown, 0.2);
    padding: $spacing-md $spacing-md;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba($brown, 0.4);

    h3 {
      margin: 0;
      color: $gold;
      font-size: 14px;
      letter-spacing: 1px;
    }
  }

  &-content {
    padding: $spacing-md;
    color: #ccc;
  }
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: $text-primary;
  }
}

.description {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: $spacing-lg;
  color: #bbb;
}

.links {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.link {
  &-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $gold;
    text-decoration: none;
    font-size: 14px;
    padding: $spacing-sm;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    transition: background $transition-fast;

    &:hover {
      background: rgba($brown, 0.3);
    }
  }
}

.credits {
  text-align: center;
  font-size: 11px;
  color: #666;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: $spacing-md;

  p {
    margin: 2px 0;
  }
}

.icon {
  font-size: 14px;
}

// Transitions
.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity $transition-fast, transform $transition-fast;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>

<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-ww2">WW2</span>
        <span class="logo-text">MAP FILMS</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="nav-menu">
        <NuxtLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
          <span class="nav-icon">🗺️</span>
          <span class="nav-text">MAP</span>
        </NuxtLink>
        <NuxtLink to="/films" class="nav-item" :class="{ active: currentRoute === '/films' }">
          <span class="nav-icon">🎬</span>
          <span class="nav-text">FILMS</span>
        </NuxtLink>
        <NuxtLink to="/timeline" class="nav-item" :class="{ active: currentRoute === '/timeline' }">
          <span class="nav-icon">⏱️</span>
          <span class="nav-text">TIMELINE</span>
        </NuxtLink>
        <NuxtLink to="/about" class="nav-item" :class="{ active: currentRoute === '/about' }">
          <span class="nav-icon">ℹ️</span>
          <span class="nav-text">ABOUT</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentRoute = computed(() => route.path);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-header;
  background: linear-gradient(
    180deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  padding: 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-xl;
  max-width: 100%;
  margin: 0 auto;
}

// Logo
.logo {
  display: flex;
  align-items: baseline;
  gap: $spacing-xs;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: opacity $transition-fast;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
}

.logo-ww2 {
  font-size: 24px;
  font-weight: 700;
  color: $beige;
  letter-spacing: 0px;
}

.logo-text {
  font-size: 24px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0px;
  text-transform: uppercase;
}

// Navigation
.nav-menu {
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: $spacing-lg 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all $transition-normal;
  position: relative;
  height: 100%;
  text-decoration: none;

  .nav-icon {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, $beige, transparent);
    transition: width $transition-normal;
  }

  &:hover:not([disabled]) {
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);

    &::after {
      width: 100%;
    }
  }

  &.active {
    color: $beige;

    &::after {
      width: 100%;
      background: linear-gradient(90deg, transparent, $beige, transparent);
    }
  }

  &[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
}

.nav-text {
  font-size: 14px;
}

// Responsive
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: $spacing-md;
    padding: $spacing-md;
  }

  .nav-menu {
    width: 100%;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .nav-item {
    padding: $spacing-xs $spacing-md;
    font-size: 12px;
  }

  .nav-text {
    display: none;
  }

  .nav-icon {
    display: block !important;
  }

  .logo-ww2 {
    font-size: 20px;
  }

  .logo-text {
    font-size: 20px;
  }
}
</style>

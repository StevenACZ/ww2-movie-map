<template>
  <header class="app-header" :class="{ 'menu-open': isMenuOpen }">
    <div class="header-content">
      <!-- Logo -->
      <NuxtLink to="/" class="logo" @click="closeMenu">
        <span class="logo-ww2">WW2</span>
        <span class="logo-text">MAP FILMS</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="nav-menu desktop-nav">
        <NuxtLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
          <span class="nav-text">MAP</span>
        </NuxtLink>
        <NuxtLink to="/films" class="nav-item" :class="{ active: currentRoute === '/films' }">
          <span class="nav-text">FILMS</span>
        </NuxtLink>
        <NuxtLink to="/timeline" class="nav-item" :class="{ active: currentRoute === '/timeline' }">
          <span class="nav-text">TIMELINE</span>
        </NuxtLink>
        <NuxtLink to="/about" class="nav-item" :class="{ active: currentRoute === '/about' }">
          <span class="nav-text">ABOUT</span>
        </NuxtLink>
      </nav>

      <!-- Hamburger Button (Mobile) -->
      <button 
        class="hamburger-btn" 
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle navigation menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- Mobile Navigation Overlay -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="mobile-overlay" @click="closeMenu"></div>
    </Transition>

    <!-- Mobile Navigation Menu -->
    <Transition name="slide-down">
      <nav v-if="isMenuOpen" class="mobile-nav">
        <NuxtLink 
          to="/" 
          class="mobile-nav-item" 
          :class="{ active: currentRoute === '/' }"
          @click="closeMenu"
        >
          <span class="mobile-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </span>
          <span class="mobile-nav-text">Map</span>
          <span class="mobile-nav-desc">Explore WW2 films on the map</span>
        </NuxtLink>
        <NuxtLink 
          to="/films" 
          class="mobile-nav-item" 
          :class="{ active: currentRoute === '/films' }"
          @click="closeMenu"
        >
          <span class="mobile-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </span>
          <span class="mobile-nav-text">Films</span>
          <span class="mobile-nav-desc">Browse film collection</span>
        </NuxtLink>
        <NuxtLink 
          to="/timeline" 
          class="mobile-nav-item" 
          :class="{ active: currentRoute === '/timeline' }"
          @click="closeMenu"
        >
          <span class="mobile-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="mobile-nav-text">Timeline</span>
          <span class="mobile-nav-desc">Events & film releases</span>
        </NuxtLink>
        <NuxtLink 
          to="/about" 
          class="mobile-nav-item" 
          :class="{ active: currentRoute === '/about' }"
          @click="closeMenu"
        >
          <span class="mobile-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="mobile-nav-text">About</span>
          <span class="mobile-nav-desc">Project information</span>
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const currentRoute = computed(() => route.path);
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = "";
};

// Close menu on route change
watch(currentRoute, () => {
  closeMenu();
});

// Close menu on escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isMenuOpen.value) {
    closeMenu();
  }
};

// Close menu on resize to desktop
const handleResize = () => {
  if (window.innerWidth > 768 && isMenuOpen.value) {
    closeMenu();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleEscape);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEscape);
  window.removeEventListener("resize", handleResize);
  document.body.style.overflow = "";
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

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
  height: 60px;

  @include mobile {
    padding: 0 $spacing-md;
    height: 56px;
  }

  @include mobile-small {
    padding: 0 $spacing-sm;
  }
}

// Logo
.logo {
  display: flex;
  align-items: baseline;
  gap: $spacing-xs;
  font-family: "Inter", sans-serif;
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

  @include mobile {
    font-size: 20px;
  }

  @include mobile-small {
    font-size: 18px;
  }
}

.logo-text {
  font-size: 24px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0px;
  text-transform: uppercase;

  @include mobile {
    font-size: 20px;
  }

  @include mobile-small {
    font-size: 18px;
  }
}

// Desktop Navigation
.desktop-nav {
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  height: 100%;

  @include mobile {
    display: none;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: $spacing-lg 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all $transition-normal;
  position: relative;
  height: 100%;
  text-decoration: none;

  &::after {
    content: "";
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
}

.nav-text {
  font-size: 14px;
}

// Hamburger Button
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 9999;

  @include mobile {
    display: flex;
  }
}

.hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform-origin: center;

  &:nth-child(1) {
    margin-bottom: 6px;
  }

  &:nth-child(2) {
    margin-bottom: 6px;
  }
}

// Hamburger Animation when open
.menu-open {
  .hamburger-line {
    &:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
      background: $beige;
    }

    &:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }

    &:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
      background: $beige;
    }
  }
}

// Mobile Overlay - z-index muy alto para estar encima de todo
.mobile-overlay {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9000;
  backdrop-filter: blur(8px);
}

// Mobile Navigation - z-index muy alto
.mobile-nav {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 25, 30, 0.99) 0%,
    rgba(15, 20, 25, 0.98) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  z-index: 9500;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-md;
  text-decoration: none;
  transition: all $transition-normal;

  &:hover,
  &:active {
    background: rgba($beige, 0.1);
    border-color: rgba($beige, 0.3);
  }

  &.active {
    background: rgba($beige, 0.15);
    border-color: rgba($beige, 0.4);

    .mobile-nav-text {
      color: $beige;
    }

    .mobile-nav-icon {
      color: $beige;
    }
  }
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: $text-secondary;

  svg {
    width: 100%;
    height: 100%;
  }
}

.mobile-nav-text {
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.mobile-nav-desc {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: $text-muted;
  margin-left: auto;

  @include mobile-small {
    display: none;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>

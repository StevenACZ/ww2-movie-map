<template>
  <Teleport to="body">
    <Transition name="theater">
      <div
        v-if="isOpen"
        ref="dialog"
        tabindex="-1"
        class="trailer-modal-overlay"
        @click.self="closeModal"
        role="dialog"
        aria-modal="true"
        :aria-label="`Trailer for ${filmTitle}`"
      >
        <div class="trailer-modal-content">
          <button
            class="trailer-close-btn"
            @click="closeModal"
            aria-label="Close trailer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div class="trailer-video-container">
            <iframe
              v-if="embedUrl"
              :src="embedUrl"
              :title="`${filmTitle} Trailer`"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="trailer-iframe"
            ></iframe>
          </div>
          <div class="trailer-info">
            <h3 class="trailer-title">{{ filmTitle }}</h3>
            <p class="trailer-subtitle">Official Trailer</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDialogFocus } from "~/composables/useDialogFocus";

interface Props {
  isOpen: boolean;
  trailerUrl: string;
  filmTitle: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const youtubeHosts = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
]);

const extractYouTubeVideoId = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);
    if (!youtubeHosts.has(url.hostname)) return "";

    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? "";
    }

    return url.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
};
const embedUrl = computed(() => {
  const videoId = extractYouTubeVideoId(props.trailerUrl);

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }

  return "";
});

const closeModal = () => {
  emit("close");
};

const dialog = useDialogFocus(() => props.isOpen, closeModal);
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;
.trailer-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  cursor: pointer;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
    pointer-events: none;
  }
}

.trailer-modal-content {
  position: relative;
  width: 100%;
  max-width: 1000px;
  cursor: default;
}
.trailer-close-btn {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
}
.trailer-video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; // 16:9 aspect ratio
  background: #000;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.8),
    0 0 100px rgba($beige, 0.1);
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.trailer-info {
  text-align: center;
  margin-top: $spacing-lg;
  color: white;
}

.trailer-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 $spacing-xs 0;
  color: $beige;
}

.trailer-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.theater-enter-active {
  transition: opacity 0.4s ease;

  .trailer-modal-content {
    transition:
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.4s ease;
  }
}

.theater-leave-active {
  transition: opacity 0.3s ease;

  .trailer-modal-content {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }
}

.theater-enter-from {
  opacity: 0;

  .trailer-modal-content {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
  }
}

.theater-leave-to {
  opacity: 0;

  .trailer-modal-content {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>

<template>
  <dialog
    ref="dialog"
    class="trailer"
    :aria-label="label"
    @close="onClose"
    @click="onClick"
  >
    <div class="trailer__bar">
      <p class="trailer__label mono">{{ label }}</p>
      <button
        type="button"
        class="btn btn--icon trailer__close"
        :aria-label="t('trailer.close')"
        @click="close"
      >
        <Icon name="x" />
      </button>
    </div>
    <div class="trailer__frame">
      <iframe
        v-if="open"
        :src="`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`"
        :title="label"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
    </div>
  </dialog>
</template>

<script setup lang="ts">
defineProps<{ videoKey: string; label: string }>();

const { t } = useI18n();
const dialog = ref<HTMLDialogElement>();
const open = ref(false);
let trigger: HTMLElement | null = null;

function show() {
  trigger =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  open.value = true;
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
}

function onClose() {
  open.value = false;
  trigger?.focus();
  trigger = null;
}

function onClick(event: MouseEvent) {
  if (event.target === dialog.value) close();
}

defineExpose({ show });
</script>

<style lang="scss" scoped>
.trailer {
  width: min(100vw - 2 * var(--gutter), 1100px);
  max-width: none;
  max-height: none;
  margin: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  overflow: visible;

  &::backdrop {
    background: rgb(6 7 5 / 0.88);
    backdrop-filter: blur(6px);
  }

  &[open] {
    @include motion {
      animation: trailer-in 0.45s $ease-out both;
    }
  }
}

.trailer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.trailer__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.trailer__close {
  flex: none;
}

.trailer__frame {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius);
  background: #000;
  box-shadow:
    0 0 0 1px var(--line-strong),
    var(--shadow);

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

@keyframes trailer-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>

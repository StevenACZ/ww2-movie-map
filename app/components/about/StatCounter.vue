<template>
  <div ref="root" class="stat">
    <dt class="stat__label">{{ label }}</dt>
    <dd class="stat__value mono">
      <span aria-hidden="true">{{ format(shown) }}</span>
      <span class="visually-hidden">{{ format(value) }}</span>
    </dd>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ value: number; label: string }>();

const { locale } = useI18n();
const root = ref<HTMLElement>();
const shown = ref(props.value);

let frame = 0;
let observer: IntersectionObserver | undefined;

function format(n: number) {
  return n.toLocaleString(locale.value === "es" ? "es" : "en");
}

function countUp() {
  const start = performance.now();
  const duration = 1600;
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    shown.value = Math.round(props.value * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

onMounted(() => {
  if (
    !root.value ||
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        shown.value = 0;
        return;
      }
      observer?.disconnect();
      countUp();
    },
    { threshold: 0.4 }
  );
  observer.observe(root.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});
</script>

<style lang="scss" scoped>
.stat {
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  padding: 22px 0 0;
  border-top: 1px solid var(--line-strong);
}

.stat__value {
  font-size: clamp(2.6rem, 7vw, 4.4rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.stat__label {
  @include eyebrow;
}
</style>

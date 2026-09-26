<template>
  <span class="odo" :class="{ 'odo--roll': from }" aria-hidden="true">
    <span v-for="(digit, i) in digits" :key="i" class="odo__cell">
      <span
        class="odo__col"
        :style="{ '--d': digit, '--f': fromDigits[i] ?? digit, '--i': i }"
      />
    </span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ year: number; from?: number }>();

const digits = computed(() => String(props.year).split("").map(Number));
const fromDigits = computed(() =>
  props.from ? String(props.from).split("").map(Number) : []
);
</script>

<style lang="scss" scoped>
.odo {
  display: inline-flex;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.odo__cell {
  display: inline-block;
  height: 1em;
  overflow: hidden;
}

.odo__col {
  display: block;
  transform: translateY(calc(var(--d) * -1em));

  &::before {
    content: "0\A 1\A 2\A 3\A 4\A 5\A 6\A 7\A 8\A 9";
    display: block;
    white-space: pre;
    text-align: center;
  }

  @include motion {
    transition: transform 0.7s $ease-spring;
    transition-delay: calc((3 - var(--i)) * 45ms);

    .odo--roll & {
      animation-name: odo-roll;
      animation-duration: 1.6s;
      animation-delay: calc(0.35s + var(--i) * 0.18s);
      animation-timing-function: $ease-out;
      animation-fill-mode: both;
    }
  }
}

@keyframes odo-roll {
  from {
    transform: translateY(calc(var(--f) * -1em));
  }
  to {
    transform: translateY(calc(var(--d) * -1em));
  }
}
</style>

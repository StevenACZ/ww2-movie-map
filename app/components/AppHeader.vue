<template>
  <header
    class="header"
    :class="{
      'header--overlay': overlay,
      'header--scrolled': scrolled,
      'header--open': open,
    }"
  >
    <div class="header__bar">
      <NuxtLinkLocale to="/" class="header__brand" :aria-label="t('site.name')">
        <AppLogo class="header__logo" />
        <span class="header__word">WW2 <span>Film Map</span></span>
      </NuxtLinkLocale>

      <nav class="header__nav" :aria-label="t('nav.menu')">
        <NuxtLinkLocale
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="header__link"
          :class="{ 'is-active': isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          {{ t(item.label) }}
        </NuxtLinkLocale>
      </nav>

      <div class="header__tools">
        <div class="lang" role="group" :aria-label="t('nav.language')">
          <NuxtLink
            v-for="code in LOCALE_CODES"
            :key="code"
            :to="switchLocalePath(code)"
            :hreflang="code"
            :lang="code"
            class="lang__item"
            :class="{ 'is-active': locale === code }"
            :aria-current="locale === code ? 'true' : undefined"
          >
            {{ code.toUpperCase() }}
          </NuxtLink>
        </div>
        <button
          type="button"
          class="btn btn--icon btn--ghost header__sound"
          :aria-pressed="sound.enabled.value"
          :aria-label="sound.enabled.value ? t('sound.on') : t('sound.off')"
          :title="sound.enabled.value ? t('sound.on') : t('sound.off')"
          @click="sound.toggle()"
        >
          <Icon :name="sound.enabled.value ? 'sound-on' : 'sound-off'" />
        </button>
        <button
          type="button"
          class="btn btn--icon btn--ghost header__menu"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="open ? t('nav.close') : t('nav.menu')"
          @click="open = !open"
        >
          <Icon :name="open ? 'x' : 'menu'" />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <nav
        v-if="open"
        id="mobile-nav"
        class="drawer"
        :aria-label="t('nav.menu')"
      >
        <NuxtLinkLocale
          v-for="(item, index) in NAV"
          :key="item.to"
          :to="item.to"
          class="drawer__link"
          :style="{ '--i': index }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span class="drawer__num mono">0{{ index + 1 }}</span>
          {{ t(item.label) }}
        </NuxtLinkLocale>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const NAV = [
  { to: "/", label: "nav.map" },
  { to: "/films", label: "nav.films" },
  { to: "/timeline", label: "nav.timeline" },
  { to: "/places", label: "nav.places" },
  { to: "/about", label: "nav.about" },
] as const;
const LOCALE_CODES = ["en", "es"] as const;

defineProps<{ overlay?: boolean }>();

const { t, locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();
const route = useRoute();
const sound = useSound();

const open = ref(false);
const scrolled = ref(false);

function normalize(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}

function isActive(to: string) {
  const target = normalize(localePath(to));
  const current = normalize(route.path);
  if (to === "/") return current === target;
  return (
    current.startsWith(target) || (to === "/films" && current.includes("/era/"))
  );
}

function onScroll() {
  scrolled.value = window.scrollY > 8;
}

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}

watch(
  () => route.fullPath,
  () => {
    open.value = false;
  }
);

watch(open, (value) => {
  document.documentElement.style.overflow = value ? "hidden" : "";
});

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKey);
  document.documentElement.style.overflow = "";
});
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-h);
  transition:
    background-color 0.35s $ease-out,
    border-color 0.35s $ease-out;
  border-bottom: 1px solid transparent;

  &--scrolled:not(.header--overlay),
  &--open:not(.header--overlay) {
    @include glass(0.78);
    border-width: 0 0 1px;
  }

  &--overlay {
    position: absolute;
    inset: 0 0 auto;
    background: linear-gradient(to bottom, rgb(8 9 7 / 0.85), rgb(8 9 7 / 0));
  }
}

.header__bar {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%;
  padding-inline: var(--gutter);
}

.header__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

.header__logo {
  width: 34px;
  height: 34px;
  color: var(--text);
  transition: transform 0.6s $ease-spring;
}

.header__brand:hover .header__logo {
  transform: rotate(-24deg);
}

.header__word {
  font-family: var(--font-stencil);
  font-size: 1.32rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1;

  span {
    color: var(--gold);
  }
}

.header__nav {
  display: none;
  gap: 4px;
  margin-inline: auto;

  @include up($bp-md) {
    display: flex;
  }
}

.header__link {
  position: relative;
  padding: 10px 14px;
  font-family: var(--font-display);
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 0.25s $ease-out;

  &::after {
    content: "";
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 4px;
    height: 2px;
    background: var(--gold);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.4s $ease-out;
  }

  &:hover,
  &.is-active {
    color: var(--text);
  }

  &:hover::after,
  &.is-active::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  &:focus-visible {
    outline: none;
    color: var(--text);
    border-radius: 6px;
    background: rgb(216 174 82 / 0.1);
    box-shadow: inset 0 0 0 1px rgb(216 174 82 / 0.45);
  }
}

.header__tools {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;

  @include up($bp-md) {
    margin-left: 0;
  }
}

.lang {
  display: flex;
  padding: 3px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
}

.lang__item {
  display: grid;
  place-items: center;
  min-width: 36px;
  height: 30px;
  padding: 0 8px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--muted);
  transition:
    background-color 0.25s $ease-out,
    color 0.25s $ease-out;

  &:hover {
    color: var(--text);
  }

  &.is-active {
    background: var(--text);
    color: #12130d;
  }
}

.header__sound {
  border-color: transparent;

  &[aria-pressed="true"] {
    color: var(--gold);
  }
}

.header__menu {
  border-color: transparent;

  @include up($bp-md) {
    display: none;
  }
}

.drawer {
  position: fixed;
  inset: var(--header-h) 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px var(--gutter) 40px;
  background: rgb(11 12 9 / 0.97);
  backdrop-filter: blur(20px);
  overflow-y: auto;
}

.drawer__link {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
  @include display(clamp(2.4rem, 11vw, 3.4rem));
  font-family: var(--font-stencil);
  color: var(--text);

  &[aria-current="page"] {
    color: var(--gold);
  }

  @include motion {
    animation: drawer-in 0.55s $ease-out both;
    animation-delay: calc(var(--i) * 55ms + 60ms);
  }
}

.drawer__num {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: var(--faint);
}

@keyframes drawer-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.3s $ease-out,
    clip-path 0.45s $ease-out;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
}

.drawer-enter-to,
.drawer-leave-from {
  clip-path: inset(0 0 0 0);
}
</style>

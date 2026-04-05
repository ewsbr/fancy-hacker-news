<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import type { ParsedHeader } from '@/parsers/header';
import YLogo from '@/assets/ycombinator.svg';
import ThemeToggle from '../shared/ThemeToggle.vue';
import { Menu } from 'lucide-vue-next';
import MetaSep from '../shared/MetaSep.vue';

const header = inject<ParsedHeader>('header')!;
const navOpen = ref(false);
const navToggle = ref<HTMLElement | null>(null);
const navMenu = ref<HTMLElement | null>(null);

const navLinks = computed(() => header.navLinks.filter((link) => link.label.toLowerCase() !== 'hacker news'));

function closeNav() {
  navOpen.value = false;
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!navOpen.value || window.innerWidth > 768) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (navToggle.value?.contains(target) || navMenu.value?.contains(target)) {
    return;
  }

  closeNav();
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown);
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
});
</script>

<template>
  <header class="site-header">
    <div class="site-header__container">
      <div class="site-header__mobile-row">
        <a href="/" class="site-header__brand">
          <img :src="YLogo" class="site-header__logo-img" alt="Y Combinator Logo" />
          <span class="site-header__logo-text">Hacker News</span>
        </a>

        <div class="site-header__mobile-actions">
          <button
            v-if="navLinks.length > 0"
            ref="navToggle"
            type="button"
            class="site-header__nav-toggle"
            :aria-expanded="navOpen"
            aria-haspopup="menu"
            @click="navOpen = !navOpen"
          >
            <Menu :size="16" />
            Menu
          </button>
        </div>
      </div>

      <nav
        ref="navMenu"
        class="site-header__nav"
        :class="{ 'site-header__nav--open': navOpen }"
      >
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="site-header__nav-link"
          :class="{ 'site-header__nav-link--active': link.active }"
          @click="closeNav"
        >{{ link.label }}</a>
      </nav>

      <button
        v-if="navOpen"
        type="button"
        class="site-header__backdrop"
        aria-label="Close menu"
        @click="closeNav"
      />

      <div class="site-header__controls">
        <div v-if="header.hasAuthControls" class="site-header__user-controls">
          <template v-if="header.user">
            <strong>
              <a :href="`user?id=${header.user.name}`">{{ header.user.name }}</a>
            </strong>
            <span>({{ header.user.karma }})</span>
            <template v-if="header.logoutUrl">
              <MetaSep />
              <a :href="header.logoutUrl">logout</a>
            </template>
          </template>
          <a v-else-if="header.loginUrl" :href="header.loginUrl">login</a>
        </div>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  border-bottom: 1px solid var(--color-chrome-border);
  background: var(--color-chrome-surface);

  &__container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    max-width: 1024px;
    margin: 0 auto;
    padding: 0.5rem 1rem;
  }

  &__mobile-row {
    display: contents;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    color: var(--color-text);
    font-size: 1.15rem;
    font-weight: 800;

    &:hover {
      text-decoration: none;
    }
  }

  &__logo-img {
    width: 22px;
    height: 22px;
  }

  &__logo-text {
    font-family: var(--font-title);
    font-weight: 600;
  }

  &__mobile-actions {
    display: none;
    align-items: center;
    gap: 0.4rem;
  }

  &__nav-toggle {
    display: none;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--color-chrome-border);
    border-radius: 4px;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    user-select: none;

    &:hover {
      border-color: color-mix(in srgb, var(--color-accent) 42%, var(--color-chrome-border));
      background: color-mix(in srgb, var(--color-accent) 10%, var(--color-chrome-surface));
      color: var(--color-text);
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex: 1;
    flex-wrap: nowrap;
    font-size: 0.95rem;
    font-weight: 500;
  }

  &__nav-link {
    white-space: nowrap;
    color: color-mix(in srgb, var(--color-text) 85%, transparent);
    transition: all 0.15s ease;

    &:hover {
      color: var(--color-text);
      opacity: 1;
    }

    &--active {
      color: var(--color-accent-muted);
      font-weight: 700;
      opacity: 1;
      text-decoration: none;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
    font-size: 0.95rem;
    font-weight: 500;
  }

  &__user-controls {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: color-mix(in srgb, var(--color-text) 75%, transparent);
    transition: all 0.15s ease;

    strong,
    a {
      white-space: nowrap;
      color: var(--color-text);
    }

    a:hover {
      color: var(--color-accent);
    }
  }

  @media (max-width: 768px) {
    &__container {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
      padding: 0.5rem 0.5rem;
    }

    &__mobile-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      position: relative;
      z-index: 110;
    }

    &__mobile-actions {
      display: flex;
    }

    &__nav-toggle {
      display: flex;
    }

    &__nav {
      display: none;
      position: absolute;
      top: 3.25rem;
      right: 1rem;
      z-index: 100;
      flex-direction: column;
      align-items: stretch;
      min-width: 160px;
      gap: 0;
      border: 1px solid var(--color-chrome-border);
      border-radius: 4px;
      background: var(--color-chrome-surface);
      box-shadow: var(--shadow-elevation);

      &--open {
        display: flex;
      }
    }

    &__backdrop {
      position: fixed;
      inset: 0;
      z-index: 90;
      border: 0;
      padding: 0;
      background: transparent;
      cursor: default;
    }

    &__nav-link {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid var(--color-border);

      &:last-child {
        border-bottom: 0;
      }

      &:hover {
        background: var(--color-bg);
        text-decoration: none;
      }
    }

    &__controls {
      justify-content: space-between;
      border-top: 1px solid var(--color-border);
      padding-top: 0.75rem;
    }
  }
}
</style>

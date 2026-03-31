<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ParsedHeader } from '@/parsers/header';
import YLogo from '@/assets/ycombinator.svg';
import ThemeToggle from '../shared/ThemeToggle.vue';
import { Search } from 'lucide-vue-next';

const header = inject<ParsedHeader>('header')!;
const navOpen = ref(false);
const searchOpen = ref(false);

const navLinks = computed(() => header.navLinks.filter((link) => link.label.toLowerCase() !== 'hacker news'));

function closeNav() {
  navOpen.value = false;
}
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
            type="button"
            class="site-header__search-toggle"
            :class="{ 'site-header__search-toggle--active': searchOpen }"
            aria-label="Search Hacker News"
            @click="searchOpen = !searchOpen; navOpen = false"
          >
            <Search :size="17" />
          </button>
          <button
            type="button"
            class="site-header__nav-toggle"
            @click="navOpen = !navOpen; searchOpen = false"
          >
            Menu ▾
          </button>
        </div>
      </div>

      <nav class="site-header__nav" :class="{ 'site-header__nav--open': navOpen }">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="site-header__nav-link"
          :class="{ 'site-header__nav-link--active': link.active }"
          @click="closeNav"
        >{{ link.label }}</a>
      </nav>

      <form
        action="https://hn.algolia.com/"
        method="get"
        target="_blank"
        rel="noopener noreferrer"
        class="site-header__search"
        :class="{ 'site-header__search--mobile-open': searchOpen }"
      >
        <Search :size="14" class="site-header__search-icon" aria-hidden="true" />
        <input
          name="q"
          type="search"
          placeholder="Search HN…"
          class="site-header__search-input"
        />
      </form>

      <div class="site-header__controls">
        <div class="site-header__user-controls">
          <template v-if="header.user">
            <strong>
              <a :href="`user?id=${header.user.name}`">{{ header.user.name }}</a>
            </strong>
            <span>({{ header.user.karma }})</span>
            <template v-if="header.logoutUrl">
              <span class="site-header__divider" aria-hidden="true">&middot;</span>
              <a :href="header.logoutUrl">logout</a>
            </template>
          </template>
          <a v-else href="login">login</a>
        </div>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-top: 3px solid var(--color-accent);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.site-header__container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 1024px;
  margin: 0 auto;
  padding: 0.5rem 0.5rem;
}

.site-header__mobile-row {
  display: contents;
}

.site-header__brand {
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

.site-header__logo-img {
  width: 22px;
  height: 22px;
  border: 1px solid #fff;
  border-radius: 2px;
  background: var(--color-accent);
}

.site-header__logo-text {
  font-family: var(--font-title);
  font-weight: 600;
}

.site-header__mobile-actions {
  display: none;
  align-items: center;
  gap: 0.4rem;
}

.site-header__search-toggle {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover,
  &--active {
    background: var(--color-code-bg);
    color: var(--color-accent);
  }
}

.site-header__nav-toggle {
  display: none;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  user-select: none;

  &:hover {
    background: var(--color-code-bg);
    color: var(--color-text);
  }
}

.site-header__search {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.site-header__search-icon {
  position: absolute;
  left: 0.6rem;
  color: var(--color-text-muted);
  pointer-events: none;
  transition: color 0.15s ease;
}

.site-header__search-input {
  width: 160px;
  padding: 0.34rem 0.65rem 0.34rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  outline: none;
  transition: width 0.25s ease, border-color 0.2s ease;

  // Remove the native search clear button (× chrome adds)
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  &::placeholder {
    color: var(--color-text-muted);
    opacity: 0.7;
  }

  &:focus {
    width: 240px;
    border-color: var(--color-accent);

    ~ .site-header__search-icon,
    + .site-header__search-icon {
      color: var(--color-accent);
    }
  }
}

// Icon colour follows focus via sibling selector — icon is before input in DOM,
// so use :focus-within on the form instead
.site-header__search:focus-within .site-header__search-icon {
  color: var(--color-accent);
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  flex-wrap: nowrap;
  font-size: 0.95rem;
  font-weight: 500;

}

.site-header__nav-link {
  white-space: nowrap;
  color: color-mix(in srgb, var(--color-text) 85%, transparent); // Increased contrast vs --color-text-muted
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

.site-header__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.site-header__user-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: color-mix(in srgb, var(--color-text) 75%, transparent); // Brighter than --color-text-muted
  transition: all 0.15s ease;

  strong, a {
    white-space: nowrap;
    color: var(--color-text);
  }

  a:hover {
    color: var(--color-accent);
  }
}

.site-header__divider {
  color: var(--color-text-muted);
  opacity: 0.6;
  font-weight: 900;
}

@media (max-width: 768px) {
  .site-header__container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem;
  }

  .site-header__mobile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .site-header__mobile-actions {
    display: flex;
  }

  .site-header__nav-toggle {
    display: block;
  }

  // Search bar: hidden by default, expands below mobile-row when toggled
  .site-header__search {
    display: none;
    width: 100%;

    &--mobile-open {
      display: flex;
    }
  }

  .site-header__search-input {
    width: 100%;
    border-radius: 6px;
    padding: 0.5rem 0.65rem 0.5rem 2rem;

    &:focus {
      width: 100%;
    }
  }

  .site-header__nav {
    display: none;
    position: absolute;
    top: 3.25rem;
    right: 1rem;
    z-index: 100;
    flex-direction: column;
    align-items: stretch;
    min-width: 160px;
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-surface);
    box-shadow: var(--shadow-elevation);

    &--open {
      display: flex;
    }

  }

  .site-header__nav-link {
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

  .site-header__controls {
    justify-content: space-between;
    border-top: 1px solid var(--color-border);
    padding-top: 0.75rem;
  }
}
</style>

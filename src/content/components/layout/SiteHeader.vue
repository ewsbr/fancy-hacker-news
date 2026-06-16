<script setup lang="ts">
import type { ParsedHeader } from '@/parsers/header';
import { useEventListener } from '@vueuse/core';
import { ChevronDown, LogOut, Menu, Send, UserRound } from 'lucide-vue-next';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui';
import { computed, inject, ref, shallowRef } from 'vue';
import YLogo from '@/assets/ycombinator.svg';
import HeaderMoreDropdown from '@/content/components/layout/HeaderMoreDropdown.vue';
import ThemeToggle from '@/content/components/layout/ThemeToggle.vue';
import YCombinatorLogo from '@/content/components/layout/YCombinatorLogo.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import { useCurrentUser } from '@/content/composables/current-user';
import {
  createOverflowNavGroups,
  createPrimaryNavLinks,
  createVisibleNavLinks,
} from '@/content/utils/header-links';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/root-host';

const header = inject<ParsedHeader>('header')!;
const currentUser = useCurrentUser();
const navOpen = ref(false);
const navToggle = shallowRef<HTMLElement | null>(null);
const navMenu = shallowRef<HTMLElement | null>(null);

const visibleNavLinks = computed(() => createVisibleNavLinks(header.navLinks, isCurrentHref));

const primaryNavLinks = computed(() => createPrimaryNavLinks(visibleNavLinks.value));

const submitNavLink = computed(() => visibleNavLinks.value.find(link => link.label.toLowerCase() === 'submit'));

const overflowNavGroups = computed(() => createOverflowNavGroups(visibleNavLinks.value));

const hasNavLinks = computed(() => primaryNavLinks.value.length > 0 || overflowNavGroups.value.length > 0);
const effectiveTopBarColor = computed(() => header.topBarColor);
const showHeaderAccent = computed(() => header.hasCustomTopBarColor && !header.hasMemorialBar);
const useBlackLogo = computed(() => header.hasCustomTopBarColor || header.hasMemorialBar);

function isCurrentHref(href: string) {
  const currentOp = document.documentElement.getAttribute('op') ?? '';
  const currentPath = window.location.pathname.replace(/^\//, '') || 'news';
  const hrefUrl = new URL(href, window.location.origin);
  const hrefPath = hrefUrl.pathname.replace(/^\//, '') || 'news';

  return href === currentOp
    || href.startsWith(`${currentOp}?`)
    || (hrefPath === currentPath && hrefUrl.search === window.location.search);
}

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

useEventListener(document, 'pointerdown', onDocumentPointerDown);
</script>

<template>
  <header
    class="site-header"
    :style="{
      '--site-header-bar-color': effectiveTopBarColor,
    }"
  >
    <div v-if="showHeaderAccent" class="site-header__accent" aria-hidden="true" />
    <div class="site-header__container">
      <div class="site-header__mobile-row">
        <a href="/" class="site-header__brand">
          <span class="site-header__logo-wrap">
            <YCombinatorLogo
              v-if="useBlackLogo"
              :size="24"
              color="#000000"
              foreground-color="#ffffff"
              class="site-header__logo-img site-header__logo-img--black"
            />
            <img
              v-else
              :src="YLogo"
              class="site-header__logo-img"
              alt="Y Combinator Logo"
            >
          </span>
          <span class="site-header__logo-text">
            Hacker News
          </span>
        </a>

        <div class="site-header__mobile-actions">
          <a
            v-if="submitNavLink"
            :href="submitNavLink.href"
            class="site-header__submit-link site-header__submit-link--mobile"
            :class="{ 'site-header__submit-link--active': submitNavLink.active }"
            @click="closeNav"
          >
            <Send :size="14" aria-hidden="true" />
            <span>submit</span>
          </a>
          <button
            v-if="hasNavLinks"
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
        v-if="hasNavLinks"
        ref="navMenu"
        class="site-header__nav"
        :class="{ 'site-header__nav--open': navOpen }"
      >
        <a
          v-for="link in primaryNavLinks"
          :key="link.href"
          :href="link.href"
          class="site-header__nav-link"
          :class="{ 'site-header__nav-link--active': link.active }"
          @click="closeNav"
        >{{ link.label }}</a>
        <HeaderMoreDropdown
          :groups="overflowNavGroups"
          @navigate="closeNav"
        />
      </nav>

      <button
        v-if="navOpen"
        type="button"
        class="site-header__backdrop"
        aria-label="Close menu"
        @click="closeNav"
      />

      <div class="site-header__controls">
        <a
          v-if="submitNavLink"
          :href="submitNavLink.href"
          class="site-header__submit-link site-header__submit-link--desktop"
          :class="{ 'site-header__submit-link--active': submitNavLink.active }"
        >
          <Send :size="14" aria-hidden="true" />
          <span>submit</span>
        </a>
        <MetaSep
          v-if="submitNavLink && currentUser.hasAuthControls"
          class="site-header__control-sep"
        />
        <div v-if="currentUser.hasAuthControls" class="site-header__user-controls">
          <DropdownMenuRoot v-if="currentUser.user">
            <DropdownMenuTrigger as-child>
              <button type="button" class="site-header__user-trigger">
                <strong>{{ currentUser.user.name }}</strong>
                <span class="site-header__user-karma">({{ currentUser.user.karma }})</span>
                <ChevronDown :size="13" class="site-header__user-chevron" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuPortal defer :to="EXTENSION_ROOT_SELECTOR">
              <DropdownMenuContent
                class="site-header__user-menu-shell"
                side="bottom"
                align="end"
                :side-offset="8"
                :collision-padding="12"
              >
                <div class="site-header__user-menu">
                  <DropdownMenuItem as-child text-value="profile">
                    <a
                      :href="currentUser.profileUrl ?? ''"
                      class="site-header__user-menu-item"
                    >
                      <UserRound :size="14" aria-hidden="true" />
                      <span>profile</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="currentUser.logoutUrl"
                    as-child
                    text-value="logout"
                  >
                    <a
                      :href="currentUser.logoutUrl"
                      class="site-header__user-menu-item site-header__user-menu-item--danger"
                    >
                      <LogOut :size="14" aria-hidden="true" />
                      <span>logout</span>
                    </a>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
          <a v-else-if="currentUser.loginUrl" :href="currentUser.loginUrl">login</a>
        </div>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  --site-header-bar-color: #ff6600;
  border-bottom: 1px solid var(--color-chrome-border);
  background: var(--color-chrome-surface);

  &__accent {
    height: 4px;
    background: var(--site-header-bar-color);
  }

  &__container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 24px;
    max-width: max(1024px, 64rem);
    margin: 0 auto;
    padding: 8px 16px;
  }

  &__mobile-row {
    display: contents;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    color: var(--color-text);
    font-size: 1.15rem;
    font-weight: 800;

    &:hover {
      text-decoration: none;
    }
  }

  &__logo-wrap {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  &__logo-img {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  &__logo-text {
    position: relative;
    display: inline-block;
    font-family: var(--font-title);
    font-weight: 600;
  }

  &__mobile-actions {
    display: none;
    align-items: center;
    gap: 6px;
  }

  &__nav-toggle {
    display: none;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border: 1px solid var(--color-chrome-border);
    border-radius: 4px;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    user-select: none;

    &:hover {
      border-color: var(--color-accent);
      background: var(--color-bg);
      color: var(--color-text);
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    flex-wrap: nowrap;
    font-size: 1rem;
    font-weight: 500;
  }

  &__nav-link {
    white-space: nowrap;
    color: var(--color-text-muted);
    padding: 4px;
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

  &__submit-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 30px;
    padding: 0 4px;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
    transition: all 0.15s ease;

    &:hover {
      color: var(--color-text);
      text-decoration: none;
    }

    &--active {
      color: var(--color-accent-muted);
    }

    &--mobile {
      display: none;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    flex-shrink: 0;
    font-size: 1rem;
    font-weight: 500;
  }

  &__control-sep {
    flex: 0 0 auto;
  }

  &__user-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-muted);
    transition: all 0.15s ease;

    a {
      white-space: nowrap;
      color: var(--color-text);
    }

    a:hover {
      color: var(--color-accent);
    }
  }

  &__user-trigger {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 30px;
    padding: 0 4px;
    border: 0;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    font: inherit;
    white-space: nowrap;

    &:hover {
      color: var(--color-accent);
    }
  }

  &__user-karma,
  &__user-chevron {
    color: var(--color-text-muted);
  }

  &__user-menu {
    display: grid;
    min-width: 132px;
    padding: 6px;
    border: 1px solid var(--color-chrome-border);
    border-radius: 6px;
    background: var(--color-chrome-surface);
    box-shadow: var(--shadow-elevation);
  }

  &__user-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 8px;
    border-radius: 4px;
    color: var(--color-text-muted);
    font-weight: 600;

    &:hover,
    &[data-highlighted] {
      background: var(--color-bg);
      color: var(--color-text);
      text-decoration: none;
    }

    &--danger {
      color: var(--color-text-muted);

      &:hover,
      &[data-highlighted] {
        color: var(--color-danger);
      }
    }
  }

  @media (max-width: 768px) {
    &__container {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      padding: 8px;
    }

    &__mobile-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      width: 100%;
      position: relative;
      z-index: 110;
    }

    &__mobile-actions {
      display: flex;
      margin-left: auto;
    }

    &__submit-link {
      min-height: 32px;
      padding: 0 4px;

      &--desktop {
        display: none;
      }

      &--mobile {
        display: inline-flex;
      }
    }

    &__nav-toggle {
      display: flex;
    }

    &__nav {
      display: none;
      position: absolute;
      top: calc(100% - 1px);
      right: 16px;
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
      padding: 10px 16px;
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
      margin-left: 0;
      border-top: 1px solid var(--color-border);
      padding-top: 12px;
    }

    &__control-sep {
      display: none;
    }
  }

  #fancy-hn-root[data-theme="dark"] &,
  #fancy-hn-root[data-theme="nord"] &,
  #fancy-hn-root[data-theme="amoled"] & {
    .site-header__logo-img--black {
      box-shadow: 0 0 0 1px rgb(255 255 255 / 0.88);
    }
  }
}

:deep(.site-header__user-menu-shell) {
  z-index: 120;
}
</style>

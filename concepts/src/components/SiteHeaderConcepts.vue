<script setup lang="ts">
import YLogo from '@app/assets/ycombinator.svg';
import { ChevronDown, Menu, User } from 'lucide-vue-next';
import { ref } from 'vue';
import ConceptVariant from './ConceptVariant.vue';
import MockThemeToggle from './MockThemeToggle.vue';

interface MockLink {
  label: string;
  href: string;
}

interface MockLinkGroup {
  title: string;
  links: MockLink[];
}

const MOCK_LINK_HREF = '#';

function makeMockLinks(labels: string[]): MockLink[] {
  return labels.map(label => ({ label, href: MOCK_LINK_HREF }));
}

const primaryLinks = makeMockLinks(['new', 'threads', 'past', 'comments', 'ask', 'show']);
const expandedLinks = makeMockLinks(['jobs', 'best', 'classic', 'whoishiring']);
const v4PrimaryLinks = primaryLinks;
const v5PrimaryLinks = makeMockLinks(['new', 'threads', 'past', 'best', 'ask', 'show']);
const v4DropdownGroups: MockLinkGroup[] = [
  { title: 'community', links: makeMockLinks(['jobs', 'whoishiring']) },
  { title: 'discovery', links: makeMockLinks(['best', 'classic']) },
];
const v5DropdownGroups: MockLinkGroup[] = [
  { title: 'community', links: makeMockLinks(['comments', 'jobs', 'whoishiring']) },
  { title: 'discovery', links: makeMockLinks(['classic']) },
];
const v5MobileGroups: MockLinkGroup[] = [
  { title: 'community', links: makeMockLinks(['comments', 'jobs', 'whoishiring']) },
  { title: 'more', links: makeMockLinks(['classic']) },
];
const submitLink = makeMockLinks(['submit'])[0];
const allLinks = [...primaryLinks, ...expandedLinks, submitLink];

const navOpen1 = ref(false);
const navOpen2 = ref(false);
const navOpen3 = ref(false);
const navOpen4 = ref(false);
const navOpenDropdown5 = ref(false);
const moreOpen1 = ref(false);
</script>

<template>
  <section class="concept-app__section-head">
    <div>
      <p class="concept-app__section-eyebrow">
        site header
      </p>
      <h2 class="concept-app__section-title">
        Handling cluttered navigation with 11+ links
      </h2>
    </div>
    <p class="concept-app__section-copy">
      With the addition of /best, /classic, and /whoishiring, the header no longer gracefully scales down.
      These concepts explore different interaction models for desktop overflow and mobile layout.
    </p>
  </section>

  <section class="header-concepts">
    <!-- Variant 1 -->
    <ConceptVariant tag="section" class="header-variant" eyebrow="Variant 1" title="Priority Links + 'More' Dropdown">
      <div class="mock-browser">
        <header class="sh-v1">
          <div class="sh-v1__container">
            <div class="sh-v1__mobile-row">
              <a href="#" class="sh-brand">
                <img :src="YLogo" class="sh-logo-img" alt="Y Combinator Logo">
                <span class="sh-logo-text">Hacker News</span>
              </a>

              <div class="sh-v1__controls-mobile">
                <button type="button" class="icon-button">
                  <User :size="18" />
                </button>
                <MockThemeToggle />
                <button type="button" class="sh-mobile-toggle" @click="navOpen1 = !navOpen1">
                  <Menu :size="18" />
                </button>
              </div>
            </div>

            <nav class="sh-v1__nav" :class="{ 'sh-v1__nav--open': navOpen1 }">
              <div class="sh-v1__nav-primary">
                <a v-for="link in primaryLinks" :key="link.label" href="#" class="sh-v1__link">{{ link.label }}</a>
              </div>

              <div class="sh-v1__more-container">
                <button type="button" class="sh-v1__more-btn" @click="moreOpen1 = !moreOpen1">
                  more <ChevronDown :size="14" />
                </button>
                <div v-show="moreOpen1" class="sh-v1__more-dropdown">
                  <a v-for="link in expandedLinks" :key="link.label" href="#" class="sh-v1__link">{{ link.label }}</a>
                </div>
              </div>

              <a href="#" class="sh-v1__link sh-v1__submit-desktop">{{ submitLink.label }}</a>

              <div class="sh-v1__nav-mobile-extras">
                <hr>
                <span class="sh-mobile-label">more</span>
                <a v-for="link in expandedLinks" :key="link.label" href="#" class="sh-v1__link">{{ link.label }}</a>
                <a href="#" class="sh-v1__link">{{ submitLink.label }}</a>
              </div>
            </nav>

            <div class="sh-v1__controls-desktop">
              <a href="#" class="sh-v1__user">ews (123)</a>
              <MockThemeToggle />
            </div>
          </div>
        </header>
        <div class="mock-content">
          Page content...
        </div>
      </div>
    </ConceptVariant>

    <!-- Variant 2 -->
    <ConceptVariant tag="section" class="header-variant" eyebrow="Variant 2" title="Two-Tier: Brand/Controls up top, Scrollable Nav below">
      <div class="mock-browser">
        <header class="sh-v2">
          <div class="sh-v2__top">
            <a href="#" class="sh-brand">
              <img :src="YLogo" class="sh-logo-img" alt="Y Combinator Logo">
              <span class="sh-logo-text">Hacker News</span>
            </a>
            <div class="sh-v2__controls">
              <a href="#" class="sh-v2__user">ews (123)</a>
              <MockThemeToggle />
            </div>
          </div>
          <div class="sh-v2__bottom">
            <nav class="sh-v2__scroll-nav">
              <a v-for="link in allLinks" :key="link.label" href="#" class="sh-v2__link">{{ link.label }}</a>
            </nav>
          </div>
        </header>
        <div class="mock-content">
          Page content...
        </div>
      </div>
    </ConceptVariant>

    <!-- Variant 3 -->
    <ConceptVariant tag="section" class="header-variant" eyebrow="Variant 3" title="Horizontal Swipe Nav (Shared Mobile/Desktop paradigm)">
      <div class="mock-browser">
        <header class="sh-v3">
          <div class="sh-v3__container">
            <div class="sh-v3__left">
              <a href="#" class="sh-brand sh-brand--accent">
                <img :src="YLogo" class="sh-logo-img" alt="Y Combinator Logo">
                <span class="sh-logo-text">HN</span>
              </a>
            </div>
            <div class="sh-v3__middle">
              <nav class="sh-v3__nav-scroll">
                <a v-for="link in allLinks" :key="link.label" href="#" class="sh-v3__link">{{ link.label }}</a>
              </nav>
            </div>
            <div class="sh-v3__right">
              <button type="button" class="icon-button">
                <User :size="18" />
              </button>
              <MockThemeToggle />
            </div>
          </div>
        </header>
        <div class="mock-content">
          Page content...
        </div>
      </div>
    </ConceptVariant>

    <!-- Variant 4 -->
    <ConceptVariant tag="section" class="header-variant" eyebrow="Variant 4" title="Advanced Grouped Dropdown (No swipe)">
      <div class="mock-browser">
        <header class="sh-v4">
          <div class="sh-v4__container">
            <div class="sh-v4__mobile-row">
              <a href="#" class="sh-brand">
                <img :src="YLogo" class="sh-logo-img" alt="Y Combinator Logo">
                <span class="sh-logo-text">Hacker News</span>
              </a>

              <div class="sh-v4__controls-mobile">
                <button type="button" class="icon-button">
                  <User :size="18" />
                </button>
                <MockThemeToggle />
                <button type="button" class="sh-mobile-toggle" @click="navOpen3 = !navOpen3">
                  <Menu :size="18" />
                </button>
              </div>
            </div>

            <nav class="sh-v4__nav" :class="{ 'sh-v4__nav--open': navOpen3 }">
              <a v-for="link in v4PrimaryLinks" :key="link.label" href="#" class="sh-v4__link">{{ link.label }}</a>

              <div class="sh-v4__dropdown-container">
                <button type="button" class="sh-v4__dropdown-btn" @click="navOpen2 = !navOpen2">
                  explore <ChevronDown :size="14" />
                </button>
                <div v-show="navOpen2" class="sh-v4__mega-dropdown">
                  <div
                    v-for="group in v4DropdownGroups"
                    :key="group.title"
                    class="sh-v4__dropdown-group"
                  >
                    <strong class="sh-v4__group-title">{{ group.title }}</strong>
                    <a
                      v-for="link in group.links"
                      :key="link.label"
                      :href="link.href"
                      class="sh-v4__dropdown-link"
                    >
                      {{ link.label }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- mobile submit link -->
              <a href="#" class="sh-v4__link sh-v4__submit-mobile">{{ submitLink.label }}</a>
            </nav>

            <div class="sh-v4__right sh-v4__controls-desktop">
              <a href="#" class="sh-v4__link sh-v4__submit-desktop">{{ submitLink.label }}</a>
              <button type="button" class="icon-button">
                <User :size="18" />
              </button>
              <MockThemeToggle />
            </div>
          </div>
        </header>
        <div class="mock-content">
          Page content...
        </div>
      </div>
    </ConceptVariant>

    <!-- Variant 5 -->
    <ConceptVariant tag="section" class="header-variant" eyebrow="Variant 5" title="Visible priorities + grouped overflow">
      <div class="mock-browser">
        <header class="sh-v5">
          <div class="sh-v5__container">
            <div class="sh-v5__mobile-row">
              <a href="#" class="sh-brand">
                <img :src="YLogo" class="sh-logo-img" alt="Y Combinator Logo">
                <span class="sh-logo-text">Hacker News</span>
              </a>

              <div class="sh-v5__controls-mobile">
                <button type="button" class="icon-button">
                  <User :size="18" />
                </button>
                <MockThemeToggle />
                <button type="button" class="sh-mobile-toggle" @click="navOpen4 = !navOpen4">
                  <Menu :size="18" />
                </button>
              </div>
            </div>

            <nav class="sh-v5__nav" :class="{ 'sh-v5__nav--open': navOpen4 }">
              <a v-for="link in v5PrimaryLinks" :key="link.label" href="#" class="sh-v5__link">{{ link.label }}</a>

              <div class="sh-v5__dropdown-container">
                <button type="button" class="sh-v5__dropdown-btn" @click="navOpenDropdown5 = !navOpenDropdown5">
                  explore <ChevronDown :size="14" />
                </button>
                <div v-show="navOpenDropdown5" class="sh-v5__mega-dropdown">
                  <div
                    v-for="group in v5DropdownGroups"
                    :key="group.title"
                    class="sh-v5__dropdown-group"
                  >
                    <strong class="sh-v5__group-title">{{ group.title }}</strong>
                    <a
                      v-for="link in group.links"
                      :key="link.label"
                      :href="link.href"
                      class="sh-v5__dropdown-link"
                    >
                      {{ link.label }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="sh-v5__mobile-groups">
                <hr>
                <div
                  v-for="group in v5MobileGroups"
                  :key="group.title"
                  class="sh-v5__mobile-group"
                >
                  <span class="sh-v5__mobile-group-title">{{ group.title }}</span>
                  <a
                    v-for="link in group.links"
                    :key="link.label"
                    :href="link.href"
                    class="sh-v5__link"
                  >
                    {{ link.label }}
                  </a>
                </div>
              </div>

              <a href="#" class="sh-v5__link sh-v5__submit-mobile">{{ submitLink.label }}</a>
            </nav>

            <div class="sh-v5__right sh-v5__controls-desktop">
              <a href="#" class="sh-v5__link sh-v5__submit-desktop">{{ submitLink.label }}</a>
              <button type="button" class="icon-button">
                <User :size="18" />
              </button>
              <MockThemeToggle />
            </div>
          </div>
        </header>
        <div class="mock-content">
          Page content...
        </div>
      </div>
    </ConceptVariant>
  </section>
</template>

<style scoped lang="scss">
.header-concepts {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.mock-browser {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg);
  resize: horizontal;
  width: 100%;
  max-width: 1000px;
  min-width: 320px;
}

.mock-content {
  padding: 2rem;
  color: var(--color-text-muted);
  min-height: 100px;
  font-family: var(--font-sans);
}

.icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  &:hover { color: var(--color-text); }
}

.sh-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
}

.sh-logo-img {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sh-logo-text {
  font-family: var(--font-title);
  font-weight: 600;
}

/* --- Variant 1: Priority + More --- */
.sh-v1 {
  background: var(--color-chrome-surface);
  border-bottom: 1px solid var(--color-chrome-border);
  border-top: 4px solid #ff6600;

  &__container {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 16px;
  }

  &__mobile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  &__controls-mobile { display: none; }

  &__nav {
    display: flex;
    align-items: center;
    flex: 1;
  }

  &__nav-primary {
    display: flex;
    gap: 12px;
  }

  &__link {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    text-decoration: none;
    white-space: nowrap;
    &:hover { color: var(--color-text); }
  }
  &__submit-desktop {
    margin-left: 12px;
  }

  &__more-container {
    position: relative;
    margin-left: 12px;
  }

  &__more-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px;
    &:hover { color: var(--color-text); }
  }

  &__more-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--color-chrome-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-elevation);
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    border-radius: 4px;
    z-index: 10;
    min-width: 140px;

    .sh-v1__link {
      padding: 6px 16px;
      &:hover { background: var(--color-bg); }
    }
  }

  &__nav-mobile-extras { display: none; }

  &__controls-desktop {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
  }

  &__user {
    color: var(--color-text);
    font-size: 0.9rem;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
  @media (max-width: 768px) {
    &__container {
      flex-direction: column;
      align-items: stretch;
      padding: 0;
      gap: 0;
    }

    &__mobile-row {
      padding: 12px 16px;
      width: 100%;
    }

    &__controls-mobile {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__controls-desktop { display: none; }
    &__more-container { display: none; }
    &__submit-desktop { display: none; }

    &__nav {
      display: none;
      flex-direction: column;
      background: var(--color-chrome-surface);
      border-top: 1px solid var(--color-border);
      padding: 8px 0;

      &--open {
        display: flex;
      }
    }

    &__nav-primary {
      flex-direction: column;
      gap: 0;
    }

    &__nav-mobile-extras {
      display: flex;
      flex-direction: column;
      hr { margin: 8px 16px; border-color: var(--color-border); }
      .sh-mobile-label { padding: 4px 16px; font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); opacity: 0.7;}
    }

    &__link {
      padding: 12px 16px;
      font-size: 1rem;
    }
  }
}
/* --- Variant 2: Two-Tier --- */
.sh-v2 {
  background: var(--color-chrome-surface);
  border-top: 4px solid #ff6600;
  border-bottom: 1px solid var(--color-chrome-border);

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__user {
    font-size: 0.9rem;
    color: var(--color-text);
    text-decoration: none;
  }

  &__bottom {
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  &__scroll-nav {
    display: flex;
    gap: 16px;
    padding: 10px 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  &__link {
    white-space: nowrap;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    text-decoration: none;
    &:hover { color: var(--color-text); }
  }
}
/* --- Variant 3: Horizontal Swipe --- */
.sh-v3 {
  background: var(--color-chrome-surface);
  border-top: 4px solid #ff6600;
  border-bottom: 1px solid var(--color-chrome-border);

  &__container {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 16px;
  }

  &__left {
    flex-shrink: 0;

    .sh-brand--accent {
      background: #ff6600;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      .sh-logo-img { display: none; }
    }
  }

  &__middle {
    flex: 1;
    min-width: 0;
  }

  &__nav-scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    mask-image: linear-gradient(to right, black 90%, transparent 100%);
  }

  &__right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__link {
    white-space: nowrap;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    text-decoration: none;
    &:hover { color: var(--color-text); }
  }
}

/* --- Variant 4 & 5: Advanced Dropdown with mobile hamburger --- */
.sh-v4, .sh-v5 {
  background: var(--color-chrome-surface);
  border-bottom: 1px solid var(--color-chrome-border);
  border-top: 4px solid #ff6600;

  &__container {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 16px;
  }

  &__mobile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  &__controls-mobile { display: none; }

  &__nav {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__link {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    text-decoration: none;
    white-space: nowrap;
    &:hover { color: var(--color-text); }
  }

  &__dropdown-container {
    position: relative;
    margin-left: auto;
  }

  &__dropdown-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px;
    &:hover { color: var(--color-text); }
  }

  &__mega-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 16px;
    background: var(--color-chrome-surface);
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 24px;
    padding: 16px;
    border-radius: 6px;
    z-index: 20;
  }

  &__dropdown-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 100px;
  }

  &__group-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 4px;
    margin-bottom: 4px;
  }

  &__dropdown-link {
    color: var(--color-text);
    font-size: 0.9rem;
    text-decoration: none;
    &:hover { color: var(--color-accent); }
  }

  &__submit-mobile { display: none; }

  @media (max-width: 768px) {
    &__container {
      flex-direction: column;
      align-items: stretch;
      padding: 0;
      gap: 0;
    }

    &__mobile-row {
      padding: 12px 16px;
      width: 100%;
    }

    &__controls-mobile {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__controls-desktop { display: none; }

    &__nav {
      display: none;
      flex-direction: column;
      background: var(--color-chrome-surface);
      border-top: 1px solid var(--color-border);
      padding: 8px 0;

      &--open {
        display: flex;
      }
    }

    &__submit-mobile {
      display: block;
      padding: 6px 16px;
      margin-top: 8px;
      border-top: 1px solid var(--color-border);
    }

    &__link {
      padding: 6px 16px;
      width: 100%;
    }

    &__dropdown-container {
      width: 100%;
      margin: 0;
      padding: 6px 16px;
    }

    &__mega-dropdown {
      position: static;
      box-shadow: none;
      border: none;
      padding: 12px 0 0 12px;
      margin: 0;
      flex-direction: column;
      gap: 16px;
      background: transparent;
    }
  }
}

.sh-v5 {
  &__mobile-groups {
    display: none;
  }

  &__mobile-group {
    display: flex;
    flex-direction: column;
  }

  &__mobile-group-title {
    display: block;
    padding: 6px 16px;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: lowercase;
  }

  @media (min-width: 769px) {
    &__mobile-groups {
      display: none;
    }
  }

  @media (max-width: 768px) {
    &__dropdown-container {
      display: none;
    }

    &__mobile-groups {
      display: flex;
      flex-direction: column;

      hr {
        margin: 8px 16px;
        border-color: var(--color-border);
      }
    }

    &__submit-mobile {
      margin-top: 0;
    }
  }
}
</style>

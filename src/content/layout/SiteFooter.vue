<script setup lang="ts">
import { inject, ref, type Ref } from 'vue';
import YLogo from '@/assets/ycombinator.svg';
import Keycap from '@/content/shared/Keycap.vue';
import {
  Clock,
  Search,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-vue-next';

const renderTime = inject<Ref<number>>('renderTime', ref(0));
const openSearch = inject<() => void>('openSearch');

interface FooterLink {
  text: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Docs',
    links: [
      { text: 'Welcome', href: 'newswelcome.html' },
      { text: 'Guidelines', href: 'newsguidelines.html' },
      { text: 'FAQ', href: 'newsfaq.html' },
      { text: 'Formatting', href: 'formatdoc' },
      { text: 'Show HN', href: 'showhn.html' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Lists', href: 'lists' },
      { text: 'API', href: 'https://github.com/HackerNews/API', external: true },
      { text: 'Security', href: 'security.html' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'Legal', href: 'https://www.ycombinator.com/legal/', external: true },
      { text: 'Apply to YC', href: 'https://www.ycombinator.com/apply/', external: true },
      { text: 'Contact', href: 'mailto:hn@ycombinator.com' },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/ycombinator', label: 'Twitter' },
  { icon: Facebook, href: 'https://www.facebook.com/YCombinator/', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/ycombinator', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/school/y-combinator/', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://www.youtube.com/c/ycombinator', label: 'YouTube' },
];
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__container">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <div class="site-footer__logo">
            <img :src="YLogo" width="40" height="40" alt="Y Combinator Logo" />
            <h3 class="site-footer__tagline">Make something people want.</h3>
          </div>
        </div>

        <div class="site-footer__content">
          <div class="site-footer__grid">
            <div
              v-for="column in footerColumns"
              :key="column.title"
              class="site-footer__column"
            >
              <h4 class="site-footer__column-title">{{ column.title }}</h4>
              <ul class="site-footer__link-list">
                <li v-for="link in column.links" :key="link.text">
                  <a
                    :href="link.href"
                    :target="link.external ? '_blank' : undefined"
                    :rel="link.external ? 'noopener noreferrer' : undefined"
                    class="site-footer__link"
                  >{{ link.text }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="site-footer__divider"></div>

      <div class="site-footer__disclaimer">
        <p>Hacker News and the YC brand are property of Y Combinator.</p>
        <p>This browser extension is an independent, open-source project and is not affiliated with, endorsed by, or associated with Y Combinator.</p>
        <p>The extension does not collect any user data, does not track activity, and makes no network requests beyond those already performed natively by Hacker News.</p>
      </div>

      <div class="site-footer__bottom">
        <div class="site-footer__bottom-left">
          <p class="site-footer__metadata">
            <Clock :size="12" />
            <span>Rendered in {{ renderTime }}ms</span>
          </p>
          <div class="site-footer__socials">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="site-footer__social-link"
              :title="social.label"
            >
              <component :is="social.icon" :size="20" />
            </a>
          </div>
        </div>

        <div class="site-footer__bottom-right">
          <button
            type="button"
            class="site-footer__search-trigger"
            aria-label="Search Hacker News"
            @click="openSearch?.()"
          >
            <Search :size="14" class="site-footer__search-icon" aria-hidden="true" />
            <span class="site-footer__search-placeholder">Search HN…</span>
            <Keycap :platform-modifier="true" :keys="['K']" />
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  margin-top: 2rem;
  padding: 4rem 1.5rem 3rem;
  background: var(--color-surface);
  border-top: 3px solid var(--color-accent);
  color: var(--color-text);
  font-family: var(--font-title);

  // Theme overrides
  #fancy-hn-root:not([data-theme]) & {
    background: #000000;
    color: #f5f5ee;

    .site-footer__link {
      color: #f5f5ee;
      opacity: 0.7;

      &:hover {
        opacity: 1;
        text-decoration: none;
        color: #fff;
      }
    }

    .site-footer__sep {
      color: #f5f5ee;
      opacity: 0.3;
    }

    .site-footer__tagline {
      color: #f5f5ee;
    }

    .site-footer__column-title {
      color: #f5f5ee;
      opacity: 0.9;
    }

    .site-footer__copyright {
      color: #f5f5ee;
      opacity: 0.6;
    }

    .site-footer__social-link {
      color: #f5f5ee;
      opacity: 0.8;

      &:hover {
        color: #fff;
        opacity: 1;
      }
    }

    .site-footer__divider {
      border-color: rgba(255, 255, 255, 0.1);
    }

    .site-footer__metadata {
      color: #f5f5ee;
      opacity: 0.5;
    }

    .site-footer__search-trigger {
      --keycap-bg: rgba(255, 255, 255, 0.06);
      --keycap-border: rgba(255, 255, 255, 0.2);
      --keycap-text: rgba(245, 245, 238, 0.7);
      border-color: rgba(255, 255, 255, 0.24);
      background: rgba(255, 255, 255, 0.1);
      color: rgba(245, 245, 238, 0.78);

      &:hover {
        border-color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.14);
        color: #f5f5ee;
      }
    }

    .site-footer__search-placeholder {
      color: rgba(245, 245, 238, 0.62);
      opacity: 1;
    }
  }

  #fancy-hn-root[data-theme="amoled"] & {
    background: #0a0a0a;
    box-shadow: 0 -10px 40px -10px rgba(255, 102, 0, 0.15);

    .site-footer__search-trigger {
      --keycap-bg: rgba(255, 255, 255, 0.05);
      --keycap-border: rgba(255, 255, 255, 0.16);
      --keycap-text: rgba(255, 255, 255, 0.68);
      border-color: rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.76);

      &:hover {
        background: rgba(255, 255, 255, 0.07);
      }
    }

    .site-footer__search-placeholder {
      color: rgba(255, 255, 255, 0.58);
      opacity: 1;
    }
  }

  // Block structure
  &__container {
    max-width: 1024px;
    margin: 0 auto;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 3rem;
    margin-bottom: 3rem;

    @media (max-width: 980px) {
      flex-direction: column;
      gap: 2rem;
    }
  }

  &__brand {
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1.25rem;

    @media (max-width: 980px) {
      width: 100%;
      align-items: stretch;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 1rem;

    img,
    svg {
      flex-shrink: 0;
    }
  }

  &__tagline {
    font-size: 1.15rem;
    font-weight: 300;
    letter-spacing: -0.01em;
  }

  &__grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem 2rem;

    @media (max-width: 720px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 380px) {
      grid-template-columns: 1fr;
    }
  }

  &__column-title {
    margin-bottom: 0.85rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  &__link-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__link {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    transition: color 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: var(--color-accent);
      text-decoration: none;
    }
  }

  &__search-trigger {
    --keycap-text: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.38rem 0.75rem 0.38rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.875rem;
    transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-text);
    }

    &:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--color-accent) 78%, white 22%);
      outline-offset: 2px;
    }
  }

  &__search-icon {
    flex-shrink: 0;
  }

  &__search-placeholder {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    opacity: 0.6;
  }

  &__divider {
    height: 1px;
    background: var(--color-border);
    margin-bottom: 2rem;
    opacity: 0.5;
  }

  &__disclaimer {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.78rem;
    line-height: 1.6;
    color: var(--color-text-muted);
    opacity: 0.6;

    #fancy-hn-root:not([data-theme]) & {
      color: #f5f5ee;
      opacity: 0.5;
    }
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__bottom-left {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__bottom-right {
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  &__metadata {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  &__socials {
    display: flex;
    gap: 1rem;
  }

  &__social-link {
    color: var(--color-text-muted);
    transition: transform 0.2s ease, color 0.2s ease;

    &:hover {
      color: var(--color-accent);
      transform: translateY(-2px);
    }
  }
}
</style>

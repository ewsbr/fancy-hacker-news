<script setup lang="ts">
import { inject, ref, type Ref } from 'vue';
import YLogo from '@/assets/ycombinator.svg';
import {
  Clock,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-vue-next';

const renderTime = inject<Ref<number>>('renderTime', ref(0));

const links = [
  { text: 'Guidelines', href: 'newsguidelines.html' },
  { text: 'FAQ', href: 'newsfaq.html' },
  { text: 'Lists', href: 'lists' },
  { text: 'API', href: 'https://github.com/HackerNews/API', external: true },
  { text: 'Security', href: 'security.html' },
  { text: 'Legal', href: 'https://www.ycombinator.com/legal/', external: true },
  { text: 'Apply to YC', href: 'https://www.ycombinator.com/apply/', external: true },
  { text: 'Contact', href: 'mailto:hn@ycombinator.com' },
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

        <div class="site-footer__nav">
          <nav class="site-footer__links">
            <template v-for="(link, i) in links" :key="link.text">
              <a
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="site-footer__link"
              >{{ link.text }}</a>
              <span v-if="i < links.length - 1" class="site-footer__sep">|</span>
            </template>
          </nav>

          <form method="get" action="//hn.algolia.com/" class="site-footer__search">
            <label for="hn-footer-search" class="site-footer__search-label">Search:</label>
            <input
              id="hn-footer-search"
              type="text"
              name="q"
              size="17"
              autocorrect="off"
              spellcheck="false"
              autocapitalize="none"
              autocomplete="off"
              class="site-footer__search-input"
            />
          </form>
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
          <p class="site-footer__copyright">&copy; 2026 Y Combinator</p>
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
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  margin-top: 4rem;
  padding: 4rem 1.5rem 3rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: var(--font-title);

  #hn-modern-root:not([data-theme]) & {
    background: #000000;
    color: #f5f5ee;
    border-top: none;

    .site-footer__link { color: #f5f5ee; opacity: 0.7; &:hover { opacity: 1; text-decoration: none; color: #fff; } }
    .site-footer__sep { color: #f5f5ee; opacity: 0.3; }
    .site-footer__tagline { color: #f5f5ee; }
    .site-footer__copyright { color: #f5f5ee; opacity: 0.6; }
    .site-footer__social-link { color: #f5f5ee; opacity: 0.8; &:hover { color: #fff; opacity: 1; } }
    .site-footer__divider { border-color: rgba(255, 255, 255, 0.1); }
    .site-footer__metadata { color: #f5f5ee; opacity: 0.5; }
    .site-footer__search-label { color: #f5f5ee; opacity: 0.7; }
    .site-footer__search-input {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #f5f5ee;
    }
  }

  #hn-modern-root[data-theme="dark"] &,
  #hn-modern-root[data-theme="nord"] & {
    border-top: 2px solid var(--color-border);
  }

  #hn-modern-root[data-theme="amoled"] & {
    background: #0a0a0a;
    border-top: 3px solid var(--color-accent);
    box-shadow: 0 -10px 40px -10px rgba(255, 102, 0, 0.15);
  }
}

.site-footer__container {
  max-width: 1024px;
  margin: 0 auto;
}

.site-footer__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
}

.site-footer__brand {
  flex-shrink: 0;
}

.site-footer__logo {
  display: flex;
  align-items: center;
  gap: 1rem;

  img,
  svg {
    flex-shrink: 0;
  }
}

.site-footer__tagline {
  font-size: 1.15rem;
  font-weight: 300;
  letter-spacing: -0.01em;
}

.site-footer__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
}

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
}

.site-footer__link {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: var(--color-accent);
    text-decoration: none;
  }
}

.site-footer__sep {
  color: var(--color-text-muted);
  opacity: 0.4;
  font-size: 0.875rem;
  user-select: none;
}

.site-footer__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.site-footer__search-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.site-footer__search-input {
  font-family: var(--font-body);
  font-size: 0.875rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-text);
  outline: none;

  &:focus {
    border-color: var(--color-accent);
  }
}

.site-footer__divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: 2rem;
  opacity: 0.5;
}

.site-footer__disclaimer {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  opacity: 0.6;

  #hn-modern-root:not([data-theme]) & {
    color: #f5f5ee;
    opacity: 0.5;
  }
}

.site-footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.site-footer__bottom-left {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.site-footer__copyright {
  font-size: 0.875rem;
  opacity: 0.7;
}

.site-footer__metadata {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.site-footer__socials {
  display: flex;
  gap: 1rem;
}

.site-footer__social-link {
  color: var(--color-text-muted);
  transition: transform 0.2s ease, color 0.2s ease;

  &:hover {
    color: var(--color-accent);
    transform: translateY(-2px);
  }
}
</style>

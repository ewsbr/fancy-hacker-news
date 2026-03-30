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

const programLinks = [
  { text: 'YC Program', href: 'https://www.ycombinator.com/about', external: true },
  { text: 'Startup School', href: 'https://www.startupschool.org', external: true },
  { text: 'Work at a Startup', href: 'https://www.ycombinator.com/jobs', external: true },
  { text: 'Co-Founder Matching', href: 'https://www.ycombinator.com/cofounder-matching', external: true },
];

const resourceLinks = [
  { text: 'Guidelines', href: 'newsguidelines.html' },
  { text: 'FAQ', href: 'newsfaq.html' },
  { text: 'Lists', href: 'lists' },
  { text: 'API', href: 'https://github.com/HackerNews/API', external: true },
  { text: 'Security', href: 'security.html' },
  { text: 'Apply to YC', href: 'https://www.ycombinator.com/apply/', external: true },
];

const companyLinks = [
  { text: 'YC Blog', href: 'https://www.ycombinator.com/blog', external: true },
  { text: 'Contact', href: 'mailto:hn@ycombinator.com' },
  { text: 'Legal', href: 'https://www.ycombinator.com/legal/', external: true },
  { text: 'Privacy', href: 'https://www.ycombinator.com/legal/#privacy', external: true },
  { text: 'Terms', href: 'https://www.ycombinator.com/legal/#tou', external: true },
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

        <div class="site-footer__grid">
          <div class="site-footer__column">
            <h4 class="site-footer__column-title">Programs</h4>
            <ul class="site-footer__link-list">
              <li v-for="link in programLinks" :key="link.text">
                <a :href="link.href" :target="link.external ? '_blank' : undefined" class="site-footer__link">{{ link.text }}</a>
              </li>
            </ul>
          </div>
          <div class="site-footer__column">
            <h4 class="site-footer__column-title">Resources</h4>
            <ul class="site-footer__link-list">
              <li v-for="link in resourceLinks" :key="link.text">
                <a :href="link.href" :target="link.external ? '_blank' : undefined" class="site-footer__link">{{ link.text }}</a>
              </li>
            </ul>
          </div>
          <div class="site-footer__column">
            <h4 class="site-footer__column-title">Company</h4>
            <ul class="site-footer__link-list">
              <li v-for="link in companyLinks" :key="link.text">
                <a :href="link.href" :target="link.external ? '_blank' : undefined" class="site-footer__link">{{ link.text }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="site-footer__divider"></div>

      <div class="site-footer__bottom">
        <div class="site-footer__bottom-left">
          <p class="site-footer__copyright">© 2026 Y Combinator</p>
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

  // High contrast override for light theme (when no data-theme attribute exists)
  #hn-modern-root:not([data-theme]) & {
    background: #000000;
    color: #f5f5ee; // beige-light
    border-top: none;

    .site-footer__column-title { color: #f5f5ee; opacity: 0.9; }
    .site-footer__link { color: #f5f5ee; opacity: 0.7; &:hover { opacity: 1; text-decoration: none; color: #fff; } }
    .site-footer__tagline { color: #f5f5ee; }
    .site-footer__copyright { color: #f5f5ee; opacity: 0.6; }
    .site-footer__social-link { color: #f5f5ee; opacity: 0.8; &:hover { color: #fff; opacity: 1; } }
    .site-footer__divider { border-color: rgba(255, 255, 255, 0.1); }
    .site-footer__metadata { color: #f5f5ee; opacity: 0.5; }
  }

  // Accent border for dark/nord themes
  #hn-modern-root[data-theme="dark"] &,
  #hn-modern-root[data-theme="nord"] & {
    border-top: 2px solid var(--color-border);
  }

  // Extra distinction for AMOLED
  #hn-modern-root[data-theme="amoled"] & {
    background: #0a0a0a; // Very dark gray, but not pitch black
    border-top: 3px solid var(--color-accent);
    box-shadow: 0 -10px 40px -10px rgba(255, 102, 0, 0.15); // Subtle orange glow
  }
}

.site-footer__container {
  max-width: 1024px;
  margin: 0 auto;
}

.site-footer__top {
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2.5rem;
  }
}

.site-footer__brand {
  flex: 1;
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

.site-footer__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  flex: 2;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.site-footer__column-title {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.site-footer__link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.site-footer__link {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-accent);
    text-decoration: none;
  }
}

.site-footer__divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: 2rem;
  opacity: 0.5;
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

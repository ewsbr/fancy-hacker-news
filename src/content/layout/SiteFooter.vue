<script setup lang="ts">
import { inject } from 'vue';
import { Clock } from 'lucide-vue-next';

const renderTime = inject<number>('renderTime', 0);

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
</script>

<template>
  <footer class="site-footer">
    <nav class="site-footer__nav">
      <a
        v-for="link in links"
        :key="link.text"
        :href="link.href"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noopener noreferrer' : undefined"
        class="site-footer__link"
      >
        {{ link.text }}
      </a>
    </nav>

    <form action="https://hn.algolia.com/" method="get" class="site-footer__search-form">
      <label for="hn-search" class="site-footer__search-label">Search:</label>
      <input
        id="hn-search"
        name="q"
        type="text"
        placeholder="Search Hacker News..."
        class="site-footer__search-input"
      />
    </form>

    <p class="site-footer__render-time">
      <Clock class="site-footer__render-time-icon" :size="12" />
      Rendered in {{ renderTime }} ms
    </p>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  max-width: 1024px;
  margin: 2rem auto 0;
  padding: 3rem 1rem 4rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 1.5rem;
  row-gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.625;
}

.site-footer__link {
  color: var(--color-text-muted);

  &:hover {
    color: var(--color-text);
  }
}

.site-footer__search-form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.site-footer__search-label {
  color: var(--color-text-muted);
  font-weight: 600;
}

.site-footer__search-input {
  width: 250px;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: var(--color-accent);
    background: var(--color-surface);
  }
}

.site-footer__render-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 1.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  opacity: 0.6;
}

.site-footer__render-time-icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .site-footer__search-form {
    flex-wrap: wrap;
  }
}
</style>

<script setup lang="ts">
import { inject } from 'vue';
import type { RouteDescriptor } from '@/router';
import SearchTrigger from '@/content/ui/modals/SearchTrigger.vue';

const route = inject<RouteDescriptor>('route')!;

const requestedPath = route.params.path ?? location.pathname + location.search;
const requestedUrl = `https://news.ycombinator.com${requestedPath}`;
const responseDate = new Date().toUTCString();
</script>

<template>
  <div class="nf-page">

    <!-- 404 heading -->
    <div class="nf-heading">
      <span class="nf-heading__code" aria-hidden="true">404</span>
      <div class="nf-heading__meta">
        <p class="nf-heading__title">Page not found</p>
        <p class="nf-heading__sub">
          <code>{{ requestedPath }}</code> doesn't exist on Hacker News.
        </p>
      </div>
    </div>

    <!-- Terminal -->
    <div class="nf-terminal">
      <div class="nf-terminal__bar" aria-hidden="true">
        <span class="nf-terminal__dot nf-terminal__dot--red"></span>
        <span class="nf-terminal__dot nf-terminal__dot--yellow"></span>
        <span class="nf-terminal__dot nf-terminal__dot--green"></span>
        <span class="nf-terminal__bar-title">bash</span>
      </div>

      <div class="nf-terminal__body" role="log" aria-label="Terminal output showing the 404 response">
        <p class="nf-terminal__line">
          <span class="nf-terminal__prompt" aria-hidden="true">$ </span>
          <span class="nf-terminal__cmd">curl -si "{{ requestedUrl }}"</span>
        </p>
        <p class="nf-terminal__line nf-terminal__line--status">HTTP/2 404 </p>
        <p class="nf-terminal__line nf-terminal__line--header"><span class="nf-terminal__hkey">server:</span> nginx</p>
        <p class="nf-terminal__line nf-terminal__line--header"><span class="nf-terminal__hkey">date:</span> {{ responseDate }}</p>
        <p class="nf-terminal__line nf-terminal__line--header"><span class="nf-terminal__hkey">content-type:</span> text/plain; charset=utf-8</p>
        <p class="nf-terminal__line nf-terminal__line--header"><span class="nf-terminal__hkey">vary:</span> Accept-Encoding</p>

        <p class="nf-terminal__blank" aria-hidden="true">&nbsp;</p>

        <p class="nf-terminal__line">Unknown.</p>

        <p class="nf-terminal__blank" aria-hidden="true">&nbsp;</p>

        <p class="nf-terminal__line" aria-hidden="true">
          <span class="nf-terminal__prompt">$ </span>
          <span class="nf-terminal__cursor">█</span>
        </p>
      </div>
    </div>

    <!-- Actions -->
    <nav class="nf-actions" aria-label="404 page navigation">
      <a href="https://news.ycombinator.com/" class="nf-actions__link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>
        Front page
      </a>
      <SearchTrigger variant="quiet" />
    </nav>
  </div>
</template>

<style scoped lang="scss">
.nf-page {
  --nf-max-width: 52rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem 1rem 4rem;
}

.nf-heading,
.nf-terminal,
.nf-actions {
  width: min(var(--nf-max-width), 100%);
}

.nf-heading {
  display: flex;
  align-items: center;
  gap: 1.25rem;

  &__code {
    flex-shrink: 0;
    padding-right: 1.25rem;
    border-right: 2px solid var(--color-border);
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: clamp(3rem, 7vw, 4.5rem);
    font-weight: 700;
    line-height: 1;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-title);
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    font-weight: 800;
    line-height: 1.1;
  }

  &__sub {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    line-height: 1.5;

    code {
      padding: 0.1em 0.35em;
      border-radius: 3px;
      background: var(--color-code-bg);
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: 0.85em;
    }
  }
}

.nf-terminal {
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.65;

  &__bar {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid #2a2a2a;
    background: #1e1e1e;
    user-select: none;
  }

  &__dot {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    border-radius: 50%;

    &--red {
      background: #ff5f57;
    }

    &--yellow {
      background: #ffbd2e;
    }

    &--green {
      background: #27c93f;
    }
  }

  &__bar-title {
    flex: 1;
    color: #555555;
    font-size: 0.72rem;
    letter-spacing: 0.03em;
    text-align: center;
  }

  &__body {
    padding: 1.1rem 1.35rem 1.5rem;
  }

  &__line {
    margin: 0;
    color: #c8c8c8;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__blank {
    line-height: 0.4;
  }

  &__prompt {
    color: #27c93f;
    user-select: none;
  }

  &__cmd {
    color: #dddddd;
  }

  &__hkey {
    color: #88c0d0;
    font-weight: 600;
  }

  &__cursor {
    display: inline-block;
    width: 0.55em;
    background: #c8c8c8;
    color: transparent;
    animation: nf-blink 1.1s step-end infinite;
  }
}

@keyframes nf-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.nf-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.9rem;

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: none;
    }

    &:focus-visible {
      outline: 2px solid var(--color-focus-ring-strong);
      outline-offset: 2px;
    }

    svg {
      flex-shrink: 0;
    }
  }
}

@media (max-width: 640px) {
  .nf-page {
    padding: 1.5rem 0 2.5rem;
    gap: 1.25rem;
  }

  .nf-heading {
    padding: 0 1rem;
  }

  .nf-heading__code {
    font-size: 2.5rem;
    padding-right: 1rem;
  }

  .nf-terminal__body {
    padding: 0.9rem 1rem 1.25rem;
    font-size: 0.78rem;
  }

  .nf-terminal {
    border-left: none;
    border-right: none;
    border-radius: 0;
    box-shadow: none;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }

  .nf-actions {
    padding: 0 1rem;
    flex-direction: column;
    align-items: stretch;
  }

  .nf-actions__link {
    justify-content: center;
  }
}
</style>

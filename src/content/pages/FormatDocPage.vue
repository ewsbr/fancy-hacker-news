<script setup lang="ts">
import { computed, inject } from 'vue';
import type { ParsedStaticPage } from '@/parsers/static';

const page = inject<ParsedStaticPage>('pageData')!;

const contentHtml = computed(() =>
  (page.contentHtml ?? '')
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
);

interface FormatExample {
  title: string;
  description: string;
  input: string;
  renderedHtml: string;
}

const examples: FormatExample[] = [
  {
    title: 'Paragraphs',
    description: 'A blank line between text blocks creates a new paragraph.',
    input: 'First paragraph.\n\nSecond paragraph.',
    renderedHtml: '<p>First paragraph.</p><p>Second paragraph.</p>',
  },
  {
    title: 'Italic text',
    description: 'Surround a word or phrase with asterisks. Use \\* or ** for a literal asterisk.',
    input: 'Something *really* important.',
    renderedHtml: 'Something <i>really</i> important.',
  },
  {
    title: 'Code blocks',
    description: 'Indent by two or more spaces after a blank line.',
    input: 'Here is some code:\n\n  function greet(name) {\n    return "Hello, " + name;\n  }',
    renderedHtml: '<p>Here is some code:</p><pre><code>function greet(name) {\n  return "Hello, " + name;\n}</code></pre>',
  },
  {
    title: 'URL links',
    description: 'Bare URLs are automatically linked.',
    input: 'Read more at https://news.ycombinator.com.',
    renderedHtml: 'Read more at <a href="https://news.ycombinator.com">https://news.ycombinator.com</a>.',
  },
  {
    title: 'Angle bracket URLs',
    description: 'Wrap a URL in angle brackets if it isn\'t linking correctly.',
    input: 'See <https://example.com/path?a=1&b=2>',
    renderedHtml: 'See <a href="https://example.com/path?a=1&amp;b=2">https://example.com/path?a=1&amp;b=2</a>',
  },
];
</script>

<template>
  <div class="formatdoc-page">
    <div class="formatdoc-page__card hn-content-card">
      <section class="formatdoc-page__rules">
        <h1 class="formatdoc-page__title">Formatting Options</h1>
        <div
          v-if="page.contentHtml"
          class="formatdoc-page__prose"
          v-html="contentHtml"
        />
      </section>

      <section class="formatdoc-page__examples">
        <h2 class="formatdoc-page__section-title">Examples</h2>

        <div
          v-for="ex in examples"
          :key="ex.title"
          class="format-example"
        >
          <div class="format-example__header">
            <span class="format-example__title">{{ ex.title }}</span>
            <span class="format-example__desc">{{ ex.description }}</span>
          </div>
          <div class="format-example__grid">
            <div class="format-example__pane">
              <div class="format-example__label">You type</div>
              <pre class="format-example__source">{{ ex.input }}</pre>
            </div>
            <div class="format-example__pane">
              <div class="format-example__label">Looks like</div>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="format-example__preview" v-html="ex.renderedHtml" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.formatdoc-page {
  padding: 16px 0 32px;
  max-width: 768px;
  margin: 0 auto;

  &__card {
    padding: 24px 28px;

    @media (max-width: 640px) {
      padding: 16px 14px;
    }
  }

  &__title {
    margin-bottom: 24px;
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  &__prose {
    margin-bottom: 40px;
    color: var(--color-text);

    :deep(p) {
      margin-bottom: 12px;
      line-height: 1.625;
    }

    :deep(a) {
      color: var(--color-accent);

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__section-title {
    margin-bottom: 16px;
    font-family: var(--font-title);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  &__examples {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.format-example {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    padding: 8px 16px;
    background: var(--color-row-alt);
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  &__desc {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__pane {
    padding: 12px 16px;

    &:first-child {
      border-right: 1px solid var(--color-border);

      @media (max-width: 640px) {
        border-right: none;
        border-bottom: 1px solid var(--color-border);
      }
    }
  }

  &__label {
    margin-bottom: 6px;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  &__source {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__preview {
    font-size: 0.875rem;
    line-height: 1.625;
    color: var(--color-text);

    :deep(p) {
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(i) {
      font-style: italic;
    }

    :deep(pre) {
      margin-top: 4px;
      padding: 8px 12px;
      background: var(--color-code-bg);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      border-radius: 4px;
      white-space: pre;
      overflow-x: auto;
    }

    :deep(code) {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
    }

    :deep(a) {
      color: var(--color-accent);
      word-break: break-all;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ParsedSubmitPage } from '@/parsers/submit';
import SubmitForm from '@/content/forms/SubmitForm.vue';
import StoryRow from '@/content/stories/StoryRow.vue';
import type { Story } from '@/parsers/storyList';

const SUBMIT_PLACEHOLDERS = [
  {
    author: 'zerochurn',
    score: 182,
    title: 'YC founders pivot after learning users prefer products that work',
    text: null,
    url: 'https://medium.com/@reliablemoat/users-prefer-products-that-work-9f41c5e2b7da',
  },
  {
    author: 'either_or',
    score: 41,
    title: 'Ask HN: At what ARR can I replace my homepage with a manifesto?',
    text: 'We have strong opinions, no onboarding, and a landing page that now quotes Kierkegaard. Wondering whether that is pre-PMF or post-design.',
    url: '',
  },
  {
    author: 'warmstandby',
    score: 389,
    title: 'Agent startup adds human fallback, accidentally ships customer support team',
    text: 'The architecture diagram still shows seven autonomous reasoning layers, but most incidents now appear to be resolved by someone named Priya with a keyboard.',
    url: 'https://techcrunch.com/2026/03/11/agent-startup-human-fallback-customer-support-team/',
  },
  {
    author: 'persistent_volume',
    score: 127,
    title: 'Show HN: A static markdown blog powered by an 8-node Kubernetes cluster',
    text: null,
    url: 'https://github.com/ops-heavy/clusterpress',
  },
  {
    author: 'dunned',
    score: -6,
    title: 'The mathematical inefficiency of the space bar',
    text: null,
    url: 'https://blog.hendricks.dev/posts/the-mathematical-inefficiency-of-the-space-bar/',
  },
  {
    author: 'barksdale',
    score: 244,
    title: 'Stringer Bell was running a more disciplined OKR system than your company',
    text: null,
    url: 'https://www.wired.com/story/stringer-bell-okr-discipline/',
  },
  {
    author: 'coldharbor',
    score: 301,
    title: 'The Severance MDR Floor is the only agile team that actually ships',
    text: null,
    url: 'https://www.vulture.com/article/severance-mdr-floor-agile-team.html',
  },
  {
    author: 'fiveasterisks',
    score: 58,
    title: 'Ask HN: Is there a polite way to say "your startup could be a cron job"?',
    text: 'A founder friend keeps describing an AI-native orchestration layer that sounds increasingly like one scheduled task and a Stripe webhook. Looking for phrasing that preserves the friendship.',
    url: '',
  },
  {
    author: 'wal',
    score: -14,
    title: 'Show HN: An app that blocks Slack until you finish the document you said you wrote',
    text: null,
    url: 'https://github.com/draftfirst/slacklock',
  },
] as const;

const pageData = inject<ParsedSubmitPage>('pageData')!;
const placeholderSet = SUBMIT_PLACEHOLDERS[Math.floor(Math.random() * SUBMIT_PLACEHOLDERS.length)];
const formPlaceholders = {
  title: placeholderSet.title,
  text: placeholderSet.text ?? '',
  url: placeholderSet.url,
};

const draft = ref<Record<string, string>>(
  Object.fromEntries((pageData.form?.fields ?? []).map(field => [field.name, field.value])),
);
const hasDraftInput = computed(() => Object.values(draft.value).some(value => value.trim().length > 0));

function toSite(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  try {
    const hostname = new URL(value).hostname.replace(/^www\./, '');
    return hostname || null;
  } catch {
    return null;
  }
}

const previewStory = computed<Story>(() => ({
  id: 'submit-preview',
  rank: 1,
  title: draft.value.title?.trim() || placeholderSet.title,
  url: draft.value.url?.trim() || placeholderSet.url,
  site: toSite(draft.value.url?.trim() || placeholderSet.url),
  score: hasDraftInput.value ? null : placeholderSet.score,
  author: hasDraftInput.value ? 'you' : placeholderSet.author,
  authorIsNew: false,
  age: 'just now',
  ageTimestamp: '',
  ageLink: '#',
  commentCount: 0,
  commentLink: '#',
  isJob: false,
  hideUrl: null,
  voteUp: null,
  voteUn: null,
  isDead: false,
  isFlagged: false,
  isDeleted: false,
}));
</script>

<template>
  <div class="submit-page">
    <template v-if="pageData.form">
      <header class="submit-page__header">
        <div class="submit-page__identity">
          <p class="submit-page__eyebrow">submit</p>
          <h1 class="submit-page__title">Submit a link or start a discussion</h1>
          <p class="submit-page__lede">
            Use the URL field for link posts. Leave it blank for discussion posts. Add text for context.
          </p>

          <div class="submit-page__utility-links">
            <a
              v-if="pageData.form.bookmarkletHref"
              :href="pageData.form.bookmarkletHref"
              class="submit-page__utility-link"
              rel="nofollow"
            >
              bookmarklet
            </a>
            <span v-if="pageData.form.bookmarkletHref" class="submit-page__utility-sep">/</span>
            <a href="newsguidelines.html" class="submit-page__utility-link">guidelines</a>
          </div>
        </div>
      </header>

      <section class="submit-page__panel submit-page__panel--form hn-content-card">
        <div class="submit-page__preview" aria-label="front page preview">
          <StoryRow :story="previewStory" />
        </div>

        <div class="submit-page__panel-body">
          <SubmitForm v-model="draft" :form="pageData.form" :placeholders="formPlaceholders" />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.submit-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 1.5rem 0 3rem;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__eyebrow {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-accent);
  }

  &__title {
    font-family: var(--font-title);
    font-size: clamp(1.7rem, 3vw, 2.35rem);
    line-height: 1.05;
    color: var(--color-text);
  }

  &__lede {
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-text-muted);
  }

  &__utility-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
    color: var(--color-text-muted);
    font-family: var(--font-title);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  &__utility-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__utility-sep {
    opacity: 0.5;
  }

  &__panel {
    overflow: hidden;
  }

  &__panel--form {
    border-radius: 4px;
  }

  &__preview {
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface) 97%, var(--color-accent) 3%);

    :deep(.story-row) {
      border-bottom: 0;
      padding-right: 0.6rem;

      &:hover {
        background: transparent;
      }
    }
  }

  &__panel-body {
    padding: 1rem 1.1rem 1.1rem;
  }

  @media (max-width: 640px) {
    padding-top: 1rem;

    &__panel--form,
    &__panel {
      border-radius: 0;
    }

    &__panel-body {
      padding-left: 0.95rem;
      padding-right: 0.95rem;
    }
  }
}
</style>

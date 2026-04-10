<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ParsedSubmitPage } from '@/parsers/submit';
import SubmitForm from '@/content/components/forms/SubmitForm.vue';
import StoryRow from '@/content/components/stories/StoryRow.vue';
import NoticeBanner from '@/content/components/ui/NoticeBanner.vue';
import type { Story } from '@/parsers/story-list';

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
    text: 'Seems like a pattern worth naming: "human fallback" as an architectural term implies the human handles edge cases. But once you\'re routing >40% of tickets there, you\'ve just built a support team with extra steps. Curious if anyone has deployed something similar and where you actually drew that line.',
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
      <section class="submit-page__stack">
        <p class="submit-page__section-label">Submit</p>

        <header class="submit-page__header">
          <h1 class="submit-page__title">Submit a link or start a discussion</h1>
          <p class="submit-page__lede">
            Keep the form compact and let the content do the work. Use the URL field for link posts,
            leave it blank for discussion posts, and add text only when context helps the thread.
          </p>

          <div class="submit-page__utility-links">
            <a href="newsguidelines.html" class="submit-page__utility-link">guidelines</a>
            <template v-if="pageData.form.bookmarkletHref">
              <span class="submit-page__utility-sep">/</span>
              <a
                :href="pageData.form.bookmarkletHref"
                class="submit-page__utility-link"
                rel="nofollow"
              >
                bookmarklet
              </a>
            </template>
          </div>
        </header>

        <NoticeBanner
          v-if="pageData.warningMessage"
          :message="pageData.warningMessage"
          role="alert"
          class="submit-page__notice"
        />

        <section class="submit-page__preview" aria-label="front page preview">
          <div class="submit-page__preview-head">
            <span class="submit-page__preview-label">Preview</span>
          </div>
          <div class="submit-page__preview-card">
            <StoryRow :story="previewStory" />
          </div>
        </section>

        <section class="submit-page__form-shell">
          <SubmitForm
            v-model="draft"
            :form="pageData.form"
            :placeholders="formPlaceholders"
            variant="utility"
          />
        </section>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.submit-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.35rem 0 3rem;

  &__stack {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  &__section-label {
    display: inline-flex;
    width: fit-content;
    padding-bottom: 0.2rem;
    border-bottom: 1px solid var(--color-accent);
    color: var(--color-accent);
    font-family: var(--font-title);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  &__utility-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-text);
    font-family: var(--font-title);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  &__utility-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__utility-sep {
    opacity: 0.5;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__title {
    font-family: var(--font-title);
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    line-height: 1.15;
    color: var(--color-text);
  }

  &__lede {
    font-size: 0.84rem;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  &__notice {
    :deep(.notice-banner) {
      padding: 0.8rem 0;
      border: 0;
      border-top: 1px solid var(--color-divider);
      border-bottom: 1px solid var(--color-divider);
      border-radius: 0;
      background: transparent;
      text-align: left;
    }
  }

  &__preview {
    padding: 0.15rem 0 0.1rem;
  }

  &__preview-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem 0.8rem;
    padding: 0.45rem 0 0.45rem;
    margin-bottom: 0.1rem;
    border-bottom: 1px solid var(--color-divider);
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__preview-label {
    color: var(--color-text);
    font-family: var(--font-title);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__preview :deep(.story-row) {
    padding: 0.4rem 0 0.45rem;
    border-bottom: 0;

    &:hover {
      background: transparent;
    }
  }

  &__preview-card {
    overflow: hidden;
    border-bottom: 1px solid var(--color-divider);
  }

  &__preview :deep(.story-row__title) {
    font-size: 0.98rem;
  }

  &__preview :deep(.story-meta) {
    font-size: 0.78rem;
  }

  &__form-shell {
    padding-top: 0.1rem;
  }

  @media (max-width: 640px) {
    max-width: none;
    padding-top: 1rem;

    &__stack {
      gap: 0.8rem;
    }

    &__preview :deep(.story-row) {
      padding-right: 0.2rem;
    }

    &__preview-card :deep(.story-row) {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    &__notice {
      :deep(.notice-banner) {
        padding-top: 0.7rem;
        padding-bottom: 0.7rem;
      }
    }
  }
}
</style>

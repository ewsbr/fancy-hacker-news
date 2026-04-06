<script setup lang="ts">
import { inject } from 'vue';
import { FileText, MessageSquare, HelpCircle, ArrowRight } from 'lucide-vue-next';
import Tooltip from '@/content/shared/Tooltip.vue';
import type { ParsedSubmitPage } from '@/parsers/submit';
import SubmitForm from '@/content/forms/SubmitForm.vue';

const pageData = inject<ParsedSubmitPage>('pageData')!;
</script>

<template>
  <div class="submit-page">
    <template v-if="pageData.form">
      <header class="submit-page__header">
        <div class="submit-page__identity">
          <p class="submit-page__eyebrow">submit</p>
          <h1 class="submit-page__title">Start a new thread worth opening</h1>
          <p class="submit-page__lede">
            Share a link, ask a focused question, or add the context a thread needs before the comments take over.
          </p>
        </div>

        <div class="submit-page__mode-strip" aria-label="submission modes">
          <div class="submit-page__mode-pill">
            <FileText :size="14" />
            Link post
          </div>
          <div class="submit-page__mode-pill">
            <MessageSquare :size="14" />
            Discussion post
          </div>
          <div class="submit-page__mode-pill">
            <HelpCircle :size="14" />
            Context note
          </div>
        </div>
      </header>

      <div class="submit-page__columns">
        <section class="submit-page__panel submit-page__panel--form hn-content-card">
          <div class="submit-page__panel-head">
            <h2 class="submit-page__panel-title"><span>submission</span></h2>
            <p class="submit-page__panel-copy">The best threads are clear at the top and lightweight to scan once they hit the front page.</p>
          </div>

          <div class="submit-page__panel-body">
            <SubmitForm :form="pageData.form" />
          </div>
        </section>

        <aside class="submit-page__sidebar">
          <section class="submit-page__panel hn-content-card">
            <div class="submit-page__panel-head submit-page__panel-head--compact">
              <h2 class="submit-page__panel-title"><span>guidelines</span></h2>
            </div>

            <div class="submit-page__sidebar-body">
              <ul class="submit-page__guideline-list">
                <li>Leave the URL blank to submit a question for discussion.</li>
                <li>If there is no URL, your text appears at the top of the thread.</li>
                <li>If there is a URL, text is optional and should add useful context rather than repeat the link.</li>
              </ul>

              <a
                v-if="pageData.form.bookmarkletHref"
                :href="pageData.form.bookmarkletHref"
                class="submit-page__bookmarklet"
                rel="nofollow"
              >
                submit via bookmarklet
                <ArrowRight :size="14" />
              </a>
            </div>
          </section>

          <section class="submit-page__panel hn-content-card">
            <div class="submit-page__panel-head submit-page__panel-head--compact">
              <h2 class="submit-page__panel-title"><span>before posting</span></h2>
            </div>

            <div class="submit-page__checklist">
              <div class="submit-page__check">
                <span class="submit-page__check-title">Title first</span>
                <p class="submit-page__check-copy">Make the title stand on its own. People should know what they are opening before they click.</p>
              </div>
              <div class="submit-page__check">
                <span class="submit-page__check-title">Text earns its space</span>
                <p class="submit-page__check-copy">Use the text box for framing, caveats, or the question you want answered.</p>
              </div>
              <div class="submit-page__check">
                <span class="submit-page__check-title">Canonical link</span>
                <p class="submit-page__check-copy">Prefer the original source over mirrors, trackers, or reposts when you have the choice.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
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
    max-width: 42rem;
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

  &__mode-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  &__mode-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-accent) 18%, var(--color-border));
    background: color-mix(in srgb, var(--color-surface) 92%, var(--color-accent) 8%);
    color: var(--color-text);
    font-size: 0.82rem;
    font-weight: 700;
  }

  &__columns {
    display: grid;
    gap: 1rem;

    @media (min-width: 768px) {
      grid-template-columns: minmax(0, 1.45fr) minmax(17rem, 0.9fr);
      align-items: start;
    }
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__panel {
    overflow: hidden;
  }

  &__panel--form {
    border-radius: 4px;
  }

  &__panel-head {
    padding: 1rem 1.1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;

    &--compact {
      padding-bottom: 0.2rem;
    }
  }

  &__panel-body,
  &__sidebar-body,
  &__checklist {
    padding: 1rem 1.1rem 1.1rem;
  }

  &__panel-title {
    font-family: var(--font-title);
    font-size: 0.95rem;
    font-weight: 800;
    text-transform: lowercase;
    color: var(--color-text-muted);

    span {
      color: var(--color-text);
    }

    &::before {
      content: '[ ';
      opacity: 0.3;
    }

    &::after {
      content: ' ]';
      opacity: 0.3;
    }
  }

  &__panel-copy {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.55;
  }

  &__guideline-list {
    padding-left: 1rem;
    display: grid;
    gap: 0.65rem;
    color: var(--color-text-muted);
    font-size: 0.87rem;
    line-height: 1.55;
  }

  &__bookmarklet {
    margin-top: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.84rem;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__checklist {
    display: grid;
    gap: 0.9rem;
  }

  &__check {
    padding-top: 0.9rem;
    border-top: 1px solid color-mix(in srgb, var(--color-border) 88%, transparent);

    &:first-child {
      padding-top: 0;
      border-top: 0;
    }
  }

  &__check-title {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 700;
    color: var(--color-text);
    font-size: 0.88rem;
  }

  &__check-copy {
    color: var(--color-text-muted);
    font-size: 0.84rem;
    line-height: 1.55;
  }

  @media (max-width: 640px) {
    padding-top: 1rem;

    &__panel--form,
    &__panel {
      border-radius: 0;
    }

    &__panel-head,
    &__panel-body,
    &__sidebar-body,
    &__checklist {
      padding-left: 0.95rem;
      padding-right: 0.95rem;
    }
  }
}
</style>

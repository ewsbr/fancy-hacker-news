<script setup lang="ts">
import { inject } from 'vue';
import { ArrowLeft, MessageSquare } from 'lucide-vue-next';
import type { ParsedReplyPage } from '@/parsers/reply';
import CommentBody from '@/content/comments/CommentBody.vue';
import OnStoryHeader from '@/content/comments/OnStoryHeader.vue';
import CommentForm from '@/content/forms/CommentForm.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

const pageData = inject<ParsedReplyPage>('pageData')!;
</script>

<template>
  <div class="reply-page">
    <template v-if="pageData.isLoggedOut">
      <div class="reply-page__message hn-content-card hn-empty-state">
         You have to <a href="login?goto=reply">log in</a> to reply.
      </div>
    </template>
    <template v-else-if="pageData.parent && pageData.replyForm">
      <header class="reply-page__header">
        <p class="reply-page__eyebrow">reply</p>
        <h1 class="reply-page__title">Join the thread without losing the thread</h1>
        <p class="reply-page__lede">You are responding to a specific comment, so the more precise and self-contained your reply is, the better it will age in context.</p>
      </header>

      <section class="reply-page__context hn-content-card">
        <OnStoryHeader
          v-if="pageData.parent.onStory"
          label="replying in"
          :href="pageData.parent.onStory.link"
          :title="pageData.parent.onStory.title"
          block
        />

        <div class="reply-page__context-body">
          <div class="reply-page__section-head">
            <h2 class="reply-page__section-title"><span>original comment</span></h2>
            <a
              v-if="pageData.parent.contextLink"
              :href="pageData.parent.contextLink"
              class="reply-page__back-link"
            >
              <ArrowLeft :size="14" />
              back to context
            </a>
          </div>

          <div class="reply-page__parent-meta">
            <a :href="`user?id=${pageData.parent.author}`" class="reply-page__parent-author">{{ pageData.parent.author }}</a>
            <MetaSep />
            <a :href="pageData.parent.ageLink" class="reply-page__parent-age">{{ pageData.parent.age }}</a>
            <template v-if="pageData.parent.parentLink">
              <MetaSep />
              <a :href="pageData.parent.parentLink" class="reply-page__parent-nav">parent</a>
            </template>
            <template v-if="pageData.parent.contextLink">
              <MetaSep />
              <a :href="pageData.parent.contextLink" class="reply-page__parent-nav">context</a>
            </template>
          </div>

          <div class="reply-page__parent-body">
            <CommentBody :html="pageData.parent.bodyHtml" :gray-level="null" />
          </div>
        </div>
      </section>

      <section class="reply-page__composer hn-content-card">
        <div class="reply-page__composer-head">
          <div>
            <h2 class="reply-page__section-title"><span>your reply</span></h2>
            <p class="reply-page__composer-copy">Answer the comment directly, and use the text box for the part you want quoted by future readers.</p>
          </div>
          <div class="reply-page__composer-badge">
            <MessageSquare :size="14" />
            in-thread
          </div>
        </div>

        <div class="reply-page__composer-body">
          <CommentForm
            :form="{ ...pageData.replyForm, submitLabel: 'reply' }"
            :autofocus="true"
            placeholder="Write your reply..."
            :rows="8"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.reply-page {
  padding: 1.25rem 0 3rem;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
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
    font-size: clamp(1.55rem, 2.7vw, 2rem);
    line-height: 1.08;
    color: var(--color-text);
  }

  &__lede {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 42rem;
  }
  
  &__message {
    padding: 1rem 1.1rem;
    
    a {
      color: var(--color-text);
      text-decoration: underline;
      &:hover { color: var(--color-accent); }
    }
  }

  &__context,
  &__composer {
    overflow: hidden;
  }

  &__context-body,
  &__composer-body {
    padding: 1rem 1.1rem 1.1rem;
  }

  &__section-head,
  &__composer-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem 0;

    @media (max-width: 640px) {
      flex-direction: column;
    }
  }

  &__section-title {
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

  &__back-link,
  &__parent-nav,
  &__parent-age {
    color: var(--color-text-muted);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
  }
  
  &__parent-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.85rem;
    margin-bottom: 0.9rem;
  }
  
  &__parent-author {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 700;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &__parent-body {
    border-top: 1px solid color-mix(in srgb, var(--color-border) 88%, transparent);
    padding-top: 0.9rem;
  }

  &__composer-copy {
    margin-top: 0.45rem;
    color: var(--color-text-muted);
    font-size: 0.84rem;
    line-height: 1.55;
  }

  &__composer-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.65rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-surface) 92%, var(--color-accent) 8%);
    border: 1px solid color-mix(in srgb, var(--color-accent) 16%, var(--color-border));
    color: var(--color-text);
    font-size: 0.78rem;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    padding-top: 1rem;
  }
}
</style>

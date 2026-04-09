<script setup lang="ts">
import { inject } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import type { ParsedReplyPage } from '@/parsers/reply';
import CommentBody from '@/content/comments/CommentBody.vue';
import OnStoryHeader from '@/content/comments/OnStoryHeader.vue';
import CommentForm from '@/content/forms/CommentForm.vue';
import MetaSep from '@/content/ui/primitives/MetaSep.vue';

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
      <section class="reply-page__card hn-content-card">
        <OnStoryHeader
          v-if="pageData.parent.onStory"
          label="replying in"
          :href="pageData.parent.onStory.link"
          :title="pageData.parent.onStory.title"
          block
        />

        <div class="reply-page__section reply-page__section--parent">
          <a
            v-if="pageData.parent.contextLink"
            :href="pageData.parent.contextLink"
            class="reply-page__back-link"
          >
            <ArrowLeft :size="14" class="reply-page__back-icon" />
            back to context
          </a>

          <div class="reply-page__parent-meta">
            <a :href="`user?id=${pageData.parent.author}`" class="reply-page__parent-author">{{ pageData.parent.author }}</a>
            <MetaSep />
            <a :href="pageData.parent.ageLink" class="reply-page__parent-age">{{ pageData.parent.age }}</a>
          </div>

          <div class="reply-page__parent-body">
            <CommentBody :html="pageData.parent.bodyHtml" :gray-level="null" />
          </div>
        </div>

        <div class="reply-page__section reply-page__section--composer">
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
  
  &__message {
    padding: 1rem 1.1rem;
    
    a {
      color: var(--color-text);
      text-decoration: underline;
      &:hover { color: var(--color-accent); }
    }
  }

  &__card {
    overflow: hidden;
  }

  &__section {
    padding: 1rem 1.1rem 1.1rem;

    &--composer {
      border-top: 1px solid var(--color-divider);
    }
  }

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
    gap: 0.45rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__back-icon {
    color: var(--color-accent);
    flex-shrink: 0;
  }
  
  &__parent-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.85rem;
    margin-bottom: 0.9rem;
    margin-top: 0.4rem;
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
    border-top: 1px solid var(--color-divider);
    padding-top: 0.9rem;
  }

  @media (max-width: 640px) {
    padding-top: 1rem;
  }
}
</style>

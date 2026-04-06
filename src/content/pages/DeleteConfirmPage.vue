<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedDeleteConfirmPage } from '@/parsers/deleteConfirm';
import CommentUserMeta from '@/content/shared/CommentUserMeta.vue';
import MetaSep from '@/content/shared/MetaSep.vue';
import OnStoryHeader from '@/content/comments/OnStoryHeader.vue';
import CommentBody from '@/content/comments/CommentBody.vue';

const pageData = inject<ParsedDeleteConfirmPage>('pageData')!;
</script>

<template>
  <div class="delete-confirm-page">
    <h1 class="delete-confirm-page__title">Confirm deletion</h1>

    <div v-if="pageData.errorMessage" class="delete-confirm-page__error hn-content-card">
      <p class="delete-confirm-page__error-text">{{ pageData.errorMessage }}</p>
    </div>

    <div v-if="pageData.item" class="delete-confirm-page__card hn-content-card">
      <div class="delete-confirm-page__comment">
        <div class="delete-confirm-page__meta">
          <CommentUserMeta
            :author="pageData.item.author"
            :author-is-new="pageData.item.isNewUser"
            :age-link="pageData.item.ageLink"
            :age="pageData.item.age"
          />
          <template v-if="pageData.item.parentLink">
            <MetaSep />
            <a :href="pageData.item.parentLink" class="delete-confirm-page__nav-link">parent</a>
          </template>
          <template v-if="pageData.item.contextLink">
            <MetaSep />
            <a :href="pageData.item.contextLink" class="delete-confirm-page__nav-link">context</a>
          </template>
          <template v-if="pageData.item.storyLink && pageData.item.storyTitle">
            <MetaSep />
            <OnStoryHeader label="on" :href="pageData.item.storyLink" :title="pageData.item.storyTitle" />
          </template>
        </div>

        <div class="delete-confirm-page__body">
          <CommentBody :html="pageData.item.bodyHtml" :gray-level="null" />
        </div>
      </div>
    </div>

    <div v-if="pageData.deleteForm" class="delete-confirm-page__confirm">
      <p class="delete-confirm-page__prompt">Do you want this to be deleted?</p>
      <form :action="pageData.deleteForm.action" method="post" class="delete-confirm-page__form">
        <input type="hidden" name="id" :value="pageData.deleteForm.id" />
        <input type="hidden" name="goto" :value="pageData.deleteForm.gotoUrl" />
        <input type="hidden" name="hmac" :value="pageData.deleteForm.hmac" />
        <button type="submit" name="d" value="Yes" class="delete-confirm-page__btn delete-confirm-page__btn--yes">Yes, delete</button>
        <button type="submit" name="d" value="No" class="delete-confirm-page__btn delete-confirm-page__btn--no">No, cancel</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.delete-confirm-page {
  padding: 1.5rem 0 2rem;

  &__title {
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 1.25rem;
  }

  &__card {
    margin-bottom: 1.5rem;
  }

  &__error {
    margin-bottom: 1.5rem;
    padding: 1rem 0.9rem;
  }

  &__error-text {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-text);
  }

  &__comment {
    padding: 0.85rem 0.9rem;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 0.4rem;
    row-gap: 0.2rem;
    font-size: 0.83rem;
    color: var(--color-text-muted);
    margin-bottom: 0.6rem;
  }

  &__nav-link {
    color: var(--color-text-muted);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__confirm {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  &__prompt {
    font-size: 0.95rem;
    color: var(--color-text);
    margin: 0;
    font-weight: 500;
  }

  &__form {
    display: flex;
    gap: 0.6rem;
  }

  &__btn {
    padding: 0.4rem 1.1rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--color-border);
    transition: opacity 0.12s, background-color 0.12s;

    &--yes {
      background: var(--color-accent);
      color: #fff;
      border-color: var(--color-accent);

      &:hover {
        opacity: 0.82;
      }
    }

    &--no {
      background: var(--color-surface);
      color: var(--color-text);

      &:hover {
        background: color-mix(in srgb, var(--color-surface) 70%, var(--color-border) 30%);
      }
    }
  }
}
</style>

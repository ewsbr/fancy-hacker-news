<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedDeleteConfirmPage } from '@/parsers/delete-confirm';
import CommentUserMeta from '@/content/components/comments/CommentUserMeta.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import OnStoryHeader from '@/content/components/comments/OnStoryHeader.vue';
import CommentBody from '@/content/components/comments/CommentBody.vue';

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
  padding: 24px 0 32px;

  &__title {
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 20px;
  }

  &__card {
    margin-bottom: 24px;
  }

  &__error {
    margin-bottom: 24px;
    padding: 16px 14px;
  }

  &__error-text {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text);
  }

  &__comment {
    padding: 14px;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 6px;
    row-gap: 3px;
    font-size: 0.83rem;
    color: var(--color-text-muted);
    margin-bottom: 10px;
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
    gap: 14px;
  }

  &__prompt {
    font-size: 1rem;
    color: var(--color-text);
    margin: 0;
    font-weight: 500;
  }

  &__form {
    display: flex;
    gap: 10px;
  }

  &__btn {
    padding: 6px 18px;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--color-border);
    transition: opacity 0.12s, background-color 0.12s;

    &--yes {
      background: var(--color-accent);
      color: #ffffff;
      border-color: var(--color-accent);

      &:hover {
        opacity: 0.82;
      }
    }

    &--no {
      background: var(--color-surface);
      color: var(--color-text);

      &:hover {
        background: var(--color-row-hover);
      }
    }
  }
}
</style>

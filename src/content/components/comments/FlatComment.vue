<script setup lang="ts">
import type { FlatComment as FlatCommentType } from '@/parsers/new-comments';
import CommentActions from '@/content/components/comments/CommentActions.vue';
import CommentUserMeta from '@/content/components/comments/CommentUserMeta.vue';
import FragmentLinkButton from '@/content/components/shared/FragmentLinkButton.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import CommentBody from './CommentBody.vue';
import OnStoryHeader from './OnStoryHeader.vue';

defineProps<{
  comment: FlatCommentType;
}>();
</script>

<template>
  <div :id="comment.id" class="flat-comment">
    <div class="flat-comment__header">
      <div class="flat-comment__meta">
        <CommentUserMeta
          :author="comment.author"
          :author-is-new="comment.authorIsNew"
          :score="comment.score"
          :age-link="comment.ageLink"
          :age="comment.age"
          :is-deleted="comment.isDeleted"
          :is-dead="comment.isDead"
          :is-flagged="comment.isFlagged"
        />
      </div>

      <div class="flat-comment__story">
        <MetaSep class="flat-comment__story-sep" />
        <OnStoryHeader label="on" :href="comment.onStory.link" :title="comment.onStory.title" />
        <MetaSep />
        <FragmentLinkButton :target-id="comment.id" />
      </div>
    </div>

    <div class="flat-comment__body">
      <CommentBody
        :html="comment.bodyHtml"
        :gray-level="comment.grayLevel"
        :placeholder-kind="comment.placeholderKind"
      />
    </div>

    <CommentActions
      :item-id="comment.id"
      :vote-state="comment.voteState"
      :vote-target="comment"
      :flag-target="comment.flagAction.kind === 'available' || comment.flagAction.kind === 'active' ? comment : null"
    />
  </div>
</template>

<style scoped lang="scss">
.flat-comment {
  padding: 0.75rem 0;
  margin: 0 0.75rem;
  border-top: 1px solid var(--color-divider);

  &:first-child {
    border-top: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    row-gap: 0.2rem;
    font-size: 0.88rem;
    margin-bottom: 0.25rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  &__story {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    flex: 1 1 auto;
  }

  &__body {
    margin-left: 0;
  }

  @media (max-width: 640px) {
    margin: 0 0.5rem;
    padding: 0.65rem 0;

    &__header {
      display: grid;
      row-gap: 0.18rem;
      margin-bottom: 0.22rem;
      font-size: 1rem;
    }

    &__meta {
      gap: 0.55rem;
    }

    &__story-sep {
      display: none;
    }

    &__story {
      gap: 0.35rem;
    }
  }
}
</style>

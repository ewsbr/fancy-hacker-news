<script setup lang="ts">
import AuthorByline from '@/content/ui/composites/AuthorByline.vue';
import Badge from '@/content/ui/primitives/Badge.vue';
import MetaSep from '@/content/ui/primitives/MetaSep.vue';

withDefaults(defineProps<{
  author: string;
  authorIsNew?: boolean;
  score?: number | null;
  ageLink: string;
  age: string;
  ageTimestamp?: string | null;
  isDeleted?: boolean;
  isDead?: boolean;
  isFlagged?: boolean;
  downvoteLabel?: string | null;
}>(), {
  authorIsNew: false,
  score: null,
  ageTimestamp: null,
  isDeleted: false,
  isDead: false,
  isFlagged: false,
  downvoteLabel: null,
});
</script>

<template>
  <span class="comment-user-meta">
    <template v-if="isDeleted">
      <span class="comment-user-meta__deleted">[deleted]</span>
      <MetaSep />
      <a :href="ageLink" :title="ageTimestamp ?? undefined" class="comment-user-meta__age">{{ age }}</a>
      <Badge variant="deleted" label="Deleted" />
    </template>

    <template v-else>
      <AuthorByline
        :author="author"
        :author-is-new="authorIsNew"
        :score="score"
        :age-link="ageLink"
        :age="age"
        :age-timestamp="ageTimestamp"
      />

      <div v-if="isDead || isFlagged || downvoteLabel" class="comment-user-meta__badges">
        <Badge v-if="isDead" variant="dead" label="Dead" />
        <Badge v-if="isFlagged" variant="flagged" label="Flagged" />
        <Badge v-if="downvoteLabel" variant="downvoted" :label="downvoteLabel" title="Downvoted level" />
      </div>
    </template>
  </span>
</template>

<style scoped lang="scss">
.comment-user-meta {
  display: contents;

  &__deleted,
  &__age {
    color: var(--color-text-muted);
  }

  &__deleted {
    font-style: italic;
    opacity: 0.6;
  }

  &__age {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__badges {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    align-self: center;
  }
}
</style>

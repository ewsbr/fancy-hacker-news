<script setup lang="ts">
import type { CommentNode } from '@/parsers/item';
import Badge from '@/content/shared/Badge.vue';
import AuthorByline from '@/content/shared/AuthorByline.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

const props = defineProps<{
  node: CommentNode;
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const DOWNVOTE_LABELS: Record<string, string> = {
  c5a: '1/9',
  c73: '2/9',
  c82: '3/9',
  c88: '4/9',
  c9c: '5/9',
  cae: '6/9',
  cbe: '7/9',
  cce: '8/9',
  cdd: '9/9',
};

const downvoteOpacity = props.node.grayLevel ? DOWNVOTE_LABELS[props.node.grayLevel] || null : null;
</script>

<template>
  <div class="comment-header">
    <button 
      @click="emit('toggle')"
      class="comment-header__toggle"
      :class="{ 'comment-header__toggle--collapsed': isCollapsed }"
    >
      {{ isCollapsed ? (node.collapsedCount > 0 ? `[+${node.collapsedCount}]` : '[show]') : '[–]' }}
    </button>

    <div class="comment-header__info">
      <template v-if="node.isDeleted">
        <span class="comment-header__deleted">[deleted]</span>
        <MetaSep />
        <a :href="node.ageLink" :title="node.ageTimestamp" class="comment-header__age">{{ node.age }}</a>
        <Badge variant="deleted" label="Deleted" />
      </template>

      <template v-else>
        <AuthorByline
          :author="node.author"
          :author-is-new="node.authorIsNew"
          :score="node.score"
          :age-link="node.ageLink"
          :age="node.age"
          :age-timestamp="node.ageTimestamp"
        />
        <div class="comment-header__badges" v-if="node.isDead || node.isFlagged || downvoteOpacity">
          <Badge v-if="node.isDead" variant="dead" label="Dead" />
          <Badge v-if="node.isFlagged" variant="flagged" label="Flagged" />
          <Badge v-if="downvoteOpacity" variant="downvoted" :label="downvoteOpacity" title="Downvoted level" />
        </div>
      </template>

      <div v-if="!node.isDeleted && !isCollapsed && (node.navLinks.root || node.navLinks.parent || node.navLinks.next || node.navLinks.prev || node.navLinks.context)" class="comment-header__nav">
      <MetaSep />
        <a v-if="node.navLinks.root" :href="node.navLinks.root" class="comment-header__nav-link" title="Root">root</a>
        <a v-if="node.navLinks.parent" :href="node.navLinks.parent" class="comment-header__nav-link" title="Parent">parent</a>
        <a v-if="node.navLinks.prev" :href="node.navLinks.prev" class="comment-header__nav-link" title="Previous">prev</a>
        <a v-if="node.navLinks.next" :href="node.navLinks.next" class="comment-header__nav-link" title="Next">next</a>
        <a v-if="node.navLinks.context" :href="node.navLinks.context" class="comment-header__nav-link" title="Context">context</a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comment-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.35rem;
  row-gap: 0.2rem;
  font-size: 0.84rem;
  color: var(--color-text-muted);

  &__badges {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    align-self: center;
  }

  &__age {
    text-decoration: none;
    color: inherit;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  &__toggle {
    margin-right: 0.15rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    position: relative;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    transition: color 0.15s ease;

    &::before {
      content: "";
      position: absolute;
      inset: -4px;
    }

    &:hover, &:focus {
      color: var(--color-accent);
      text-decoration: none;
      outline: none;
    }

    &--collapsed {
      color: var(--color-accent);
    }
  }

  &__info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    row-gap: 0.1rem;
    flex: 1;
    min-width: 0;
  }

  &__nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    opacity: 0.5;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }

    @media (max-width: 640px) {
      display: none;
    }
  }

  &__nav-link {
    position: relative;
    color: inherit;
    text-decoration: none;

    &::before {
      content: "";
      position: absolute;
      inset: -5px -4px;
    }

    &:hover {
      color: var(--color-text);
      text-decoration: none;
    }
  }

  &__deleted {
    font-style: italic;
    color: var(--color-text-muted);
    opacity: 0.6;
  }
}
</style>

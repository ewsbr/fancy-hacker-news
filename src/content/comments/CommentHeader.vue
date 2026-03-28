<script setup lang="ts">
import { computed } from 'vue';
import type { CommentNode } from '@/parsers/item';
import Badge from '@/content/shared/Badge.vue';

const props = defineProps<{
  node: CommentNode;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const downvoteOpacity = computed(() => {
  if (!props.node.grayLevel || props.node.grayLevel === 'c00') return null;
  // Map HN classes to 1/9 - 9/9 levels
  const map: Record<string, string> = {
    'c5a': '1/9',
    'c73': '2/9',
    'c82': '3/9',
    'c88': '4/9',
    'c9c': '5/9',
    'cae': '6/9',
    'cbe': '7/9',
    'cce': '8/9',
    'cdd': '9/9',
  };
  return map[props.node.grayLevel.toLowerCase()] || null;
});
</script>

<template>
  <div class="comment-header">
    <button 
      @click="emit('toggle')"
      class="comment-header__toggle"
      :class="{ 'comment-header__toggle--collapsed': node.isCollapsed }"
    >
      {{ node.isCollapsed ? `[+${node.collapsedCount}]` : '[–]' }}
    </button>

    <div class="comment-header__info">
      <a 
        :href="`user?id=${node.author}`" 
        class="comment-header__author"
        :class="{ 'comment-header__author--new': node.authorIsNew }"
      >
        {{ node.author }}
      </a>

      <div class="comment-header__badges" v-if="node.authorIsNew || node.isDead || node.isFlagged || downvoteOpacity">
        <Badge v-if="node.authorIsNew" variant="new" label="New" title="New user" />
        <Badge v-if="node.isDead" variant="dead" label="Dead" />
        <Badge v-if="node.isFlagged" variant="flagged" label="Flagged" />
        <Badge v-if="downvoteOpacity" variant="downvoted" :label="downvoteOpacity" title="Downvoted level" />
      </div>

      <span class="comment-header__divider">•</span>

      <a :href="node.ageLink" :title="node.ageTimestamp" class="comment-header__age">
        {{ node.age }}
      </a>

      <div v-if="!node.isCollapsed && (node.navLinks.root || node.navLinks.parent || node.navLinks.next || node.navLinks.prev || node.navLinks.context)" class="comment-header__nav">
        <span class="comment-header__divider">•</span>
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
  align-items: flex-start;
  padding-top: 0.1rem;
  column-gap: 0.35rem;
  row-gap: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);

  &__author {
    font-weight: 700;
    font-size: 0.825rem;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__badges {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    align-self: center;
  }

  &__divider {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    user-select: none;
    opacity: 0.6;
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
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-border);
    transition: color 0.15s ease;

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
    gap: 0.5rem;
    font-size: 0.7rem;
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
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }
}
</style>

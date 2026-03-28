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
    <a 
      :href="`user?id=${node.author}`" 
      class="comment-header__author"
      :class="{ 'comment-header__author--new': node.authorIsNew }"
    >
      {{ node.author }}
    </a>
    
    <a :href="node.ageLink" :title="node.ageTimestamp" class="comment-header__age">
      {{ node.age }}
    </a>

    <Badge v-if="node.authorIsNew" variant="new" label="New" title="New user" />
    <Badge v-if="node.isDead" variant="dead" label="Dead" />
    <Badge v-if="node.isFlagged" variant="flagged" label="Flagged" />
    <Badge v-if="downvoteOpacity" variant="downvoted" :label="downvoteOpacity" title="Downvoted level" />

    <template v-if="node.isCollapsed">
      <button 
        @click="emit('toggle')"
        class="comment-header__toggle comment-header__toggle--collapsed"
      >
        [{{ node.collapsedCount }} more]
      </button>
    </template>
    <template v-else>
      <button 
        @click="emit('toggle')"
        class="comment-header__toggle comment-header__toggle--expanded"
      >
        [–]
      </button>

      <span v-if="node.navLinks.root || node.navLinks.parent || node.navLinks.next || node.navLinks.prev || node.navLinks.context" class="comment-header__nav">
        |
        <a v-if="node.navLinks.root" :href="node.navLinks.root ?? undefined" class="comment-header__nav-link">root</a>
        <a v-if="node.navLinks.parent" :href="node.navLinks.parent ?? undefined" class="comment-header__nav-link">parent</a>
        <a v-if="node.navLinks.prev" :href="node.navLinks.prev ?? undefined" class="comment-header__nav-link">prev</a>
        <a v-if="node.navLinks.next" :href="node.navLinks.next ?? undefined" class="comment-header__nav-link">next</a>
        <a v-if="node.navLinks.context" :href="node.navLinks.context ?? undefined" class="comment-header__nav-link">context</a>
      </span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.comment-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);

  &__author {
    font-weight: 700;
    font-size: 0.875rem;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__age {
    text-decoration: none;
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }

  &__toggle {
    margin-left: 0.25rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
    font-size: inherit;

    &--collapsed {
      font-weight: 700;
      color: var(--color-accent);
      
      &:hover {
        text-decoration: underline;
      }
    }

    &--expanded {
      font-weight: 700;
      color: var(--color-border);

      &:hover, &:focus {
        color: var(--color-accent);
        text-decoration: underline;
        outline: none;
      }
    }
  }

  &__nav {
    margin-left: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    opacity: 0.7;
    color: inherit;
  }

  &__nav-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

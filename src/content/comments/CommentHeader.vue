<script setup lang="ts">
import CommentUserMeta from '@/content/shared/CommentUserMeta.vue';
import FragmentLinkButton from '@/content/shared/FragmentLinkButton.vue';
import MetaSep from '@/content/shared/MetaSep.vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

type CommentHeaderNode = {
  id: string;
  collapsedCount: number;
  grayLevel?: string | null;
  author: string;
  authorIsNew?: boolean;
  score?: number | null;
  ageLink: string;
  age: string;
  ageTimestamp?: string | null;
  isDeleted?: boolean;
  isDead?: boolean;
  isFlagged?: boolean;
  navLinks: {
    root?: string | null;
    parent?: string | null;
    context?: string | null;
    prev?: string | null;
    next?: string | null;
  };
};

const props = defineProps<{
  node: CommentHeaderNode;
  isCollapsed: boolean;
  latestUrl?: string | null;
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

const downvoteOpacity = props.node.grayLevel ? DOWNVOTE_LABELS[props.node.grayLevel.toLowerCase()] || null : null;
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
      <CommentUserMeta
        :author="node.author"
        :author-is-new="node.authorIsNew"
        :score="node.score"
        :age-link="node.ageLink"
        :age="node.age"
        :age-timestamp="node.ageTimestamp"
        :is-deleted="node.isDeleted"
        :is-dead="node.isDead"
        :is-flagged="node.isFlagged"
        :downvote-label="downvoteOpacity"
      />

      <div v-if="!node.isDeleted && !isCollapsed && (latestUrl || node.navLinks.root || node.navLinks.parent || node.navLinks.context)" class="comment-header__nav">
        <MetaSep />
        <a v-if="latestUrl" :href="latestUrl" class="comment-header__nav-link" title="Latest">latest</a>
        <a v-if="node.navLinks.root" :href="node.navLinks.root" class="comment-header__nav-link" title="Root">root</a>
        <a v-if="node.navLinks.parent" :href="node.navLinks.parent" class="comment-header__nav-link" title="Parent">parent</a>
        <a v-if="node.navLinks.context" :href="node.navLinks.context" class="comment-header__nav-link" title="Context">context</a>
      </div>

      <div class="comment-header__controls">
        <MetaSep class="comment-header__controls-sep" />
        <a
          v-if="!node.isDeleted && !isCollapsed && node.navLinks.prev"
          :href="node.navLinks.prev"
          class="comment-header__icon-link"
          title="Previous comment"
          aria-label="Previous comment"
        >
          <ChevronLeft :size="14" aria-hidden="true" />
        </a>
        <FragmentLinkButton :target-id="node.id" />
        <a
          v-if="!node.isDeleted && !isCollapsed && node.navLinks.next"
          :href="node.navLinks.next"
          class="comment-header__icon-link"
          title="Next comment"
          aria-label="Next comment"
        >
          <ChevronRight :size="14" aria-hidden="true" />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comment-header {
  --comment-meta-font-size: 0.8125rem;
  --comment-meta-line-height: 1.25rem;
  --comment-toggle-font-size: 0.75rem;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.35rem;
  row-gap: 0.2rem;
  font-size: var(--comment-meta-font-size);
  line-height: var(--comment-meta-line-height);
  color: var(--color-text-muted);

  &__toggle {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--comment-meta-line-height);
    margin-right: 0.15rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    position: relative;
    font-family: var(--font-mono);
    font-size: var(--comment-toggle-font-size);
    font-weight: 700;
    line-height: 1;
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

  &__controls {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: nowrap;
    white-space: nowrap;
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

  &__icon-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    color: inherit;
    text-decoration: none;
    opacity: 0.72;
    line-height: 0;
    transition: color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;

    &::before {
      content: "";
      position: absolute;
      inset: -6px;
    }

    &:hover {
      color: var(--color-text);
      opacity: 1;
      text-decoration: none;
      transform: translateY(-1px);
    }
  }

  @media (max-width: 640px) {
    --comment-meta-font-size: 0.875rem;
    --comment-meta-line-height: 1.375rem;
    --comment-toggle-font-size: 0.8125rem;

    column-gap: 0.45rem;
    row-gap: 0.28rem;

    &__info {
      column-gap: 0.6rem;
      row-gap: 0.22rem;
    }

    &__controls {
      gap: 0.7rem;
    }

    &__controls-sep {
      display: none;
    }
  }
}
</style>

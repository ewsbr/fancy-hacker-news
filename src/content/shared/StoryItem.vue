<script setup lang="ts">
import { computed } from 'vue';
import { Triangle } from 'lucide-vue-next';

export interface HNItem {
  id: number;
  title: string;
  titleUrl?: string;
  domain?: string;
  domainUrl?: string;
  score: number;
  by: string;
  userUrl?: string;
  timeAgo: string;
  timeUrl?: string;
  hideUrl?: string;
  commentsLabel: string;
  commentsUrl?: string;
  isNewUser?: boolean;
}

const props = defineProps<{
  story: HNItem;
  index: number;
}>();

const titleUrl = computed(() => props.story.titleUrl ?? `item?id=${props.story.id}`);
const userUrl = computed(() => props.story.userUrl ?? `user?id=${props.story.by}`);
const timeUrl = computed(() => props.story.timeUrl ?? `item?id=${props.story.id}`);
const hideUrl = computed(() => props.story.hideUrl ?? `hide?id=${props.story.id}`);
const commentsUrl = computed(() => props.story.commentsUrl ?? `item?id=${props.story.id}`);
const domainUrl = computed(() => props.story.domainUrl ?? (props.story.domain ? `from?site=${props.story.domain}` : ''));
</script>

<template>
  <article class="story-item">
    <div class="story-item__rank">
      {{ index }}.
    </div>

    <div class="story-item__content">
      <div class="story-item__title-row">
        <a
          :href="titleUrl"
          class="story-item__title"
        >
          {{ story.title }}
        </a>
        <span v-if="story.domain" class="story-item__domain">(<a :href="domainUrl">{{ story.domain }}</a>)</span>
      </div>

      <div class="story-item__meta">
        <div class="story-item__vote">
          <Triangle :size="12" fill="currentColor" :stroke-width="0" class="story-item__vote-arrow" />
          <span class="story-item__vote-count">{{ story.score }}</span>
        </div>
        <span class="story-item__divider">•</span>
        <span>
          by
          <a
            :href="userUrl"
            class="story-item__user"
            :class="{ 'story-item__user--new': story.isNewUser }"
          >{{ story.by }}</a>
        </span>
        <a :href="timeUrl">{{ story.timeAgo }}</a>
        <span class="story-item__divider">•</span>
        <a :href="hideUrl">hide</a>
        <span class="story-item__divider">•</span>
        <a :href="commentsUrl" class="story-item__comments">{{ story.commentsLabel }}</a>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.story-item {
  display: grid;
  grid-template-columns: 1.8rem 1fr;
  gap: 0.7rem;
  padding: 0.75rem 0.6rem;

  &:hover {
    background: color-mix(in srgb, var(--color-surface) 96%, var(--color-text) 4%);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }
}

.story-item__rank {
  margin-top: 0.1rem;
  color: var(--color-text-muted);
  text-align: right;
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.story-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.story-item__title-row {
  display: inline;
  line-height: 1.35;
}

.story-item__title {
  color: var(--color-text);
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 600;

  &:visited {
    color: var(--color-text-muted);
  }

  &:hover {
    color: color-mix(in srgb, var(--color-text) 60%, var(--color-accent) 40%);
    text-decoration: none;
  }
}

.story-item__domain {
  margin-left: 0.35rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 400;

  a {
    color: inherit;

    &:hover {
      color: var(--color-text);
    }
  }
}

.story-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 0.15rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;

  a {
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }
}

.story-item__vote {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.story-item__vote-arrow {
  color: var(--color-text-muted);
  margin-top: 0.3rem;
  transition: color 0.1s ease;
  align-self: flex-start;

  &:hover {
    color: var(--color-accent);
  }
}

.story-item__vote-count {
  color: var(--color-accent);
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.story-item__divider {
  color: var(--color-border);
  font-size: 0.9em;
  font-weight: 700;
  user-select: none;
}

.story-item__user {
  margin-left: 0.25rem;
  color: var(--color-text);
  font-weight: 600;

  &--new {
    color: var(--color-new-user);
  }
}

.story-item__comments {
  color: var(--color-text) !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .story-item {
    grid-template-columns: 1.5rem 1fr;
    gap: 0.5rem;
    padding: 0.6rem 0.4rem;
  }
}
</style>

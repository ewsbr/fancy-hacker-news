<script setup lang="ts">
import type { ItemDetail } from '@/parsers/item';
import RichText from '@/content/shared/RichText.vue';
import Badge from '@/content/shared/Badge.vue';
import { Triangle } from 'lucide-vue-next';

defineProps<{
  item: ItemDetail;
}>();
</script>

<template>
  <div class="story-detail">
    <div class="story-detail__layout">
      <div class="story-detail__vote" v-if="item.voteUp">
        <a :href="item.voteUp" class="story-detail__vote-btn" title="upvote">
          <Triangle :size="12" fill="currentColor" :stroke-width="0" />
        </a>
      </div>
      
      <div class="story-detail__content">
        <div class="story-detail__header">
          <component 
            :is="item.url ? 'a' : 'span'" 
            :href="item.url" 
            class="story-detail__title"
          >
            {{ item.title }}
          </component>
          <Badge v-if="item.isDead" variant="dead" label="Dead" />
          <Badge v-if="item.isFlagged" variant="flagged" label="Flagged" />
          <span v-if="item.site" class="story-detail__site">
            (<a :href="`from?site=${item.site}`">{{ item.site }}</a>)
          </span>
        </div>

        <div class="story-detail__meta">
          <span v-if="item.score !== null" class="story-detail__score">{{ item.score }} points</span>
          
          <span class="story-detail__author-wrap">
            by 
            <a 
              :href="`user?id=${item.author}`" 
              class="story-detail__author"
            >
              {{ item.author }}
            </a>
            <Badge v-if="item.authorIsNew" variant="new" label="New" title="New user" />
          </span>

          <a :href="item.ageLink" class="story-detail__age" :title="item.ageTimestamp">{{ item.age }}</a>

          <span class="story-detail__dot">&middot;</span>
          <div class="story-detail__actions">
          <template v-if="item.hideUrl">
            <a :href="item.hideUrl" class="story-detail__action">hide</a>
          </template>

          <template v-if="item.pastUrl">
            <span v-if="item.hideUrl" class="story-detail__dot">&middot;</span>
            <a :href="item.pastUrl" class="story-detail__action">past</a>
          </template>

          <template v-if="item.favoriteUrl">
            <span v-if="item.hideUrl || item.pastUrl" class="story-detail__dot">&middot;</span>
            <a :href="item.favoriteUrl" class="story-detail__action">favorite</a>
          </template>

          <template v-if="item.flagUrl">
            <span v-if="item.hideUrl || item.pastUrl || item.favoriteUrl" class="story-detail__dot">&middot;</span>
            <a :href="item.flagUrl" class="story-detail__action">flag</a>
          </template>
        </div>
        </div>

        <div v-if="item.bodyHtml" class="story-detail__body">
          <RichText :html="item.bodyHtml" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.story-detail {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &__layout {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  &__vote {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0.45rem;
  }

  &__vote-btn {
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.1s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: var(--color-accent);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__header {
    line-height: 1.3;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
    }
  }

  &__site {
    font-size: 0.85rem;
    color: var(--color-muted);
    margin-left: 0.5rem;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__meta {
    margin-top: 0.25rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 0.75rem;
    row-gap: 0.25rem;
    font-size: 0.85rem;
    color: var(--color-muted);
  }

  &__score {
    font-weight: 700;
    color: var(--color-accent);
  }

  &__author-wrap {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__author {
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__age {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  &__dot {
    color: var(--color-border);
    font-weight: 700;
  }

  &__action {
    color: inherit;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__body {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
  }
}
</style>

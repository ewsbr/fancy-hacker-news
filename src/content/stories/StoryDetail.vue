<script setup lang="ts">
import { computed } from 'vue';
import type { ItemDetail } from '@/parsers/item';
import RichText from '@/content/shared/RichText.vue';
import Badge from '@/content/shared/Badge.vue';
import VoteButton from '@/content/shared/VoteButton.vue';
import FlagButton from '@/content/shared/FlagButton.vue';

const props = defineProps<{
  item: ItemDetail;
}>();

const isFavorited = computed(() => props.item.favoriteUrl?.includes('un=t') ?? false);
const isFlagged = computed(() => props.item.flagUrl?.includes('un=t') ?? false);
</script>

<template>
  <div class="story-detail">
    <div class="story-detail__main">
      <div class="story-detail__layout">
        <div class="story-detail__vote">
          <VoteButton :href="item.voteUp" />
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
            <span v-if="item.site" class="story-detail__site">
              (<a :href="`from?site=${item.site}`">{{ item.site }}</a>)
            </span>
            <Badge v-if="item.isDead" variant="dead" label="Dead" />
            <Badge v-if="item.isFlagged" variant="flagged" label="Flagged" />
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

            <div class="story-detail__actions">
              <template v-if="item.hideUrl">
                <span class="story-detail__sep">&middot;</span>
                <a :href="item.hideUrl" class="story-detail__action">hide</a>
              </template>

              <template v-if="item.pastUrl">
                <span class="story-detail__sep">&middot;</span>
                <a :href="item.pastUrl" class="story-detail__action">past</a>
              </template>

              <template v-if="item.favoriteUrl">
                <span class="story-detail__sep">&middot;</span>
                <a :href="item.favoriteUrl" class="story-detail__action">{{ isFavorited ? 'un-favorite' : 'favorite' }}</a>
              </template>

              <template v-if="item.flagUrl">
                <span class="story-detail__sep">&middot;</span>
                <FlagButton :href="item.flagUrl" :is-unflag="isFlagged" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="item.bodyHtml" class="story-detail__body">
      <RichText :html="item.bodyHtml" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.story-detail {
  border-bottom: 1px solid var(--color-border);

  &__main {
    padding: 0.75rem 0.75rem 1rem;
    background: color-mix(in srgb, var(--color-surface) 98%, var(--color-accent) 2%);
  }

  &__layout {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }

  &__vote {
    padding-top: 0.15rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__header {
    line-height: 1.3;
    padding-top: 0.1rem;
  }

  &__title {
    font-family: var(--font-title);
    font-size: 1.152rem; // 1.15x
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
  }

  &__site {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-left: 0.3rem;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: var(--color-text);
      }
    }
  }

  &__meta {
    margin-top: 0.1rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 0.4rem;
    row-gap: 0.1rem;
    font-size: 0.82rem;
    color: var(--color-text-muted);
  }

  &__score {
    font-weight: 700;
    color: var(--color-accent);
  }

  &__author-wrap {
    display: flex;
    align-items: center;
    gap: 0.2rem;
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
    gap: 0.3rem;
  }

  &__sep {
    color: var(--color-border);
    font-weight: 900;
    font-size: 1.1rem;
    user-select: none;
    line-height: 1;
  }

  &__action {
    color: inherit;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__body {
    padding: 1rem 0.75rem 1.25rem;
    font-size: 0.92rem;
    line-height: 1.55;
    max-width: 50rem;
    color: var(--color-text);
    background: var(--color-surface);
    border-top: 1px dashed var(--color-border);
  }
}

@media (max-width: 640px) {
  .story-detail {
    &__title {
      font-size: 1.05rem;
    }

    &__meta {
      column-gap: 0.3rem;
    }

    &__actions {
      flex-wrap: wrap;
    }
  }
}
</style>

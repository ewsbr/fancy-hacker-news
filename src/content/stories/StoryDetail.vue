<script setup lang="ts">
import { computed } from 'vue';
import type { ItemDetail } from '@/parsers/item';
import RichText from '@/content/ui/composites/RichText.vue';
import Badge from '@/content/ui/primitives/Badge.vue';
import VoteButton from '@/content/ui/composites/VoteButton.vue';
import FlagButton from '@/content/ui/composites/FlagButton.vue';
import StorySiteLink from '@/content/ui/composites/StorySiteLink.vue';
import AuthorByline from '@/content/ui/composites/AuthorByline.vue';
import MetaSep from '@/content/ui/primitives/MetaSep.vue';

const props = defineProps<{
  item: ItemDetail;
}>();

const isFavorited = computed(() => props.item.favoriteUrl?.includes('un=t') ?? false);
const isFlagged = computed(() => props.item.flagUrl?.includes('un=t') ?? false);
const latestUrl = computed(() => `latest?id=${encodeURIComponent(props.item.id)}`);
</script>

<template>
  <div class="story-detail">
    <div class="story-detail__main">
      <div class="story-detail__layout">
        <div class="story-detail__vote">
          <VoteButton :href="item.voteUp" :vote-un-href="item.voteUn" :item-id="item.id" :vote-target="item" />
        </div>
        
        <div class="story-detail__content">
          <div class="story-detail__header">
            <component 
              :is="item.url ? 'a' : 'span'" 
              :href="item.url" 
              class="story-detail__title"
              :class="{ 'story-detail__title--dead': item.isDead }"
            >
              {{ item.title }}
            </component>
            <StorySiteLink :site="item.site" />
            <Badge v-if="item.isDead" variant="dead" label="Dead" />
            <Badge v-if="item.isFlagged" variant="flagged" label="Flagged" />
            <Badge v-if="item.isDeleted" variant="deleted" label="Deleted" />
          </div>

          <div class="story-detail__meta">
            <span v-if="item.score !== null" class="story-detail__score">{{ item.score }} points</span>
            
            <AuthorByline
              prefix="by"
              :author="item.author"
              :author-is-new="item.authorIsNew"
              :age-link="item.ageLink"
              :age="item.age"
              :age-timestamp="item.ageTimestamp"
            />

            <div class="story-detail__actions">
              <template v-if="item.hideUrl">
                <span class="story-detail__action-item">
                  <MetaSep class="story-detail__action-sep" />
                  <a :href="item.hideUrl" class="story-detail__action">hide</a>
                </span>
              </template>

              <template v-if="item.pastUrl">
                <span class="story-detail__action-item">
                  <MetaSep class="story-detail__action-sep" />
                  <a :href="item.pastUrl" class="story-detail__action">past</a>
                </span>
              </template>

              <template v-if="item.id">
                <span class="story-detail__action-item">
                  <MetaSep class="story-detail__action-sep" />
                  <a :href="latestUrl" class="story-detail__action">latest</a>
                </span>
              </template>

              <template v-if="item.favoriteUrl">
                <span class="story-detail__action-item">
                  <MetaSep class="story-detail__action-sep" />
                  <a :href="item.favoriteUrl" class="story-detail__action">{{ isFavorited ? 'un-favorite' : 'favorite' }}</a>
                </span>
              </template>

              <template v-if="item.flagUrl">
                <span class="story-detail__action-item">
                  <MetaSep class="story-detail__action-sep" />
                  <FlagButton :href="item.flagUrl" :is-unflag="isFlagged" :flag-target="item" />
                </span>
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
    background: var(--color-accent-surface-subtle);
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

    :deep(.badge) {
      margin-left: 0.35rem;
    }
  }

  &__title {
    font-family: var(--font-title);
    font-size: 1.152rem; // 1.15x
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;

    &--dead {
      text-decoration-line: line-through;
      text-decoration-thickness: 1.5px;
      text-decoration-color: currentColor;
      text-decoration-skip-ink: none;
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
    color: var(--color-accent-muted);
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  &__action-item {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
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
    color: var(--color-text);
    background: var(--color-surface);
    border-top: 1px dashed var(--color-border);
  }
}

@media (max-width: 640px) {
  .story-detail {
    &__main {
      padding: 0.9rem 0.85rem 1.15rem;
    }

    &__layout {
      gap: 0.5rem;
    }

    &__title {
      font-size: 1.16rem;
      line-height: 1.34;
    }

    &__meta {
      margin-top: 0.2rem;
      column-gap: 0.55rem;
      row-gap: 0.22rem;
      font-size: 0.96rem;
    }

    &__actions {
      flex-basis: 100%;
      margin-top: 0.16rem;
      gap: 0.6rem;
    }

    &__action-item {
      gap: 0.35rem;
    }

    &__action-sep {
      display: none;
    }
  }
}
</style>

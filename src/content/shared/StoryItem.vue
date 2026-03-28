<script setup lang="ts">
import { computed } from 'vue';

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
    <div class="story-rank">
      {{ index }}.
    </div>

    <div class="story-content">
      <div class="story-title-row">
        <a
          :href="titleUrl"
          class="story-title"
        >
          {{ story.title }}
        </a>
        <span v-if="story.domain" class="story-domain">(<a :href="domainUrl">{{ story.domain }}</a>)</span>
      </div>

      <div class="story-meta">
        <div class="story-vote">
          <span class="votearrow" aria-hidden="true"></span>
          <span class="vote-count">{{ story.score }}</span>
        </div>
        <span class="meta-divide">•</span>
        <span>
          by
          <a :href="userUrl" class="meta-user" :class="{ 'new-user': story.isNewUser }">{{ story.by }}</a>
        </span>
        <a :href="timeUrl" class="hover:underline">{{ story.timeAgo }}</a>
        <span class="meta-divide">•</span>
        <a :href="hideUrl" class="hover:underline">hide</a>
        <span class="meta-divide">•</span>
        <a :href="commentsUrl" class="meta-comments">{{ story.commentsLabel }}</a>
      </div>
    </div>
  </article>
</template>

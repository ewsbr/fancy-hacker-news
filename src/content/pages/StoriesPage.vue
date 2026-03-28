<script setup lang="ts">
import { ref } from 'vue';
import StoryItem, { type HNItem } from '../shared/StoryItem.vue';

// Mocked data since parser isn't ready
const mockedStories = ref<HNItem[]>([
  {
    id: 421234,
    title: 'Show HN: I put an AI agent on a $7/month VPS with IRC as its transport layer',
    titleUrl: '#',
    domain: 'georgelarson.me',
    domainUrl: '#',
    score: 86,
    by: 'j0rg3',
    userUrl: '#',
    timeAgo: '3 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '33 comments',
    commentsUrl: '#',
  },
  {
    id: 421235,
    title: 'Why so many control rooms were seafoam green (2025)',
    titleUrl: '#',
    domain: 'bethmathews.substack.com',
    domainUrl: '#',
    score: 597,
    by: 'Amorymeltzer',
    userUrl: '#',
    timeAgo: '9 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '122 comments',
    commentsUrl: '#',
  },
  {
    id: 421236,
    title: "Chicago artist creates tourism posters for city's neighborhoods",
    titleUrl: '#',
    domain: 'chicagotribune.com',
    domainUrl: '#',
    score: 47,
    by: 'NaOH',
    userUrl: '#',
    timeAgo: '2 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '19 comments',
    commentsUrl: '#',
  },
  {
    id: 421237,
    title: "Judge blocks Pentagon effort to 'punish' Anthropic with supply chain risk label",
    titleUrl: '#',
    domain: 'cnn.com',
    domainUrl: '#',
    score: 160,
    by: 'prawn',
    userUrl: '#',
    timeAgo: '2 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '83 comments',
    commentsUrl: '#',
  },
  {
    id: 421238,
    title: 'Moving from GitHub to Codeberg, for lazy people',
    titleUrl: '#',
    domain: 'unterwaditzer.net',
    domainUrl: '#',
    score: 524,
    by: 'jslakro',
    userUrl: '#',
    timeAgo: '12 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '274 comments',
    commentsUrl: '#',
  },
  {
    id: 421239,
    title: 'DOOM Over DNS',
    titleUrl: '#',
    domain: 'github.com/resumex',
    domainUrl: '#',
    score: 213,
    by: 'Venn1',
    userUrl: '#',
    timeAgo: '9 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '68 comments',
    commentsUrl: '#',
  },
  {
    id: 421240,
    title: 'Order Granting Preliminary Injunction – Anthropic vs. U.S. Department of War [pdf]',
    titleUrl: '#',
    domain: 'courtlistener.com',
    domainUrl: '#',
    score: 102,
    by: 'theindieman',
    userUrl: '#',
    timeAgo: '2 hours ago',
    timeUrl: '#',
    hideUrl: '#',
    commentsLabel: '11 comments',
    commentsUrl: '#',
    isNewUser: true,
  },
]);
</script>

<template>
  <div class="story-list">
    <StoryItem 
      v-for="(story, idx) in mockedStories"
      :key="story.id"
      :story="story"
      :index="idx + 1"
    />
  </div>
  <a href="#" class="load-more">
    Load More
  </a>
</template>

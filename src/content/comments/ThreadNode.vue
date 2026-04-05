<script setup lang="ts">
import { ref } from 'vue';
import type { ThreadEntry } from '@/parsers/threads';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/shared/CommentActions.vue';
import OnStoryHeader from './OnStoryHeader.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

const props = defineProps<{
  node: ThreadEntry;
}>();

const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);
const isHeavilyDownvoted = props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel.toLowerCase());
const isCollapsed = ref(props.node.isCollapsed || isHeavilyDownvoted);
const hasHeaderNav = !!(
  props.node.navLinks.root
  || props.node.navLinks.parent
  || props.node.navLinks.prev
  || props.node.navLinks.next
  || props.node.navLinks.context
);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<template>
  <div 
    class="comment-node"
    :class="[
      node.indent > 0 ? 'comment-node--nested' : 'comment-node--root',
      isCollapsed ? 'comment-node--collapsed' : ''
    ]"
    :id="node.id"
  >
    <div class="comment-node__content-wrap">
      <div class="comment-node__main">
        <OnStoryHeader v-if="node.onStory" class="comment-node__on-story" label="on" :href="node.onStory.link" :title="node.onStory.title" />
        
        <CommentHeader :node="node" :is-collapsed="isCollapsed" @toggle="toggleCollapse">
          <!-- Inject additional nav links exactly as they appear in threads -->
          <template #extra-nav>
            <span v-if="node.navLinks.parent" class="comment-node__extra-nav">
              <MetaSep /> <a :href="node.navLinks.parent">parent</a>
            </span>
            <span v-if="node.navLinks.next" class="comment-node__extra-nav">
              <MetaSep /> <a :href="node.navLinks.next">next</a>
            </span>
            <span v-if="node.navLinks.context" class="comment-node__extra-nav">
              <MetaSep /> <a :href="node.navLinks.context">context</a>
            </span>
          </template>
        </CommentHeader>
        
        <div v-if="!isCollapsed" class="comment-node__body-wrapper">
          <CommentBody
            :html="node.bodyHtml"
            :gray-level="node.grayLevel"
            :placeholder-kind="node.placeholderKind"
          />
          
          <CommentActions
            :item-id="node.id"
            :vote-up="node.voteUp"
            :vote-un="node.voteUn"
            :vote-down="node.voteDown"
            :vote-target="node"
            :reply-link="node.replyLink"
            :flag-url="node.flagUrl"
            :flag-target="node"
          />

          <div v-if="hasHeaderNav" class="comment-node__mobile-nav">
            <a v-if="node.navLinks.root" :href="node.navLinks.root" class="comment-node__mobile-nav-link">root</a>
            <a v-if="node.navLinks.parent" :href="node.navLinks.parent" class="comment-node__mobile-nav-link">parent</a>
            <a v-if="node.navLinks.prev" :href="node.navLinks.prev" class="comment-node__mobile-nav-link">prev</a>
            <a v-if="node.navLinks.next" :href="node.navLinks.next" class="comment-node__mobile-nav-link">next</a>
            <a v-if="node.navLinks.context" :href="node.navLinks.context" class="comment-node__mobile-nav-link">context</a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isCollapsed && node.children && node.children.length > 0" class="comment-node__thread">
      <button class="comment-node__line" @click="toggleCollapse" title="Collapse thread"></button>
      <div class="comment-node__children">
        <ThreadNode 
          v-for="child in node.children" 
          :key="child.id" 
          :node="child" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/comment-node' as *;

.comment-node {
  @include comment-node-base;

  &--root {
    padding: 0.75rem;
    border-top: 1px solid var(--color-border);

    &:first-child {
      border-top: none;
    }
  }

  &__on-story {
    margin-bottom: 0.35rem;
  }

  &__extra-nav {
    color: var(--color-border);
    margin-left: 0.3rem;
  }

  &__thread {
    margin-top: 0.35rem;
  }

  &__line {
    width: 20px;
  }

  &__mobile-nav {
    display: none;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.2rem;
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
      display: flex;
    }
  }

  &__mobile-nav-link {
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
}
</style>

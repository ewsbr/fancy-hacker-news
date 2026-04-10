<script setup lang="ts">
import { computed } from 'vue';
import { Triangle } from 'lucide-vue-next';
import type { VoteActionTarget } from '@/content/composables/use-hn-actions';
import { useHnActions } from '@/content/composables/use-hn-actions';

const props = defineProps<{
  href: string | null;
  voteUnHref?: string | null;
  itemId?: string;
  voteTarget?: VoteActionTarget | null;
}>();

const { isBusy, submitVote } = useHnActions();

const currentHref = computed(() => props.voteUnHref || props.href || null);
const currentDirection = computed(() => (props.voteUnHref ? 'un' : 'up'));

function handleClick(event: MouseEvent) {
  if (!props.voteTarget || !currentHref.value) {
    return;
  }

  event.preventDefault();
  void submitVote(props.voteTarget, currentHref.value, currentDirection.value);
}
</script>

<template>
  <span class="vote-btn-slot">
    <a
      v-if="currentHref"
      :href="currentHref"
      class="vote-btn"
      :class="{ 'vote-btn--active': !!voteUnHref, 'vote-btn--busy': isBusy }"
      :title="voteUnHref ? 'unvote' : 'upvote'"
      :aria-label="voteUnHref ? 'unvote' : 'upvote'"
      :aria-disabled="isBusy ? 'true' : undefined"
      @click="handleClick"
    >
      <Triangle :size="13" fill="currentColor" :stroke-width="0" />
    </a>
    <span v-else class="vote-btn vote-btn--inactive" aria-hidden="true">
      <Triangle :size="13" fill="currentColor" :stroke-width="0" />
    </span>
  </span>
</template>

<style scoped lang="scss">
.vote-btn-slot {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
}

.vote-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color 0.1s ease;
  margin-top: 5px;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;

    @media (max-width: 640px) {
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
    }
  }

  &:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  &--inactive {
    opacity: 0.2;
    pointer-events: none;
  }

  &--active {
    color: var(--color-accent);
  }

  &--busy {
    opacity: 0.6;
    pointer-events: none;
  }

  &--hidden {
    display: none;
  }
}
</style>

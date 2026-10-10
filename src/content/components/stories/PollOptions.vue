<script setup lang="ts">
import type { PollOption } from '@/parsers/item';
import { computed } from 'vue';
import VoteButton from '@/content/components/stories/VoteButton.vue';

const props = defineProps<{
  options: PollOption[];
}>();

// Highest score first; options without a score sort last, then alphabetically.
const displayedOptions = computed(() => [...props.options].sort((left, right) =>
  (right.score ?? -1) - (left.score ?? -1) || left.text.localeCompare(right.text, undefined, { sensitivity: 'base' })));
const maxScore = computed(() => Math.max(1, ...props.options.map(option => option.score ?? 0)));
const totalVotes = computed(() => props.options.reduce((sum, option) => sum + (option.score ?? 0), 0));
</script>

<template>
  <div class="poll-options">
    <div class="poll-options__header">
      <span class="poll-options__total">{{ totalVotes }} total votes</span>
    </div>
    <div
      v-for="opt in displayedOptions"
      :key="opt.id"
      class="poll-options__item"
    >
      <div class="poll-options__vote">
        <VoteButton :vote-target="opt" />
      </div>
      <div class="poll-options__content">
        <div class="poll-options__text">
          {{ opt.text }}
        </div>
        <div class="poll-options__bar-row">
          <div class="poll-options__bar">
            <div
              class="poll-options__bar-fill"
              :style="{ width: maxScore > 0 ? `${((opt.score || 0) / maxScore) * 100}%` : '0%' }"
            />
          </div>
          <span class="poll-options__score">
            {{ opt.score ?? 0 }} {{ (opt.score === 1) ? 'point' : 'points' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.poll-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;

  &__header {
    font-size: 0.8rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    color: var(--color-text-muted);
    font-weight: 600;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--color-border);
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__vote {
    flex-shrink: 0;
    padding-top: 0.15rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__text {
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  &__bar-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__bar {
    flex: 1;
    height: 6px;
    background: var(--color-border);
    border-radius: 3px;
    overflow: hidden;
    max-width: 200px;
  }

  &__bar-fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: 3px;
    transition: width 0.3s ease;
    min-width: 2px;
  }

  &__score {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    font-weight: 600;
    font-family: var(--font-mono);
  }
}
</style>

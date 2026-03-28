<script setup lang="ts">
defineProps<{ rank: number }>();
</script>

<template>
  <span class="story-rank">{{ rank }}.</span>
</template>

<style scoped lang="scss">
.story-rank {
  display: block;
  margin-top: 0.15rem;
  color: var(--color-text-muted);
  text-align: right;
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>

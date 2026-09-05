<script setup lang="ts">
defineProps<{ height: number }>();
</script>

<template>
  <div v-if="height > 0" class="comment-placeholder" :style="{ height: `${height}px` }" aria-hidden="true" />
</template>

<style scoped lang="scss">
.comment-placeholder {
  flex-shrink: 0;
  pointer-events: none;
  overflow-anchor: none;
  opacity: 0.4;
  background: linear-gradient(
    to bottom,
    var(--color-border) 0 10px,
    transparent 10px 24px,
    var(--color-border) 24px 34px,
    transparent 34px
  ) 0 8px / 75% 120px repeat-y;
}
</style>

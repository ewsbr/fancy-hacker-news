<script setup lang="ts">
defineProps<{ site: string | null }>();
</script>

<template>
  <span v-if="site" class="story-site-link">
    (<a :href="`from?site=${site}`">{{ site }}</a>)
  </span>
</template>

<style scoped lang="scss">
.story-site-link {
  margin-left: 0.3rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  font-size: 0.82rem;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
    }
  }

  @media (max-width: 640px) {
    margin-left: 0.4rem;
    font-size: 0.94rem;
  }
}
</style>

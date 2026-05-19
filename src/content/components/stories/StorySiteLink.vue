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
  margin-left: 5px;
  color: var(--color-text-muted);
  font-size: 0.82rem;

  a {
    color: inherit;
    text-decoration: none;
    overflow-wrap: anywhere;

    &:hover {
      color: var(--color-text);
    }
  }

  @media (max-width: 640px) {
    margin-left: 6px;
    font-size: 0.94rem;
  }
}
</style>

<script setup lang="ts">
withDefaults(defineProps<{
  message: string;
  role?: 'status' | 'alert';
}>(), {
  role: 'status',
});
</script>

<template>
  <div class="notice-banner" :role="role">
    {{ message }}
  </div>
</template>

<style scoped lang="scss">
.notice-banner {
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.85rem;
  line-height: 1.5;
  text-align: center;
}
</style>

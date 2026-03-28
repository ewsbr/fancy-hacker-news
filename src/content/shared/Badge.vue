<script setup lang="ts">
type BadgeVariant = 'new' | 'dead' | 'flagged' | 'downvoted' | 'job' | 'default';

defineProps<{
  variant?: BadgeVariant;
  label: string;
  title?: string;
}>();
</script>

<template>
  <span 
    class="badge" 
    :class="[`badge--${variant || 'default'}`]"
    :title="title"
  >
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 2px;
  white-space: nowrap;
  margin-left: 0.35rem;
  border: 1px solid transparent;

  &--default {
    background: var(--color-border);
    color: var(--color-text);
  }

  &--new {
    background: color-mix(in srgb, var(--color-new-user) 15%, transparent);
    color: var(--color-new-user);
    border-color: color-mix(in srgb, var(--color-new-user) 30%, transparent);
  }

  &--dead {
    background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
    color: var(--color-text-muted);
    border-color: color-mix(in srgb, var(--color-text-muted) 20%, transparent);
    text-decoration: line-through;
  }

  &--flagged {
    background: color-mix(in srgb, #ff3e00 10%, transparent);
    color: #ff3e00;
    border-color: color-mix(in srgb, #ff3e00 20%, transparent);
  }

  &--downvoted {
    background: color-mix(in srgb, var(--color-downvoted) 15%, transparent);
    color: var(--color-downvoted);
    border-color: color-mix(in srgb, var(--color-downvoted) 30%, transparent);
    text-transform: none;
    font-weight: 600;
  }

  &--job {
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    color: var(--color-accent);
    border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
  }
}
</style>

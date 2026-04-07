<script setup lang="ts">
type BadgeVariant = 'new' | 'dead' | 'flagged' | 'deleted' | 'downvoted' | 'job' | 'default';

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
  border: 1px solid transparent;

  &--default {
    background: var(--color-border);
    color: var(--color-text);
  }

  &--new {
    background: var(--color-status-new-bg);
    color: var(--color-new-user);
    border-color: var(--color-status-new-border);
  }

  &--dead {
    background: var(--color-status-muted-bg);
    color: var(--color-text-muted);
    border-color: var(--color-status-muted-border);
    text-decoration: line-through;
  }

  &--flagged {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border-color: var(--color-danger-border);
  }

  &--deleted {
    background: var(--color-status-muted-subtle-bg);
    color: var(--color-text-muted);
    border-color: var(--color-status-muted-subtle-border);
  }

  &--downvoted {
    background: var(--color-status-downvoted-bg);
    color: var(--color-downvoted);
    border-color: var(--color-status-downvoted-border);
    text-transform: none;
    font-weight: 600;
  }

  &--job {
    background: var(--color-accent-badge-bg);
    color: var(--color-accent);
    border-color: var(--color-accent-badge-border);
  }
}
</style>

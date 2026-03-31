<script setup lang="ts">
const props = defineProps<{
  href: string;
  /** Whether this is an unflag action (detected from URL containing un=t) */
  isUnflag?: boolean;
}>();

function handleClick(e: Event) {
  const action = props.isUnflag ? 'unflag' : 'flag';
  if (!window.confirm(`Are you sure you want to ${action} this?`)) {
    e.preventDefault();
  }
}
</script>

<template>
  <a :href="href" class="flag-button" @click="handleClick">
    {{ isUnflag ? 'unflag' : 'flag' }}
  </a>
</template>

<style scoped lang="scss">
.flag-button {
  color: inherit;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: var(--color-text);
    text-decoration: underline;
  }
}
</style>

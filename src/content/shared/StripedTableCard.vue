<template>
  <div class="striped-table-card hn-content-card">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.striped-table-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.striped-table-card__row) {
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }

    &:nth-child(even) {
      background: var(--color-row-alt);
    }

    &:hover {
      background: var(--color-row-hover);
    }
  }
}
</style>
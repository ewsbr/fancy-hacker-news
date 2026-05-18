<template>
  <button type="button" class="mock-theme-toggle" aria-label="Toggle theme">
    <span class="mock-theme-toggle__sun" aria-hidden="true">L</span>
    <span class="mock-theme-toggle__moon" aria-hidden="true">D</span>
  </button>
</template>

<style scoped lang="scss">
.mock-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-chrome-surface);
  color: var(--color-text-muted);
  cursor: pointer;
}

.mock-theme-toggle__sun,
.mock-theme-toggle__moon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.mock-theme-toggle__sun {
  background: var(--color-accent);
  color: #ffffff;
}

.mock-theme-toggle__moon {
  background: transparent;
  color: inherit;
}
</style>

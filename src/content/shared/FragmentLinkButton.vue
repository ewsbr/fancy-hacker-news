<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Hash } from 'lucide-vue-next';

const props = defineProps<{
  targetId: string;
}>();

const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | null = null;

function setCopiedState() {
  copied.value = true;

  if (copiedTimer) {
    clearTimeout(copiedTimer);
  }

  copiedTimer = setTimeout(() => {
    copied.value = false;
    copiedTimer = null;
  }, 1200);
}

function buildPermalink(targetId: string) {
  const permalink = new URL(window.location.href);
  permalink.hash = targetId;
  return permalink;
}

function updateFragment(targetId: string) {
  const previousUrl = window.location.href;
  const permalink = buildPermalink(targetId);

  window.history.replaceState(window.history.state, '', permalink.toString());
  window.dispatchEvent(new HashChangeEvent('hashchange', {
    oldURL: previousUrl,
    newURL: permalink.toString(),
  }));

  return permalink;
}

async function copyPermalink() {
  const permalink = updateFragment(props.targetId);

  try {
    await navigator.clipboard.writeText(permalink.toString());
    setCopiedState();
  } catch {
    // clipboard may be unavailable; keep the fragment update
  }
}

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer);
  }
});
</script>

<template>
  <button
    type="button"
    class="fragment-link-button"
    :title="copied ? 'Permalink copied' : 'Copy permalink to this comment'"
    :aria-label="copied ? 'Permalink copied' : 'Copy permalink to this comment'"
    @click="copyPermalink"
  >
    <Hash :size="14" aria-hidden="true" />
  </button>
</template>

<style scoped lang="scss">
.fragment-link-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  opacity: 0.72;
  cursor: pointer;
  line-height: 0;
  transition: color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;

  &::before {
    content: "";
    position: absolute;
    inset: -6px;
  }

  &:hover,
  &:focus-visible {
    color: var(--color-accent);
    opacity: 1;
    outline: none;
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    &::before {
      inset: -8px;
    }

    svg {
      width: 15px;
      height: 15px;
    }
  }
}
</style>

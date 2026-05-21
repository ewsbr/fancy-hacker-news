<script setup lang="ts">
import type { NavLink } from '@/parsers/header';
import { ChevronDown } from 'lucide-vue-next';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui';
import { computed, ref } from 'vue';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/root-host';

interface HeaderLinkGroup {
  label: string;
  links: NavLink[];
}

const props = defineProps<{
  groups: HeaderLinkGroup[];
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const open = ref(false);

const hasActiveLink = computed(() => props.groups.some(group => group.links.some(link => link.active)));
const linkCount = computed(() => props.groups.reduce((count, group) => count + group.links.length, 0));
const defaultMobileGroup = computed(() => {
  return props.groups.find(group => group.links.some(link => link.active))?.label ?? props.groups[0]?.label;
});

function onLinkClick() {
  emit('navigate');
}
</script>

<template>
  <template v-if="linkCount > 0">
    <DropdownMenuRoot v-model:open="open">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="header-more__trigger"
          :class="{ 'header-more__trigger--open': open, 'header-more__trigger--active': hasActiveLink }"
        >
          explore
          <ChevronDown
            :size="14"
            class="header-more__chevron"
            :class="{ 'header-more__chevron--open': open }"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal defer :to="EXTENSION_ROOT_SELECTOR">
        <DropdownMenuContent
          class="header-more__content-shell"
          side="bottom"
          align="start"
          :side-offset="8"
          :collision-padding="12"
        >
          <div class="header-more__panel">
            <DropdownMenuGroup
              v-for="group in groups"
              :key="group.label"
              class="header-more__group"
            >
              <DropdownMenuLabel class="header-more__group-label">
                {{ group.label }}
              </DropdownMenuLabel>
              <DropdownMenuItem
                v-for="link in group.links"
                :key="`${group.label}-${link.href}-${link.label}`"
                as-child
                :text-value="link.label"
                @select="onLinkClick"
              >
                <a
                  :href="link.href"
                  class="header-more__link"
                  :class="{ 'header-more__link--active': link.active }"
                >
                  {{ link.label }}
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <AccordionRoot
      class="header-more__mobile-panel"
      aria-label="More Hacker News links"
      type="single"
      collapsible
      :default-value="defaultMobileGroup"
    >
      <AccordionItem
        v-for="group in groups"
        :key="group.label"
        :value="group.label"
        class="header-more__accordion-item"
      >
        <AccordionHeader as="div" class="header-more__accordion-header">
          <AccordionTrigger class="header-more__accordion-trigger">
            <span>{{ group.label }}</span>
            <ChevronDown
              :size="16"
              class="header-more__accordion-chevron"
              aria-hidden="true"
            />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent class="header-more__accordion-content">
          <div class="header-more__accordion-links">
            <a
              v-for="link in group.links"
              :key="`${group.label}-${link.href}-${link.label}`"
              :href="link.href"
              class="header-more__link"
              :class="{ 'header-more__link--active': link.active }"
              @click="onLinkClick"
            >
              {{ link.label }}
            </a>
          </div>
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  </template>
</template>

<style scoped lang="scss">
.header-more__trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 28px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  line-height: 1;
}

.header-more__trigger:hover,
.header-more__trigger--open,
.header-more__trigger--active {
  color: var(--color-text);
}

.header-more__trigger--active {
  color: var(--color-accent-muted);
}

.header-more__chevron {
  transition: transform 0.15s ease;
}

.header-more__chevron--open {
  transform: rotate(180deg);
}

.header-more__panel {
  z-index: 120;
  display: grid;
  grid-template-columns: repeat(2, minmax(128px, 1fr));
  align-items: start;
  gap: 12px;
  min-width: 304px;
  padding: 12px;
  border: 1px solid var(--color-chrome-border);
  border-radius: 6px;
  background: var(--color-chrome-surface);
  box-shadow: var(--shadow-elevation);
}

.header-more__mobile-panel {
  display: none;
}

.header-more__accordion-item,
.header-more__accordion-header,
.header-more__accordion-content,
.header-more__accordion-links,
.header-more__accordion-trigger,
.header-more__accordion-chevron {
  display: none;
}

.header-more__group {
  display: grid;
  align-content: start;
  grid-auto-rows: min-content;
  gap: 4px;
  min-width: 0;
}

.header-more__group-label {
  display: inline-flex;
  align-items: flex-start;
  width: fit-content;
  height: 16px;
  margin: 0 8px 3px;
  padding: 0 0 3px;
  border-bottom: 1px solid var(--color-chrome-border);
  color: var(--color-text);
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.header-more__link {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 8px;
  border-radius: 4px;
  color: var(--color-text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.header-more__link:hover,
.header-more__link[data-highlighted] {
  background: var(--color-bg);
  color: var(--color-text);
  text-decoration: none;
}

.header-more__link--active {
  color: var(--color-accent-muted);
  font-weight: 800;
}

:deep(.header-more__content-shell) {
  z-index: 120;
}

@media (max-width: 768px) {
  .header-more__trigger {
    display: none;
  }

  .header-more__mobile-panel {
    display: grid;
    gap: 4px;
  }

  .header-more__panel {
    display: none;
  }

  .header-more__accordion-item {
    display: block;
    min-width: 0;
    border-bottom: 1px solid var(--color-chrome-border);
  }

  .header-more__accordion-header {
    display: block;
  }

  .header-more__accordion-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    border: 0;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    font: inherit;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    line-height: 1;
    text-align: left;
    text-transform: uppercase;
  }

  .header-more__accordion-trigger:hover {
    background: var(--color-bg);
  }

  .header-more__accordion-chevron {
    display: block;
    flex: 0 0 auto;
    color: var(--color-text-muted);
    transition: transform 0.15s ease;
  }

  .header-more__accordion-trigger[data-state='open'] .header-more__accordion-chevron {
    transform: rotate(180deg);
  }

  .header-more__accordion-content {
    display: block;
    overflow: hidden;
  }

  .header-more__accordion-links {
    display: grid;
    padding: 0 0 6px;
  }

  .header-more__link {
    min-height: 40px;
    height: auto;
    padding: 0 12px;
    border-radius: 0;
  }
}
</style>

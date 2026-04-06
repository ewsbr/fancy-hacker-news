<script setup lang="ts">
import { Send, HelpCircle } from 'lucide-vue-next';
import Tooltip from '@/content/shared/Tooltip.vue';
import type { ParsedSubmitPage } from '@/parsers/submit';

const props = defineProps<{
  form: NonNullable<ParsedSubmitPage['form']>;
  modelValue: Record<string, string>;
  placeholders: Record<string, string>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>];
}>();

const FIELD_META: Record<string, { label: string; description: string; rows?: number }> = {
  title: {
    label: 'Title',
    description: 'Keep it specific and faithful to the source. Hacker News titles work best when they stay under 80 characters.',
  },
  url: {
    label: 'URL',
    description: 'Leave this blank for an Ask HN or discussion post. For link posts, use the canonical URL when possible.',
  },
  text: {
    label: 'Text',
    description: 'Optional for link posts, required for discussion-style submissions. This appears at the top of the thread.',
    rows: 8,
  },
};

function getFieldMeta(name: string) {
  return FIELD_META[name] ?? {
    label: name.charAt(0).toUpperCase() + name.slice(1),
    description: 'Fill out this field exactly as Hacker News expects it.',
  };
}

function handleFieldInput(name: string, event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  if (!target) {
    return;
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [name]: target.value,
  });
}
</script>

<template>
  <form :action="form.action" method="post" class="submit-form">
    <input type="hidden" name="fnid" :value="form.fnid" />
    <input type="hidden" name="fnop" :value="form.fnop" />

    <div class="submit-form__fields">
      <div v-for="field in form.fields" :key="field.name" class="submit-form__field">
        <div class="submit-form__field-head">
          <label :for="`submit-${field.name}`" class="submit-form__label">{{ getFieldMeta(field.name).label }}</label>
          <Tooltip :content="getFieldMeta(field.name).description">
            <HelpCircle :size="12" class="submit-form__label-help" />
          </Tooltip>
        </div>

        <div class="submit-form__input-wrapper">
          <textarea
            v-if="field.type === 'textarea'"
            :id="`submit-${field.name}`"
            :name="field.name"
            :value="modelValue[field.name] ?? field.value"
            class="submit-form__textarea"
            :rows="getFieldMeta(field.name).rows ?? 6"
            :placeholder="placeholders[field.name] ?? ''"
            @input="handleFieldInput(field.name, $event)"
          ></textarea>
          
          <input
            v-else
            :type="field.type"
            :id="`submit-${field.name}`"
            :name="field.name"
            :value="modelValue[field.name] ?? field.value"
            class="submit-form__input"
            :placeholder="placeholders[field.name] ?? ''"
            :autofocus="field.name === 'title'"
            @input="handleFieldInput(field.name, $event)"
          />
        </div>
      </div>

      <div class="submit-form__footer">
        <p class="submit-form__footnote">Link posts can include optional context. Discussion posts should usually use title plus text.</p>
        <button type="submit" class="submit-form__button">
          <Send :size="14" class="submit-form__button-icon" />
          submit post
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped lang="scss">
.submit-form {
  width: 100%;
  
  &__fields {
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
  }
  
  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  
  &__field-head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  &__label {
    color: var(--color-text);
    font-family: var(--font-title);
    font-size: 0.94rem;
    font-weight: 700;
  }

  &__label-help {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  
  &__input-wrapper {
    width: 100%;
  }
  
  &__input, &__textarea {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    padding: 0.75rem 0.85rem;
    font-size: 0.95rem;
    outline: none;
    line-height: 1.5;
    transition: border-color 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease;

    &::placeholder {
      color: color-mix(in srgb, var(--color-text-muted) 75%, transparent);
    }
    
    &:hover {
      border-color: color-mix(in srgb, var(--color-border) 35%, var(--color-text) 65%);
    }
    
    &:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
    }
  }
  
  &__textarea {
    resize: vertical;
    min-height: 10rem;
    font-family: inherit;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.25rem;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__footnote {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }
  
  &__button {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.7rem 1.1rem;
    font-weight: 700;
    font-family: var(--font-title);
    font-size: 0.86rem;
    cursor: pointer;
    transition: background-color 0.1s ease, color 0.1s ease, border-color 0.1s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    white-space: nowrap;

    @media (max-width: 640px) {
      width: 100%;
    }

    &:hover {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: white;
    }

    &:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
      outline: none;
    }
  }

  &__button-icon {
    color: var(--color-accent);
    transition: color 0.1s ease;
  }

  &__button:hover &__button-icon {
    color: white;
  }

  @media (max-width: 640px) {
    &__input,
    &__textarea {
      font-size: 1rem;
      padding: 0.85rem 0.95rem;
    }
  }
}
</style>

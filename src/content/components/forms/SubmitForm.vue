<script setup lang="ts">
import { Send, HelpCircle } from 'lucide-vue-next';
import Tooltip from '@/content/components/ui/Tooltip.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import type { ParsedSubmitPage } from '@/parsers/submit';

const props = withDefaults(defineProps<{
  form: NonNullable<ParsedSubmitPage['form']>;
  modelValue: Record<string, string>;
  placeholders: Record<string, string>;
  variant?: 'default' | 'utility';
}>(), {
  variant: 'default',
});

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
  <form
    :action="form.action"
    method="post"
    :class="['submit-form', { 'submit-form--utility': variant === 'utility' }]"
  >
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
        <button type="submit" class="submit-form__button">
          <Send :size="14" class="submit-form__button-icon" />
          submit post
        </button>
        <MetaSep />
        <a href="formatdoc" class="submit-form__help" target="_blank" rel="noopener noreferrer">formatting help</a>
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
    gap: 22px;
  }
  
  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  &__field-head {
    display: flex;
    align-items: center;
    gap: 7px;
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
    padding: 12px 14px;
    font-size: 1rem;
    outline: none;
    line-height: 1.5;
    transition: border-color 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease;

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.75;
    }
    
    &:hover {
      border-color: var(--color-divider);
    }
    
    &:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-focus-ring);
    }
  }
  
  &__textarea {
    resize: vertical;
    min-height: 160px;
    font-family: inherit;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 4px;

    @media (max-width: 640px) {
      flex-wrap: wrap;
    }
  }
  
  &__button {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 11px 18px;
    font-weight: 700;
    font-family: var(--font-title);
    font-size: 0.86rem;
    cursor: pointer;
    transition: background-color 0.1s ease, color 0.1s ease, border-color 0.1s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    white-space: nowrap;

    @media (max-width: 640px) {
      width: 100%;
    }

    &:hover {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: #ffffff;
    }

    &:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px var(--color-focus-ring);
      outline: none;
    }
  }

  &__button-icon {
    color: var(--color-accent);
    transition: color 0.1s ease;
  }

  &__button:hover &__button-icon {
    color: #ffffff;
  }

  &__help {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &--utility {
    .submit-form__fields {
      gap: 10px;
    }

    .submit-form__field {
      gap: 6px;
    }

    .submit-form__field-head {
      justify-content: flex-start;
      gap: 6px 10px;
      padding-bottom: 1px;
    }

    .submit-form__label {
      font-size: 0.76rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .submit-form__label-help {
      color: var(--color-text-muted);
    }

    .submit-form__input,
    .submit-form__textarea {
      background: var(--color-surface);
      border-radius: 3px;
      box-shadow: none;
    }

    .submit-form__textarea {
      min-height: 140px;
    }

    .submit-form__footer {
      align-items: center;
      padding-top: 0;
    }

    .submit-form__button {
      padding: 9px 14px;
      font-size: 0.78rem;
    }
  }

  @media (max-width: 640px) {
    &__input,
    &__textarea {
      font-size: 1rem;
      padding: 14px 16px;
    }

    &--utility {
      .submit-form__field-head {
        align-items: center;
      }

      .submit-form__footer {
        padding-top: 0;
      }
    }
  }
}
</style>

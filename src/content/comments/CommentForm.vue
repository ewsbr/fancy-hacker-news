<script setup lang="ts">
import type { ReplyForm } from '@/parsers/item';
import { Send } from 'lucide-vue-next';

defineProps<{
  form: ReplyForm;
  autofocus?: boolean;
}>();
</script>

<template>
  <form :action="form.action" method="post" class="comment-form">
    <input type="hidden" name="parent" :value="form.parentId" />
    <input type="hidden" name="goto" :value="form.gotoUrl" />
    <input type="hidden" name="hmac" :value="form.hmac" />
    
    <div class="comment-form__field">
      <textarea 
        name="text" 
        rows="5"
        :autofocus="autofocus"
        class="comment-form__input"
        placeholder="Add your comment..."
      ></textarea>
    </div>
    
    <div class="comment-form__footer">
      <button 
        type="submit" 
        class="comment-form__submit"
      >
        <Send :size="13" class="comment-form__icon" />
        {{ form.submitLabel }}
      </button>
      <span class="comment-form__sep">&middot;</span>
      <a href="formatdoc" class="comment-form__help" target="_blank" rel="noopener noreferrer">formatting help</a>
    </div>
  </form>
</template>

<style scoped lang="scss">
.comment-form {
  max-width: 48rem;

  &__field {
    margin-bottom: 0.5rem;
  }

  &__input {
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 0.6rem 0.75rem;
    font-family: inherit;
    font-size: 0.92rem;
    color: var(--color-text);
    resize: vertical;
    transition: all 0.1s ease;
    line-height: 1.5;

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.5;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--color-border) 40%, var(--color-text) 60%);
    }

    &:focus {
      border-color: var(--color-accent);
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__submit {
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 0.35rem 1rem;
    font-weight: 700;
    font-family: var(--font-title);
    font-size: 0.82rem;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.1s ease;

    &:hover {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: white;
      
      .comment-form__icon {
        color: white;
      }
    }

    &:active {
      transform: translateY(1px);
    }

    &:focus {
      border-color: var(--color-accent);
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
    }
  }

  &__icon {
    color: var(--color-accent);
    transition: color 0.1s ease;
  }

  &__sep {
    color: var(--color-border);
    font-weight: 900;
    font-size: 1.1rem;
    user-select: none;
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
}
</style>

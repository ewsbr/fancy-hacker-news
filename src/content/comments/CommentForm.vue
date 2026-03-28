<script setup lang="ts">
import type { ReplyForm } from '@/parsers/item';

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
        rows="6"
        :autofocus="autofocus"
        class="comment-form__input"
      ></textarea>
    </div>
    
    <div class="comment-form__actions">
      <button 
        type="submit" 
        class="comment-form__submit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="comment-form__icon">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        {{ form.submitLabel }}
      </button>
      <a href="formatdoc" class="comment-form__help" target="_blank" rel="noopener noreferrer">formatting help</a>
    </div>
  </form>
</template>

<style scoped lang="scss">
.comment-form {
  margin-top: 1rem;
  max-width: 42rem; // 2xl

  &__field {
    margin-bottom: 0.75rem;
  }

  &__input {
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    padding: 0.75rem;
    font-family: inherit;
    font-size: 0.95rem;
    color: var(--color-text);
    resize: vertical;

    &:focus {
      border-color: var(--color-accent);
      background: var(--color-surface);
      outline: none;
      box-shadow: 0 0 0 1px var(--color-accent);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__submit {
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 0.375rem 1rem;
    font-weight: 700;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background: var(--color-bg);
      color: var(--color-accent);
    }

    &:focus {
      border-color: var(--color-accent);
      outline: none;
    }
  }

  &__icon {
    color: var(--color-accent);
  }

  &__help {
    font-size: 0.8rem;
    color: var(--color-muted);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

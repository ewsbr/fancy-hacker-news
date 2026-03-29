<script setup lang="ts">
import type { ParsedSubmitPage } from '@/parsers/submit';

defineProps<{
  form: NonNullable<ParsedSubmitPage['form']>;
}>();
</script>

<template>
  <form :action="form.action" method="post" class="submit-form">
    <input type="hidden" name="fnid" :value="form.fnid" />
    <input type="hidden" name="fnop" :value="form.fnop" />

    <div class="submit-form__fields">
      <div v-for="field in form.fields" :key="field.name" class="submit-form__field">
        <label :for="`submit-${field.name}`" class="submit-form__label">{{ field.name }}:</label>
        
        <div class="submit-form__input-wrapper">
          <textarea
            v-if="field.type === 'textarea'"
            :id="`submit-${field.name}`"
            :name="field.name"
            :value="field.value"
            class="submit-form__textarea"
            rows="5"
          ></textarea>
          
          <input
            v-else
            :type="field.type"
            :id="`submit-${field.name}`"
            :name="field.name"
            :value="field.value"
            class="submit-form__input"
          />
        </div>
      </div>
      
      <div class="submit-form__field">
        <div class="submit-form__label"></div>
        <div class="submit-form__input-wrapper">
          <button type="submit" class="submit-form__button">submit</button>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped lang="scss">
.submit-form {
  max-width: 600px;
  margin-top: 1rem;
  
  &__fields {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  &__field {
    display: flex;
  }
  
  &__label {
    width: 6rem;
    padding-top: 0.5rem;
    text-align: right;
    padding-right: 1rem;
    color: var(--color-text-muted);
  }
  
  &__input-wrapper {
    flex: 1;
    min-width: 0;
  }
  
  &__input, &__textarea {
    width: 100%;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.5rem;
    font-size: 0.95rem;
    outline: none;
    
    &:focus {
      border-color: var(--color-accent);
    }
  }
  
  &__textarea {
    resize: vertical;
    font-family: var(--font-mono);
  }
  
  &__button {
    background: var(--color-border);
    color: var(--color-text);
    border: none;
    padding: 0.5rem 1.5rem;
    font-weight: bold;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background: var(--color-text);
      color: var(--color-bg);
    }
  }
}
</style>

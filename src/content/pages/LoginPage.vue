<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedLoginPage } from '@/parsers/login';

const page = inject<ParsedLoginPage>('pageData')!;
</script>

<template>
  <div class="login-page">
    <h1 class="login-page__title">{{ page.title }}</h1>
    <div v-if="page.forms.length === 0" class="login-page__empty-state">No forms found on this page.</div>
    <div v-else class="login-page__forms">
      <div v-for="(form, idx) in page.forms" :key="idx" class="login-page__form-container">
        <h2 v-if="form.title" class="login-page__form-title">{{ form.title }}</h2>
        <form
          v-if="form.visibleFields.length"
          :action="form.action"
          :method="form.method"
          class="login-page__form"
        >
          <input
            v-for="f in form.hiddenFields"
            :key="f.name"
            type="hidden"
            :name="f.name"
            :value="f.value"
          />
          <div v-for="field in form.visibleFields" :key="field.name" class="login-page__row">
            <label :for="`hn-${idx}-${field.name}`" class="login-page__label">{{ field.label }}</label>
            <input
              :id="`hn-${idx}-${field.name}`"
              :type="field.type"
              :name="field.name"
              :defaultValue="field.value"
              class="login-page__input"
            />
          </div>
          <input
            type="submit"
            :value="form.submitLabel"
            class="login-page__submit"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  padding: 2rem 0;
}

.login-page__title {
  margin-bottom: 1.5rem;
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 600;
}

.login-page__forms {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 28rem;
}

.login-page__form-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.login-page__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
}

.login-page__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-page__label {
  width: 6rem;
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  text-transform: capitalize;
}

.login-page__input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: var(--color-bg);
  color: var(--color-text);
}

.login-page__submit {
  align-self: flex-start;
  padding: 0.375rem 1rem;
  border: 1px solid var(--color-accent);
  border-radius: 0.25rem;
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.login-page__empty-state {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>

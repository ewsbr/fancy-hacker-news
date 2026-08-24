// @vitest-environment jsdom

import type { ParsedLoginPage } from '@/parsers/login';
import { describe, expect, it } from 'vitest';
import LoginPage from '@/content/pages/LoginPage.vue';
import { mountComponent } from '../helpers/mount-component';

describe('login page', () => {
  it('renders HN\'s rate-limit response instead of a missing-form error', () => {
    const page: ParsedLoginPage = {
      variant: 'rate-limited',
      title: 'Rate limited',
      authMessage: 'Sorry.',
      forms: [],
    };
    const wrapper = mountComponent(LoginPage, {
      global: {
        provide: { pageData: page },
      },
    });

    expect(wrapper.get('h1').text()).toBe('Rate limited');
    expect(wrapper.text()).toContain('Sorry.');
    expect(wrapper.text()).toContain('temporarily limited requests');
    expect(wrapper.text()).not.toContain('No authentication forms found.');
    expect(wrapper.find('main.login-card').exists()).toBe(false);
  });
});

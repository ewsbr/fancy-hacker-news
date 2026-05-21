// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import BestRangeNotice from '@/content/components/shared/BestRangeNotice.vue';
import { mountComponent } from '../helpers/mount-component';

describe('best range notice', () => {
  it('renders the range shortcuts and marks the active range', () => {
    const wrapper = mountComponent(BestRangeNotice, {
      props: {
        activeHours: '24',
      },
    });

    expect(wrapper.text()).toContain('Most-upvoted stories');
    expect(wrapper.findAll('a')).toHaveLength(7);

    const activeRange = wrapper.get('[aria-current="page"]');
    expect(activeRange.text()).toBe('1d');
    expect(activeRange.attributes('href')).toBe('best?h=24');
  });
});

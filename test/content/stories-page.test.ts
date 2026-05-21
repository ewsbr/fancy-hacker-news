// @vitest-environment jsdom

import type { ParsedStoryList } from '@/parsers/story-list';
import type { RouteDescriptor } from '@/router';
import { describe, expect, it } from 'vitest';
import StoriesPage from '@/content/pages/StoriesPage.vue';
import { parseStoryList } from '@/parsers/story-list';
import { loadFixtureDocument } from '../helpers/load-fixture';
import { mountComponent } from '../helpers/mount-component';

function mountStoriesPage(pageData: ParsedStoryList, route: RouteDescriptor) {
  return mountComponent(StoriesPage, {
    global: {
      provide: {
        pageData,
        route,
      },
      stubs: {
        StoryRow: true,
        Pagination: true,
      },
    },
  });
}

describe('stories page', () => {
  it('renders the best-range notice alongside the parsed best intro', async () => {
    const doc = await loadFixtureDocument('stories/best.html');
    const pageData = parseStoryList(doc);
    const wrapper = mountStoriesPage(pageData, {
      page: 'stories',
      params: {
        type: 'best',
        h: '48',
      },
    });

    expect(wrapper.find('[aria-label="Best stories range shortcuts"]').exists()).toBe(true);
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2d');
    expect(wrapper.get('[aria-current="page"]').attributes('href')).toBe('best?h=48');
    expect(wrapper.get('.top-notice').text()).toContain('Most-upvoted stories of the last 48 hours');
    expect(wrapper.find('.user-collection-header').exists()).toBe(false);
    expect(wrapper.findAllComponents({ name: 'StoryRow' })).toHaveLength(pageData.stories.length);
    expect(wrapper.getComponent({ name: 'Pagination' }).props('href')).toBe(pageData.moreLink);
  });

  it('does not render the best-range notice on non-best story feeds', () => {
    const wrapper = mountStoriesPage({
      introHtml: null,
      stories: [],
      moreLink: null,
      startRank: 1,
    }, {
      page: 'stories',
      params: {
        type: 'top',
      },
    });

    expect(wrapper.find('[aria-label="Best stories range shortcuts"]').exists()).toBe(false);
  });
});

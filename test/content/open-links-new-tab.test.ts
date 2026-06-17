// @vitest-environment jsdom

import type { Story } from '@/parsers/story-list';
import { describe, expect, it } from 'vitest';
import RichText from '@/content/components/shared/RichText.vue';
import StoryRow from '@/content/components/stories/StoryRow.vue';
import { makeDefaultSettings } from '@/state/settings';
import {
  createExtensionSettingsState,
  EXTENSION_SETTINGS_KEY,
} from '@/state/settings-context';
import { mountComponent } from '../helpers/mount-component';

function makeSettings(openLinksInNewTab: boolean) {
  return createExtensionSettingsState({
    ...makeDefaultSettings({ systemTheme: 'light' }),
    features: {
      scrollToTop: true,
      longPressCommentCollapse: true,
      openLinksInNewTab,
    },
  });
}

function makeStory(): Story {
  return {
    id: '10',
    rank: 1,
    title: 'Example story',
    url: 'https://example.com/story',
    site: 'example.com',
    score: 12,
    author: 'dang',
    authorIsNew: false,
    age: '1 hour ago',
    ageTimestamp: '2026-04-06T00:01:00.000Z',
    ageLink: 'item?id=10',
    commentCount: 3,
    commentLink: 'item?id=10',
    isJob: false,
    hideAction: { kind: 'unavailable' },
    voteState: { kind: 'unavailable' },
    isDead: false,
    isFlagged: false,
    isDeleted: false,
  };
}

function mountWithSettings(component: typeof RichText | typeof StoryRow, props: Record<string, unknown>, openLinksInNewTab: boolean) {
  return mountComponent(component, {
    props,
    global: {
      provide: {
        [EXTENSION_SETTINGS_KEY as symbol]: makeSettings(openLinksInNewTab),
      },
    },
  });
}

describe('open links in new tab setting', () => {
  it('keeps rich text links same-tab when disabled', () => {
    const wrapper = mountWithSettings(RichText, {
      html: '<p><a href="https://example.com">Example</a></p>',
    }, false);
    const link = wrapper.get('a');

    expect(link.attributes('target')).toBeUndefined();
    expect(link.attributes('rel')).toBeUndefined();
  });

  it('adds safe new-tab attributes to rich text navigation links when enabled', () => {
    const wrapper = mountWithSettings(RichText, {
      html: '<p><a href="https://example.com" rel="ugc">Example</a> <a href="#local">local</a></p>',
    }, true);
    const links = wrapper.findAll('a');

    expect(links[0].attributes('target')).toBe('_blank');
    expect(links[0].attributes('rel')).toBe('ugc noopener noreferrer');
    expect(links[1].attributes('target')).toBeUndefined();
    expect(links[1].attributes('rel')).toBeUndefined();
  });

  it('adds safe new-tab attributes to story title links when enabled', () => {
    const wrapper = mountWithSettings(StoryRow, {
      story: makeStory(),
    }, true);
    const title = wrapper.get('.story-row__title');

    expect(title.attributes('target')).toBe('_blank');
    expect(title.attributes('rel')).toBe('noopener noreferrer');
    expect(wrapper.get('.story-row__comments').attributes('target')).toBeUndefined();
  });
});

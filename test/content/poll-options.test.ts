// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import PollOptions from '@/content/components/stories/PollOptions.vue';
import { mountComponent } from '../helpers/mount-component';

describe('pollOptions', () => {
  it('renders poll options by score descending with alphabetical tie-breaking', () => {
    const wrapper = mountComponent(PollOptions, {
      props: {
        options: [
          { id: 'c', text: 'Gamma', score: 3, voteState: { kind: 'unavailable' } },
          { id: 'a', text: 'Alpha', score: 5, voteState: { kind: 'unavailable' } },
          { id: 'b', text: 'Beta', score: 5, voteState: { kind: 'unavailable' } },
        ],
      },
      global: {
        stubs: {
          VoteButton: true,
        },
      },
    });

    expect(wrapper.findAll('.poll-options__text').map(node => node.text())).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
  });

  it('falls back to alphabetical order when scores are missing', () => {
    const wrapper = mountComponent(PollOptions, {
      props: {
        options: [
          { id: 'c', text: 'zebra', score: null, voteState: { kind: 'unavailable' } },
          { id: 'a', text: 'Alpha', score: null, voteState: { kind: 'unavailable' } },
          { id: 'b', text: 'beta', score: null, voteState: { kind: 'unavailable' } },
        ],
      },
      global: {
        stubs: {
          VoteButton: true,
        },
      },
    });

    expect(wrapper.findAll('.poll-options__text').map(node => node.text())).toEqual([
      'Alpha',
      'beta',
      'zebra',
    ]);
  });
});

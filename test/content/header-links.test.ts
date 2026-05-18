import type { NavLink } from '@/parsers/header';
import { describe, expect, it } from 'vitest';
import {
  createOverflowNavGroups,
  createPrimaryNavLinks,
  createVisibleNavLinks,
} from '@/content/utils/header-links';

describe('header links', () => {
  it('does not synthesize navigation when HN does not provide header nav links', () => {
    expect(createVisibleNavLinks([], () => false)).toEqual([]);
    expect(createVisibleNavLinks([
      { label: 'Hacker News', href: 'news', active: false },
    ], () => false)).toEqual([]);
  });

  it('adds supplemental navigation only when a source nav exists', () => {
    const sourceLinks: NavLink[] = [
      { label: 'Hacker News', href: 'news', active: false },
      { label: 'new', href: 'newest', active: false },
      { label: 'ask', href: 'ask', active: false },
      { label: 'submit', href: 'submit', active: false },
    ];

    const visibleLinks = createVisibleNavLinks(sourceLinks, href => href === 'best');

    expect(createPrimaryNavLinks(visibleLinks).map(link => link.label)).toEqual(['new', 'best', 'ask']);
    expect(visibleLinks.find(link => link.label === 'best')?.active).toBe(true);
    expect(createOverflowNavGroups(visibleLinks).map(group => group.label)).toEqual(['community', 'discovery']);
  });
});

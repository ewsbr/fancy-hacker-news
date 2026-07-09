import type { NavLink } from '@/parsers/header';

export interface HeaderLinkGroup {
  label: string;
  links: NavLink[];
}

export const primaryNavLabels = ['new', 'threads', 'past', 'best', 'ask'];

const communityOverflowLabels = new Set(['comments', 'jobs', 'whoishiring']);
const discoveryOverflowLabels = new Set([
  'show',
  'front',
  'pool',
  'active',
  'classic',
  'invited',
  'launches',
  'leaders',
  'lists',
  'bestcomments',
  'topcolors',
]);
const accountOverflowLabels = new Set(['favorites', 'hidden', 'upvoted', 'profile']);
const syntheticNavLinks = [
  { label: 'best', href: 'best' },
  { label: 'front', href: 'front' },
  { label: 'pool', href: 'pool' },
  { label: 'active', href: 'active' },
  { label: 'classic', href: 'classic' },
  { label: 'whoishiring', href: 'https://news.ycombinator.com/submitted?id=whoishiring' },
];

export function createVisibleNavLinks(sourceLinks: NavLink[], isCurrentHref: (href: string) => boolean): NavLink[] {
  const links = sourceLinks.filter(link => link.label.toLowerCase() !== 'hacker news');
  const labels = new Set(links.map(link => link.label.toLowerCase()));

  if (links.length === 0) {
    return [];
  }

  return syntheticNavLinks.reduce<NavLink[]>((visibleLinks, link) => {
    if (!labels.has(link.label)) {
      visibleLinks.push({
        ...link,
        active: isCurrentHref(link.href),
      });
    }

    return visibleLinks;
  }, [...links]);
}

export function createPrimaryNavLinks(visibleNavLinks: NavLink[]): NavLink[] {
  const linksByLabel = new Map(visibleNavLinks.map(link => [link.label.toLowerCase(), link]));

  return primaryNavLabels
    .map(label => linksByLabel.get(label))
    .filter(link => link !== undefined);
}

export function createOverflowNavGroups(visibleNavLinks: NavLink[]): HeaderLinkGroup[] {
  const reservedLabels = new Set([...primaryNavLabels, 'submit']);
  const links = visibleNavLinks.filter(link => !reservedLabels.has(link.label.toLowerCase()));
  const groups: HeaderLinkGroup[] = [
    { label: 'community', links: [] },
    { label: 'discovery', links: [] },
    { label: 'account', links: [] },
    { label: 'more', links: [] },
  ];

  for (const link of links) {
    const label = link.label.toLowerCase();

    if (communityOverflowLabels.has(label)) {
      groups[0].links.push(link);
    } else if (discoveryOverflowLabels.has(label)) {
      groups[1].links.push(link);
    } else if (accountOverflowLabels.has(label)) {
      groups[2].links.push(link);
    } else {
      groups[3].links.push(link);
    }
  }

  return groups.filter(group => group.links.length > 0);
}

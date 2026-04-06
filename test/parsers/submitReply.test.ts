import { describe, expect, it } from 'vitest';
import { parseReplyPage } from '@/parsers/reply';
import { parseSubmitPage } from '@/parsers/submit';
import { loadFixtureDocument } from '../helpers/loadFixture';

describe('submit and reply parsers', () => {
  it('parses the submit form fields and bookmarklet link', async () => {
    const doc = await loadFixtureDocument('submit.html');
    const page = parseSubmitPage(doc);

    expect(page.isLoggedOut).toBe(false);
    expect(page.form).toMatchObject({
      action: '/r',
      bookmarkletHref: 'bookmarklet.html',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'url', type: 'url' },
        { name: 'text', type: 'textarea' },
      ],
    });
  });

  it('parses reply-page parent context links and story context', async () => {
    const doc = await loadFixtureDocument('reply.html');
    const page = parseReplyPage(doc);

    expect(page.isLoggedOut).toBe(false);
    expect(page.parent).toMatchObject({
      author: 'jeremyjh',
      age: '3 minutes ago',
      ageLink: 'item?id=47538487',
      parentLink: 'item?id=47537374',
      contextLink: 'item?id=47536761#47538487',
      onStory: {
        title: 'Show HN: I put an AI agent on a $7/month VPS with ...',
        link: 'item?id=47536761',
      },
    });
    expect(page.replyForm).toMatchObject({
      action: 'comment',
      parentId: '47538487',
      gotoUrl: 'item?id=47536761#47538487',
    });
  });
});
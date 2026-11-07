import { parseAge } from './shared/age';
import { extractRichTextHtml } from './shared/body';
import { attrOf, hrefOf, textOf } from './shared/dom';
import { findUserLink } from './shared/user-link';

export interface ParsedReplyPage {
  parent: {
    author: string;
    age: string;
    ageLink: string;
    bodyHtml: string;
    contextLink: string | null;
    onStory: { title: string; link: string } | null;
  };
  replyForm: {
    action: string;
    hmac: string;
    parentId: string;
    gotoUrl: string;
  };
}

/** Returns null when HN shows a login prompt instead of the reply form. */
export function parseReplyPage(doc: Document): ParsedReplyPage | null {
  const fatitem = doc.querySelector('table.fatitem');
  if (!fatitem) {
    return null;
  }

  const parentTr = fatitem.querySelector('tr.athing');
  const comhead = parentTr?.querySelector('span.comhead');
  const age = parseAge(comhead?.querySelector('span.age'));
  const navs = comhead?.querySelector('span.navs');
  const onStoryLink = navs?.querySelector('span.onstory a');
  const contextLink = Array.from(navs?.querySelectorAll('a') ?? []).find(link => textOf(link) === 'context');
  const form = fatitem.querySelector('form[action="comment"]');
  const inputValue = (name: string) => attrOf(form?.querySelector(`input[name="${name}"]`), 'value') || '';

  return {
    parent: {
      author: textOf(findUserLink(comhead)),
      age: age.text,
      ageLink: age.link,
      bodyHtml: extractRichTextHtml(parentTr?.querySelector('div.commtext')),
      contextLink: hrefOf(contextLink) || null,
      onStory: onStoryLink ? { title: textOf(onStoryLink), link: hrefOf(onStoryLink) || '' } : null,
    },
    replyForm: {
      action: 'comment',
      hmac: inputValue('hmac'),
      parentId: inputValue('parent'),
      gotoUrl: inputValue('goto'),
    },
  };
}

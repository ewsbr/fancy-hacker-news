import { parseHtmlDocument } from './dom';

const fixtureFiles = import.meta.glob('../fixtures/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function getFixtureHtml(name: string): string {
  const fixturePath = `../fixtures/${name}`;
  const html = fixtureFiles[fixturePath];

  if (!html) {
    throw new Error(`Unknown fixture: ${name}`);
  }

  return html;
}

export async function loadFixtureHtml(name: string): Promise<string> {
  return getFixtureHtml(name);
}

export async function loadFixtureDocument(name: string): Promise<Document> {
  return parseHtmlDocument(getFixtureHtml(name));
}

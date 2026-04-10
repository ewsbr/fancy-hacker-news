import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

export async function loadFixtureDocument(name: string): Promise<Document> {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url);
  const html = await readFile(fixtureUrl, 'utf8');

  return new JSDOM(html).window.document;
}

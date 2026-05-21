import { JSDOM } from 'jsdom';

interface HtmlDocumentOptions {
  url?: string;
}

function createDomDocument(html: string, options: HtmlDocumentOptions = {}): Document {
  return new JSDOM(html, options).window.document;
}

export function parseHtmlDocument(html: string, options: HtmlDocumentOptions = {}): Document {
  return createDomDocument(html, options);
}

export function createHtmlDocument(html = '', options: HtmlDocumentOptions = {}): Document {
  const source = html || '<!doctype html><html><head></head><body></body></html>';

  return createDomDocument(source, options);
}

export function renderHtmlDocument(html: string, options: HtmlDocumentOptions = {}): Document {
  return createDomDocument(html, options);
}

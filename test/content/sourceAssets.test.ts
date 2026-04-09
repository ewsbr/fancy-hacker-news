import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { getLegacySourceAssetNodes } from '@/content/utils/sourceAssets';

describe('legacy source asset cleanup', () => {
  it('preserves extension-managed styles while removing host page assets', () => {
    const dom = new JSDOM(`
      <!doctype html>
      <html>
        <head>
          <style id="hn-anti-fouc"></style>
          <style id="fancy-hn-font-faces"></style>
          <style id="fancy-hn-hide-original"></style>
          <style id="legacy-style"></style>
          <script id="legacy-script"></script>
          <link id="legacy-link" rel="stylesheet" href="/news.css">
        </head>
        <body></body>
      </html>
    `);

    const sourceAssetIds = getLegacySourceAssetNodes(dom.window.document)
      .map(node => node.id)
      .sort();

    expect(sourceAssetIds).toEqual(['legacy-link', 'legacy-script', 'legacy-style']);
  });
});
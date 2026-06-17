import { describe, expect, it } from 'vitest';
import sourceManifest from '../../manifest.json';
import { makeTargetManifest } from '../../scripts/package-extension.mjs';

describe('package-extension target manifests', () => {
  it('keeps the Chrome package manifest compatible with Chrome 114', () => {
    const manifest = makeTargetManifest(sourceManifest, 'chrome');

    expect(manifest.browser_specific_settings).toBeUndefined();
    expect(manifest.background).toEqual({
      service_worker: 'dist/background/background.js',
    });
  });

  it('keeps the Firefox package manifest on background scripts', () => {
    const manifest = makeTargetManifest(sourceManifest, 'firefox');

    expect(manifest.browser_specific_settings).toEqual(sourceManifest.browser_specific_settings);
    expect(manifest.background).toEqual({
      scripts: ['dist/background/background.js'],
    });
  });

  it('does not mutate the shared source manifest', () => {
    makeTargetManifest(sourceManifest, 'chrome');
    makeTargetManifest(sourceManifest, 'firefox');

    expect(sourceManifest.background).toEqual({
      scripts: ['dist/background/background.js'],
      service_worker: 'dist/background/background.js',
    });
  });
});

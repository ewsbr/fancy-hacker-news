export type PackageTarget = 'chrome' | 'firefox';

export interface ExtensionManifest {
  manifest_version: number;
  name: string;
  version: string;
  background: {
    scripts?: string[];
    service_worker?: string;
  };
  browser_specific_settings?: unknown;
  [key: string]: unknown;
}

export function makeTargetManifest(manifest: ExtensionManifest, target: PackageTarget): ExtensionManifest;

import WebpackAssetsManifest, { Entry } from 'webpack-assets-manifest';
import * as path from 'node:path';
import * as fs from 'fs-extra';

export function manifestEntryFormatter({ key, value }: Entry): Entry | false {
  const base = (p: string) => path.basename(path.dirname(p));

  const src = base(key);
  const dst = base(value);

  if (src !== dst) {
    key = `${dst}/${key}`;
  }

  return { key, value };
}

export function manifestFileWriter(mfs: WebpackAssetsManifest): void {
  const tmpl = `
<?php
/**
 * Asset manifest file.
 *
 * Auto-generated via WordPack.
 *
 * @package eXtended WordPress
 * @subpackage Assets
 */

return array(
{{{entries}}}
);
`;
  const assets = Object.keys(mfs.assets);
  const length = findLongest(assets);
  const entries = assets.map((k) => parseEntry(k, mfs.assets[k], length));

  const content = tmpl.replace('{{{entries}}}', entries.join('\n'));

  fs.writeFileSync(mfs.getOutputPath().replace('.json', '.php'), content);
}

function findLongest(entries: string[]): number {
  return entries.reduce((l, k) => Math.max(l, k.length), 0);
}

function parseEntry(key: string, val: unknown, length: number): string {
  return `    '${key}'${' '.repeat(length - key.length)} => '${val}',`;
}

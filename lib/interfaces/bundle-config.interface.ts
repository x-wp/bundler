import type { Configuration } from 'webpack';

export interface BundleConfigInterface {
  name: string;
  files: string[];
  splitChunks?: boolean;
  chunkTest?: RegExp;
  chunkName?: string;
  chunkMinSize?: number;
  globalChunks?: string[];
  override?: Partial<Configuration>;
  color?: string;
}

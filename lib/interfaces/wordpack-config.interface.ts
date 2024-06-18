import { PathConfig } from '../config/dir.config';
import { BundleConfigInterface } from './bundle-config.interface';

export interface WordPackConfigInterface {
  paths?: Partial<PathConfig>;
  manifest?: string;
  filename?: string;
  bundles: BundleConfigInterface[];
  multimode?: boolean;
  externals?: Record<string, string>;

  sourceMaps?: string | false;
}

import { BundleConfigInterface } from './bundle-config.interface';

export interface WordPackConfigInterface {
  manifest?: string;
  filename?: string;
  bundles: BundleConfigInterface[];
  multimode?: boolean;
  externals?: Record<string, string>;
  srcBase?: string;
  distBase?: string;
  imageDir?: string;
  fontDir?: string;
  jsDir?: string;
  cssDir?: string;
  sourceMaps?: string | false;
}

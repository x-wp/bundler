import { Configuration, WebpackPluginInstance } from 'webpack';
import WebpackAssetsManifest, {
  Assets,
  Options,
} from 'webpack-assets-manifest';
import { manifestEntryFormatter } from '../functions/manifest-utils';
import merge from 'webpack-merge';
import { WordPackConfig } from '../config';

export class ManifestConfig {
  private static mfs: Configuration;
  private static asts: Assets;
  static build(cfg: WordPackConfig): Configuration {
    if (!cfg.manifest) {
      return {};
    }

    return merge({
      plugins: [
        this.getManifestPlugin({
          output: cfg.manifest,
        }),
      ],
    });
  }

  static getManifestPlugin(options: Options = {}): WebpackPluginInstance {
    this.asts ??= Object.create(null);

    const defs: Options = {
      output: 'assets.json',
      space: 2,
      merge: true,
      assets: this.asts,
      sortManifest: true,
      writeToDisk: false,
      customize: manifestEntryFormatter,
    };
    const opts: Options = { ...defs, ...options };

    return new WebpackAssetsManifest(opts);
  }
}

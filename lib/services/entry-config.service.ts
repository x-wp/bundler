import { Configuration } from 'webpack';
import { BundleConfig } from '..';
import { WordPackConfig } from '../config';
import merge from 'webpack-merge';
import WebpackBarPlugin from 'webpackbar';
import camelcase from 'camelcase';
import { Colorizer } from './colorizer.service';

export class EntryConfig {
  static build(cfg: WordPackConfig, bundle: BundleConfig): Configuration {
    return merge(this.getCoreConfig(bundle), this.getBarConfig(cfg, bundle));
  }

  private static getCoreConfig(bundle: BundleConfig): Configuration {
    return {
      name: bundle.name,
      entry: {
        [bundle.name]: bundle.files,
      },
      optimization: {
        moduleIds: 'deterministic',
      },
    };
  }

  private static getBarConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Configuration {
    return {
      plugins: [
        new WebpackBarPlugin({
          name: camelcase(bundle.name),
          fancy: !cfg.isCI,
          basic: cfg.isCI,
          color: bundle.color || Colorizer.stringToColor(bundle.name),
        }),
      ],
    };
  }
}

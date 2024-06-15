import { Configuration } from 'webpack';
import { WordPackConfig } from '../config';
import * as fs from 'fs-extra';
import CopyPlugin from 'copy-webpack-plugin';
import merge from 'webpack-merge';
import { OptimizeConfig } from './optimize-config.service';
import { ManifestConfig } from './manifest-config.service';
import { manifestFileWriter } from '../functions/manifest-utils';
import WebpackBarPlugin from 'webpackbar';

export class AssetConfig {
  static build(cfg: WordPackConfig): Partial<Configuration> {
    return merge(
      AssetConfig.getCoreConfig(cfg),
      AssetConfig.getManifestConfig(cfg),
      AssetConfig.getOptimizeConfig(cfg),
    );
  }

  private static getCoreConfig(cfg: WordPackConfig): Configuration {
    return {
      name: 'AssetCopy',
      context: cfg.resolve(cfg.srcDir),
      mode: cfg.mode,
      entry: {},
      output: {
        path: cfg.resolve(cfg.distRoot),
      },
      stats: false,
      plugins: [
        new CopyPlugin({
          patterns: [
            {
              from: `${cfg.images}/**/*`,
              to: `[path]${cfg.asset}[ext]`,
              force: false,
              noErrorOnMissing: true,
              filter: (rp) =>
                !fs.existsSync(rp.replace(cfg.srcDir, cfg.distRoot)),
            },
          ],
        }),
        new WebpackBarPlugin({
          fancy: !cfg.isCI,
          basic: cfg.isCI,
          name: 'AssetCopy',
        }),
      ],
      dependencies: cfg.bundles.map(({ name }) => name),
    };
  }

  private static getOptimizeConfig(cfg: WordPackConfig): Configuration {
    if (!cfg.prod) {
      return {};
    }

    return {
      optimization: {
        minimize: true,
        minimizer: OptimizeConfig.getImageMinimizers(),
      },
    };
  }
  private static getManifestConfig(cfg: WordPackConfig): Configuration {
    if (!cfg.prod || !cfg.manifest) {
      return {};
    }
    return {
      plugins: [
        ManifestConfig.getManifestPlugin({
          output: cfg.manifest,
          writeToDisk: true,
          done: manifestFileWriter,
        }),
      ],
    };
  }
}

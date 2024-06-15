import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import { WordPackConfig } from '../config';
import { OnlyFriendlyErrorsPlugin } from '../plugins';

export class SharedConfig {
  private static sharedCfg: Configuration;
  static build(cfg: WordPackConfig): Configuration {
    return (this.sharedCfg ??= merge(
      SharedConfig.getCoreConfig(cfg),
      SharedConfig.getWatchConfig(cfg),
      SharedConfig.getProdConfig(cfg),
    ));
  }
  private static getCoreConfig(cfg: WordPackConfig): Configuration {
    return {
      devtool: cfg.sourceMaps,
      context: cfg.resolve(cfg.srcDir),
      externals: cfg.externals,
      mode: 'development',
      target: 'browserslist',
      output: {
        path: cfg.resolve(cfg.distRoot),
        publicPath: '',
        filename: `${cfg.scripts}/[name].js`,
      },
      stats: false,
      optimization: {
        removeEmptyChunks: true,
      },
      plugins: [
        new OnlyFriendlyErrorsPlugin({
          clearConsole: false,
          compilationSuccessInfo: {
            messages: [],
            notes: [],
          },
        }),
      ],
    };
  }

  private static getWatchConfig(cfg: WordPackConfig): Configuration {
    if (!cfg.watch) {
      return {};
    }

    return {
      watch: true,
      watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 600,
        poll: 1000,
      },
    };
  }

  private static getProdConfig(cfg: WordPackConfig): Configuration {
    if (!cfg.prod) {
      return {};
    }

    return {
      devtool: false,
      mode: 'production',
      optimization: {
        minimize: true,
      },
    };
  }
}

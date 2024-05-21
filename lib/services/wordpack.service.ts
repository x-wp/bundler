import path from 'node:path';
import fs from 'fs-extra';
import {
  transformAndValidate,
  transformAndValidateSync,
} from 'class-transformer-validator';

import { WordPackConfig, WordPackEnv } from '../config';
import { WordPackConfigInterface, WordPackEnvInterface } from '../interfaces';
import { OnlyFriendlyErrorsPlugin } from '../plugins';

import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { Bundler } from './bundler.service';

export class WordPack {
  private readonly env: WordPackEnv;

  constructor(env: WordPackEnvInterface) {
    this.env = transformAndValidateSync(WordPackEnv, env, {
      transformer: {
        excludeExtraneousValues: true,
      },
    });
  }

  private async getUserConfig(): Promise<WordPackConfig> {
    const config = await transformAndValidate(
      WordPackConfig,
      await this.loadConfigFile(),
    );

    if (this.env.production) {
      config.sourceMaps = false;
    }

    return config;
  }

  async loadConfigFile(): Promise<WordPackConfigInterface> {
    const file = 'wpwp.config.ts';
    const paths = ['', 'assets', 'assets/build'];

    const path = paths.find((p) => fs.existsSync(this.resolve(p, file)));

    if (!path) {
      throw new Error('Config file not found');
    }

    return (await import(this.resolve(path, file))).default;
  }

  async buildConfig(): Promise<Configuration[]> {
    const userConfig = await this.getUserConfig();
    const bundler = new Bundler(this.env, userConfig);

    const sharedConfig = this.buildSharedConfig(userConfig);

    const bundleConfig = userConfig.multimode
      ? userConfig.bundles.map((bundle) =>
          merge(sharedConfig, bundler.multiModeConfig(bundle)),
        )
      : [merge(sharedConfig, bundler.singleModeConfig(userConfig.bundles))];

    this.cleanDist(userConfig.distRoot);

    return [
      ...bundleConfig,
      bundler.createAssetConfig(bundleConfig.map((b) => b.name as string)),
    ];
  }

  private cleanDist(distRoot: string): void {
    fs.emptyDirSync(this.resolve(distRoot));
  }

  private resolve(...paths: string[]): string {
    return path.resolve(this.env.basePath, ...paths);
  }

  private buildSharedConfig(
    bc: Omit<WordPackConfig, 'bundles'>,
  ): Partial<Configuration> {
    const config: Partial<Configuration> = {
      devtool: bc.sourceMaps,
      context: this.resolve(bc.assetRoot),
      externals: bc.externals,
      mode: 'development',
      output: {
        path: this.resolve(bc.distRoot),
        publicPath: '',
        filename: `${bc.scripts}/[name].js`,
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

    return merge(config, this.getAdditionalConfig(), bc.override);
  }

  private getAdditionalConfig(): Partial<Configuration> {
    if (this.env.watch) {
      return {
        watch: true,
        watchOptions: {
          ignored: /node_modules/,
          aggregateTimeout: 600,
          poll: 1000,
        },
      };
    }

    if (this.env.production) {
      return {
        devtool: false,
        mode: 'production',
        optimization: {
          minimize: true,
        },
      };
    }

    return {};
  }
}

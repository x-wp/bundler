import path from 'node:path';
import fs from 'fs-extra';

import { Configuration, EntryObject, WebpackPluginInstance } from 'webpack';
import { BundleConfig, WordPackEnv, WordPackConfig } from '../config';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssUrlRelativePlugin from 'css-url-relative-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import merge from 'webpack-merge';
import WebpackRemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';
import camelcase from 'camelcase';
import WebpackBarPlugin from 'webpackbar';
import { Colorizer } from './colorizer.service';
import CopyPlugin from 'copy-webpack-plugin';
import {
  SharpOptions,
  SvgoOptions,
} from 'image-minimizer-webpack-plugin/types/utils';

declare type ExtendedBundle = BundleConfig & { entry?: EntryObject };

export class Bundler {
  private readonly styleConfig: Partial<Configuration>;
  private readonly scriptConfig: Partial<Configuration>;
  private readonly colorizer: Colorizer;

  constructor(
    private readonly env: WordPackEnv,
    private readonly cnf: WordPackConfig,
  ) {
    this.colorizer = new Colorizer('000');
    this.scriptConfig = this.createScriptConfig(this.cnf, this.env.production);
    this.styleConfig = this.createStyleConfig(this.cnf, this.env.production);
  }

  private resolve(...paths: string[]): string {
    return path.resolve(this.env.basePath, ...paths);
  }

  private createScriptConfig(
    { assetRoot, scripts }: WordPackConfig,
    isProd: boolean,
  ): Partial<Configuration> {
    const sc: Configuration = {
      module: {
        rules: [
          {
            test: /\.ts$/,
            include: [this.resolve(assetRoot, scripts)],
            exclude: [/node_modules(?![/|\\](bootstrap|foundation-sites))/],
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'entry',
                      corejs: '3.37',
                    },
                  ],
                  [
                    '@babel/preset-typescript',
                    {
                      onlyRemoveTypeImports: true,
                    },
                  ],
                ],
                plugins: ['@babel/plugin-transform-class-properties'],
              },
            },
          },
        ],
      },
      resolve: {
        extensions: ['.ts', '.js'],
      },
    };

    if (!isProd) {
      return sc;
    }

    sc.optimization = {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    };

    return sc;
  }

  private createStyleConfig(
    { assetRoot, styles, images, fonts }: WordPackConfig,
    isProd: boolean,
  ): Partial<Configuration> {
    const sc: Configuration = {
      module: {
        rules: [
          {
            test: /\.s?css$/i,
            include: this.resolve(assetRoot, styles),
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 3,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: ['postcss-preset-env'],
                  },
                },
              },
              {
                loader: 'resolve-url-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  implementation: 'sass',
                  sourceMap: true,
                },
              },
            ],
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif|ico|avif)$/i,
            type: 'asset/resource',
            include: this.resolve(assetRoot, images),
            generator: {
              filename: `${images}/[name][ext]`,
            },
          },
          {
            test: /\.(ttf|otf|eot|woff2?)$/,
            type: 'asset/resource',
            include: this.resolve(assetRoot, fonts),
            generator: {
              filename: `${fonts}/[name][ext]`,
            },
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: `${styles}/[name].css`,
        }),
        new CssUrlRelativePlugin(),
      ],
      resolve: {
        extensions: ['.scss', '.css'],
      },
    };

    if (!isProd) {
      return sc;
    }

    const prodConfig = {
      optimization: {
        minimizer: [new CssMinimizerPlugin(), ...this.getImageMinimizers()],
      },
    };

    return merge(sc, prodConfig);
  }

  private getImageMinimizers(): WebpackPluginInstance[] {
    return [
      new ImageMinimizerPlugin<SharpOptions>({
        exclude: /\.svg$/,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: {
                quality: 100,
              },
              webp: {
                lossless: true,
              },
              avif: {
                lossless: true,
              },
              png: {},
              gif: {},
            },
          },
        },
      }),
      new ImageMinimizerPlugin<SvgoOptions>({
        include: /\.svg$/,
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            encodeOptions: {
              multipass: true,
              plugins: ['preset-default'],
            },
          },
        },
      }),
    ];
  }

  private hasScripts(files: string[]): boolean {
    return files.some((file) => file.endsWith('ts'));
  }

  private hasStyles(files: string[]): boolean {
    return files.some((file) => file.endsWith('css'));
  }

  private createChunkConfig(bundle: BundleConfig): Configuration {
    return {
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: bundle.chunkMinSize || 0,
          cacheGroups: {
            vendor: {
              name: bundle.chunkName,
              test: bundle.chunkTest,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
      },
    };
  }

  singleModeConfig(bundles: BundleConfig[]): Configuration {
    const config = {
      name: 'App',
      entry: bundles.reduce(
        (acc, b) => ({
          ...acc,
          [b.name]: b.files,
        }),
        {},
      ),
      files: bundles.reduce((acc, b) => acc.concat(b.files), [] as string[]),
      chunkTest: /[\\/]node_modules[\\/]/,
      chunkName: 'vendor-app',
      splitChunks: true,
      chunkMinSize: 0,
      override: {},
    };

    return this.multiModeConfig(config);
  }

  multiModeConfig(bundle: ExtendedBundle): Configuration {
    let config: Configuration = {
      name: bundle.name,
      entry: bundle?.entry || {
        [bundle.name]: bundle.files,
      },
    };

    if (bundle.splitChunks) {
      config = merge(config, this.createChunkConfig(bundle));
    }

    if (this.hasScripts(bundle.files)) {
      config = merge(config, this.scriptConfig);
    }

    if (this.hasStyles(bundle.files)) {
      config = merge(config, this.styleConfig);
    }

    if (this.hasStyles(bundle.files) && !this.hasScripts(bundle.files)) {
      config = merge(config, {
        plugins: [new WebpackRemoveEmptyScriptsPlugin()],
      });
    }

    const isCI = process.env?.CI !== undefined;

    config = merge(config, {
      plugins: [
        new WebpackBarPlugin({
          name: camelcase(bundle.name),
          fancy: !isCI,
          basic: isCI,
          color: bundle.color || this.colorizer.stringToColor(bundle.name),
        }),
      ],
    });

    return config;
  }

  createAssetConfig(deps: string[]): Configuration {
    const config: Configuration = {
      name: 'AssetCopy',
      context: this.resolve(this.cnf.assetRoot),
      mode: this.env.production ? 'production' : 'development',
      entry: {},
      output: {
        path: this.resolve(this.cnf.distRoot),
      },
      stats: false,
      plugins: [
        new CopyPlugin({
          patterns: [
            {
              from: `${this.cnf.images}/**/*`,
              to: '[path][name][ext]',
              force: false,
              noErrorOnMissing: true,
              filter: (rp) =>
                !fs.existsSync(
                  rp.replace(this.cnf.assetRoot, this.cnf.distRoot),
                ),
            },
          ],
        }),
      ],
      dependencies: deps,
    };

    return !this.env.production
      ? config
      : merge(config, {
          optimization: {
            minimize: true,
            minimizer: this.getImageMinimizers(),
          },
        });
  }
}

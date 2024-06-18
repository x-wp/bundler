import { AssetInfo, Configuration, PathData } from 'webpack';
import merge from 'webpack-merge';
import { BundleConfig, WordPackConfig } from '../config';
import WebpackRemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssUrlRelativePlugin from 'css-url-relative-plugin';

export class CompileConfig {
  static build(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Partial<Configuration> {
    return merge(
      this.getJsConfig(cfg, bundle),
      this.getCssConfig(cfg, bundle),
      this.getNoScriptConfig(bundle),
    );
  }

  private static getJsConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Configuration {
    if (!bundle.hasScripts()) {
      return {};
    }

    return {
      module: {
        rules: [
          {
            test: /(\.[tj]sx?)$/,
            include: [cfg.path('src', 'scripts')],
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
        extensions: ['jsx', '.tsx', '.ts', '.js'],
      },
    };
  }

  private static getCssConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Configuration {
    if (!bundle.hasStyles()) {
      return {};
    }

    return {
      // output: {
      // cssFilename: `${cfg.styles('dist')}/${bundle.name}/${cfg.asset}.css`,
      // },
      module: {
        rules: [
          {
            test: /\.(sa|sc|c)ss$/i,
            include: cfg.path('src', 'styles'),
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: ['postcss-preset-env'],
                  },
                  sourceMap: true,
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
            generator: {
              filename: `${cfg.images('dist')}/[name][ext]`,
            },
          },
          {
            test: /\.(ttf|otf|eot|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: `${cfg.fonts('dist')}/[name][ext]`,
            },
          },
        ],
      },
      resolve: {
        extensions: ['.scss', '.css'],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: ({ chunk }: PathData) =>
            this.cssName(chunk?.id?.toString(), bundle, cfg, '[id]'),
        }),
        new CssUrlRelativePlugin(),
      ],
    };
  }

  private static getNoScriptConfig(bundle: BundleConfig): Configuration {
    if (bundle.hasScripts() && !bundle.hasStyles()) {
      return {};
    }

    return {
      plugins: [new WebpackRemoveEmptyScriptsPlugin()],
    };
  }

  static cssName(
    chunkId: string | undefined,
    { name, entry }: BundleConfig,
    cfg: WordPackConfig,
    fname: string = '[name]',
  ): string {
    const dir = Object.keys(entry).includes(chunkId || '') ? name : 'vendor';

    return `${cfg.styles('dist')}/${dir}/${fname}.css`;
  }
}

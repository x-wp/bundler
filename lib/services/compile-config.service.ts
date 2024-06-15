import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import { BundleConfig, WordPackConfig } from '../config';
import WebpackRemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssUrlRelativePlugin from 'css-url-relative-plugin';

export class CompileConfig {
  private static scriptConfig: Partial<Configuration>;
  private static styleConfig: Partial<Configuration>;

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

    return (this.scriptConfig ??= {
      output: {
        filename: `${cfg.scripts}/${cfg.asset}.js`,
      },
      module: {
        rules: [
          {
            test: /(\.[tj]sx?)$/,
            include: [cfg.resolve(cfg.srcDir, cfg.scripts)],
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
    });
  }

  private static getCssConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Configuration {
    if (!bundle.hasStyles()) {
      return {};
    }

    return (this.styleConfig ??= {
      module: {
        rules: [
          {
            test: /\.s?css$/i,
            include: cfg.resolve(cfg.srcDir, cfg.styles),
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 3,
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
            generator: {
              filename: `${cfg.styles}/${cfg.asset}.css`,
            },
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif|ico|avif)$/i,
            type: 'asset/resource',
            generator: {
              filename: `${cfg.images}/${cfg.asset}[ext]`,
            },
          },
          {
            test: /\.(ttf|otf|eot|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: `${cfg.fonts}/${cfg.asset}[ext]`,
            },
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: `${cfg.styles}/${cfg.asset}.css`,
        }),
        new CssUrlRelativePlugin(),
      ],
      resolve: {
        extensions: ['.scss', '.css'],
      },
    });
  }

  private static getNoScriptConfig(bundle: BundleConfig): Configuration {
    if (bundle.hasScripts() && !bundle.hasStyles()) {
      return {};
    }

    return {
      plugins: [new WebpackRemoveEmptyScriptsPlugin()],
    };
  }
}

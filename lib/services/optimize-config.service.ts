import { Configuration, WebpackPluginInstance } from 'webpack';
import { BundleConfig, WordPackConfig } from '../config';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import {
  SharpOptions,
  SvgoOptions,
} from 'image-minimizer-webpack-plugin/types/utils';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import merge from 'webpack-merge';

export class OptimizeConfig {
  private static imageMin: WebpackPluginInstance[];
  private static cssMin: WebpackPluginInstance[];
  private static jsMin: WebpackPluginInstance[];

  static build(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Partial<Configuration> {
    return merge(
      this.getChunkConfig(cfg, bundle),
      this.getStyleConfig(cfg, bundle),
      this.getScriptConfig(cfg, bundle),
    );
  }

  private static getChunkConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Partial<Configuration> {
    if (cfg.watch || !bundle.splitChunks) {
      return {};
    }

    return {
      optimization: {
        splitChunks: {
          chunks: 'initial',
          hidePathInfo: true,
          cacheGroups: {
            awn: {
              priority: -30,
              reuseExistingChunk: true,
              minChunks: 1,
              chunks: 'initial',
              name: 'awesome-notifications',
              test: /[\\/]node_modules[\\/]awesome-notifications[\\/]/,
              minSize: 0,
            },
            common: {
              priority: -40,
              reuseExistingChunk: true,
              chunks: 'initial',
              name: bundle.chunkName,
              test: bundle.chunkTest,
              minSize: 0,
            },
            default: {
              minChunks: 2,
              priority: -50,
              reuseExistingChunk: true,
            },
            defaultVendors: false,
          },
        },
      },
    };
  }

  private static getStyleConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Partial<Configuration> {
    if (!cfg.prod || !bundle.hasStyles()) {
      return {};
    }

    return {
      optimization: {
        minimize: true,
        minimizer: [...this.getCssMinimizers(), ...this.getImageMinimizers()],
      },
    };
  }

  private static getScriptConfig(
    cfg: WordPackConfig,
    bundle: BundleConfig,
  ): Partial<Configuration> {
    if (!cfg.prod || !bundle.hasScripts()) {
      return {};
    }

    return {
      optimization: {
        minimize: true,
        minimizer: [...this.getJsMinimizers()],
      },
    };
  }

  static getJsMinimizers(): WebpackPluginInstance[] {
    return (this.jsMin ??= [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: true,
          },
        },
      }),
    ]);
  }

  static getCssMinimizers(): WebpackPluginInstance[] {
    return (this.cssMin ??= [new CssMinimizerPlugin()]);
  }

  static getImageMinimizers(): WebpackPluginInstance[] {
    return (this.imageMin ??= [
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
    ]);
  }
}

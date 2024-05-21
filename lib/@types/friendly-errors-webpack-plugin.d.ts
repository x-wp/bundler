declare module '@soda/friendly-errors-webpack-plugin' {
  import { Plugin, WebpackPluginInstance } from 'webpack';

  declare interface FriendlyErrorsWebpackPluginOptions {
    // Add the options here based on the plugin's documentation
    clearConsole?: boolean;
    compilationSuccessInfo?: {
      messages?: string[];
      notes?: string[];
    };
    onErrors?: (severity: string, errors: any) => void;
    // Include any other options you need
  }

  declare class FriendlyErrorsWebpackPlugin
    extends Plugin
    implements WebpackPluginInstance
  {
    constructor(options?: FriendlyErrorsWebpackPluginOptions);
    apply(compiler: Compiler): void;
    displaySuccess(stats: any): void;
  }

  export = FriendlyErrorsWebpackPlugin;
}

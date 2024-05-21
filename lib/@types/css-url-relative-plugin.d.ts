declare module 'css-url-relative-plugin' {
  import { Plugin, WebpackPluginInstance } from 'webpack';

  declare interface CssUrlRelativePluginOptions {
    root?: string;
  }

  declare class CssUrlRelativePlugin
    extends Plugin
    implements WebpackPluginInstance
  {
    constructor(options?: CssUrlRelativePluginOptions);
    apply(compiler: Compiler): void;
  }

  export = CssUrlRelativePlugin;
}

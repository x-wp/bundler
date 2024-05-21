import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin';
import { Compiler } from 'webpack';

export class OnlyFriendlyErrorsPlugin extends FriendlyErrorsWebpackPlugin {
  constructor(options?: any) {
    super(options);
  }

  apply(compiler: Compiler): void {
    super.apply(compiler);
  }
  displaySuccess(stats: any): void {
    //noop
  }
}

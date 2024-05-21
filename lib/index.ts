import 'reflect-metadata';
import { WordPackConfigInterface, BundleConfigInterface } from './interfaces';
import { buildConfig } from './functions';

export {
  WordPackConfigInterface as WordPackConfig,
  BundleConfigInterface as BundleConfig,
};
export default buildConfig;

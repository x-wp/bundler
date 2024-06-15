import { WordPackConfig } from '../lib';

const config: WordPackConfig = {
  bundles: [
    {
      name: 'advanced',
      files: ['./styles/advanced.scss', './scripts/advanced.ts'],
      splitChunks: true,
    },
    {
      name: 'basic',
      files: ['./styles/basic.scss', './scripts/basic.ts'],
      color: '#F68221',
    },
    {
      name: 'css-only',
      files: ['./styles/css-only.scss'],
      // splitChunks: true,
    },
    {
      name: 'js-only',
      files: ['./scripts/js-only.ts'],
      splitChunks: true,
    },
  ],
  sourceMaps: false,
};

export default config;

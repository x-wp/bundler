import { WordPackConfig } from '../lib';

const config: WordPackConfig = {
  bundles: [
    {
      name: 'admin',
      files: ['./styles/admin/metabox.scss', './styles/admin/list-page.scss', './scripts/admin/list-page.ts', './styles/admin/cte.scss'],
      splitChunks: true,
      chunkMinSize: 100,
    },
    // {
    //   name: 'frontend',
    //   files: ['./styles/frontend/core.scss', './scripts/frontend/basic.ts'],
    // }
    // {
    //   name: 'advanced',
    //   files: ['./styles/advanced.scss', './scripts/advanced.ts'],
    //   splitChunks: true,
    // },
    // {
    //   name: "test-split",
    //   files: ['./scripts/test2.ts'],
    // }
    // {
    //   name: 'basic',
    //   files: ['./styles/basic.scss', './scripts/basic.ts'],
    //   color: '#F68221',
    // },
    // {
    //   name: 'css-only',
    //   files: ['./styles/css-only.scss'],
    //   // splitChunks: true,
    // },
    // {
    //   name: 'js-only',
    //   files: ['./scripts/js-only.ts'],
    //   splitChunks: true,
    // },
  ],
  paths: {
    scripts: {src: 'scripts', dist: 'js'},
    styles: { src: 'styles', dist: 'css' },
  },
  sourceMaps: false,

};

export default config;

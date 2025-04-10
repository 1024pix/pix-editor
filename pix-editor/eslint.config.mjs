import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import babelParser from '@babel/eslint-parser';
import emberParser from 'ember-eslint-parser';
import emberRecommendedConfig from 'eslint-plugin-ember/configs/recommended';
import emberGjsRecommendedConfig from 'eslint-plugin-ember/configs/recommended-gjs';
import n from 'eslint-plugin-n';
import qunitRecommendedConfig from 'eslint-plugin-qunit/configs/recommended';
import globals from 'globals';

const unconventionalJsFiles = ['blueprints/**/files/*', 'app/vendor/*'];
const compiledOutputFiles = ['dist/*', 'tmp/*'];
const dependenciesFiles = ['bower_components/*', 'node_modules/*'];
const miscFiles = ['coverage/*', '!**/.*', '**/.eslintcache'];
const emberTryFiles = ['.node_modules.ember-try/*', 'bower.json.ember-try', 'package.json.ember-try'];

const nodeFiles = [
  'eslint.config.cjs',
  '.template-lintrc.js',
  'ember-cli-build.js',
  'testem.js',
  'blueprints/*/index.js',
  'config/**/*.js',
  'lib/*/index.js',
  'playwright.config.js',
  'scripts/*.js',
  'server/**/*.js',
  'tests/e2e/**/*.js',
];

export default [
  ...pixRecommendedConfig,
  ...emberRecommendedConfig,
  ...emberGjsRecommendedConfig,
  qunitRecommendedConfig,
  {
    ignores: [...unconventionalJsFiles, ...compiledOutputFiles, ...dependenciesFiles, ...miscFiles, ...emberTryFiles],
  },
  {
    ignores: ['**/*.yaml'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: babelParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        requireConfigFile: false,

        babelOptions: {
          plugins: [
            [
              '@babel/plugin-proposal-decorators',
              {
                version: 'legacy',
              },
            ],
          ],
        },
      },
    },

    rules: {
      'no-setter-return': 'off',

      'ember/no-controller-access-in-routes': [
        'error',
        {
          allowControllerFor: true,
        },
      ],

      'qunit/require-expect': ['error', 'except-simple'],
      'ember/template-no-let-reference': 'off',
    },
  },
  {
    files: ['**/*.gjs'],
    languageOptions: {
      parser: emberParser,
      sourceType: 'module',
    },
  },
  {
    ...n.configs['flat/recommended'],
    files: nodeFiles,

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 5,
      sourceType: 'script',
    },
  },
];

import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import babelParser from '@babel/eslint-parser';
import emberRecommendedConfig from 'eslint-plugin-ember/configs/recommended';
import emberGjsRecommendedConfig from 'eslint-plugin-ember/configs/recommended-gjs';
import { parser as emberParser } from 'eslint-plugin-ember/recommended';
import nRecommendedConfig from 'eslint-plugin-n';
import prettierRecommendedConfig from 'eslint-plugin-prettier/recommended';
import qunitRecommendedConfig from 'eslint-plugin-qunit/configs/recommended';
import globals from 'globals';

const unconventionalJsFiles = ['blueprints/**/files/*', 'app/vendor/*'];
const compiledOutputFiles = ['dist/*', 'playwright-report/*', 'test-results/*', 'tmp/*'];
const dependenciesFiles = ['node_modules/*'];
const miscFiles = ['coverage/*', '!**/.*', '**/.eslintcache', 'external/*'];
const emberTryFiles = ['.node_modules.ember-try/*', 'bower.json.ember-try', 'package.json.ember-try'];

const nodeFiles = [
  'vite.config.mjs',
  'babel.config.cjs',
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

const ignoreYamlFiles = (configs) =>
  configs.map((config) => ({ ...config, ignores: [...(config.ignores || []), '**/*.yaml'] }));

export default [
  ...pixRecommendedConfig,
  ...ignoreYamlFiles(emberRecommendedConfig),
  ...ignoreYamlFiles(emberGjsRecommendedConfig),
  qunitRecommendedConfig,
  prettierRecommendedConfig,
  { ignores: [...unconventionalJsFiles, ...compiledOutputFiles, ...dependenciesFiles, ...miscFiles, ...emberTryFiles] },
  {
    ignores: ['**/*.yaml'],
    languageOptions: {
      globals: { ...globals.browser },

      parser: babelParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          configFile: false,
          babelrc: false,
          plugins: [['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]],
        },
      },
    },

    rules: {
      'no-setter-return': 'off',
      'ember/no-controller-access-in-routes': ['error', { allowControllerFor: true }],

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
    files: ['tests/**/*.js', 'tests/**/*.gjs'],

    languageOptions: {
      globals: {
        ...globals.embertest,
        server: false,
      },
    },
  },
  {
    ...nRecommendedConfig.configs['flat/recommended'],
    files: nodeFiles,

    languageOptions: {
      globals: { ...globals.node },

      ecmaVersion: 5,
      sourceType: 'script',
    },
    rules: {
      'n/no-extraneous-import': [
        'error',
        {
          allowModules: ['eslint-plugin-i18n-json'],
        },
      ],
    },
  },
];

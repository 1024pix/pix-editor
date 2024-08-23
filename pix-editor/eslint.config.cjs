const emberRecommendedConfig = require('eslint-plugin-ember/configs/recommended');
const qunitRecommendedConfig = require('eslint-plugin-qunit/configs/recommended');
const pixRecommendedConfig = require('@1024pix/eslint-plugin/config');
const n = require('eslint-plugin-n');
const globals = require('globals');
const babelParser = require('@babel/eslint-parser');

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

module.exports = [
  ...pixRecommendedConfig,
  ...emberRecommendedConfig,
  qunitRecommendedConfig,
  {
    ignores: [...unconventionalJsFiles, ...compiledOutputFiles, ...dependenciesFiles, ...miscFiles, ...emberTryFiles],
  },
  {
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
      'ember/no-jquery': 'error',

      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
        },
      ],

      'keyword-spacing': 'error',
      quotes: ['error', 'single'],
      'space-in-parens': 'error',
      'space-before-blocks': 'error',
      'prefer-const': 'error',
      semi: 'error',
      'no-setter-return': 'off',
      'space-infix-ops': 'error',
      'object-curly-spacing': ['error', 'always'],

      'ember/no-controller-access-in-routes': [
        'error',
        {
          allowControllerFor: true,
        },
      ],

      'qunit/require-expect': ['error', 'except-simple'],
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

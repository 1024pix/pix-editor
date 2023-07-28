'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2018,
    sourceType: 'module',
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
      ],
    },
  },
  plugins: [
    'ember',
    'qunit',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
  ],
  env: {
    browser: true
  },
  rules: {
    'no-console':'off',
    'ember/no-jquery': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'keyword-spacing': 'error',
    'quotes': ['error', 'single'],
    'space-in-parens':'error',
    'space-before-blocks':'error',
    'prefer-const':'error',
    'semi':'error',
    'no-setter-return': 'off',
    'space-infix-ops':'error',
    'object-curly-spacing':['error', 'always'],
    'ember/no-controller-access-in-routes': ['error', { 'allowControllerFor': true }],
    'qunit/require-expect': ['error', 'except-simple'],
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'playwright.config.js',
        'scripts/*.js',
        'server/**/*.js',
        'tests/e2e/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      extends: ['plugin:n/recommended'],
    }
  ]
};

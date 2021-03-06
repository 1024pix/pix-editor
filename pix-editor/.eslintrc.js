'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
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
        'scripts/*.js',
        'server/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off'
      }
    }
  ]
};

import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default [
  stylistic.configs.customize({
    'jsx': false,
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'object-curly-spacing': ['error', 'always'],
    'quote-props': ['error', 'as-needed'],
    'quotes': 'single',
    'semi': true,
    'space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'ignore' }],
    'space-infix-ops': ['error'],
  }),
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/array-bracket-newline': ['error', { multiline: true }],
      '@stylistic/array-element-newline': ['error', { multiline: true, minItems: 3 }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/curly-newline': ['error', { consistent: true, ClassBody: { minElements: 1 } }],
      '@stylistic/object-curly-newline': ['error', { multiline: true }],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/switch-colon-spacing': ['error', { after: true, before: false }],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: { parserOpts: { plugins: ['importAssertions'] } },
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '_',
          varsIgnorePattern: '_',
        },
      ],
      'no-var': ['error'],
      'prefer-const': ['error'],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'NewExpression[callee.name=Date][arguments.length=1][arguments.0.type=Literal]:not([arguments.0.value=/^[12][0-9]{3}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z)?$/])',
          message: 'Use only ISO8601 UTC syntax (\'2019-03-12T01:02:03Z\') in Date constructor',
        },
      ],
    },
  },
  {
    files: ['**/*.test.js'],
    rules: {
      'mocha/no-identical-title': 'error',
      'mocha/no-exclusive-tests': 'error',
    },
  },
];

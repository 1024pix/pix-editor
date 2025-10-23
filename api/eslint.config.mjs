import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import babelParser from '@babel/eslint-parser';

export default [
  {
    ignores: ['.adminjs/*', '.idea/*', 'docs/*'],
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ['importAssertions'],
          },
        },
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
          message:
            "Use only ISO8601 UTC syntax ('2019-03-12T01:02:03Z') in Date constructor",
        },
      ],
    },
  },
  {
    ...mocha.configs.recommended,
    files: ['tests/**/*.js'],
    rules: {
      ...mocha.configs.recommended.rules,
      'mocha/no-identical-title': 'error',
      'mocha/no-exclusive-tests': 'error',
    },
  },
];

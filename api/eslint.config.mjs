import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import stylistic from '@stylistic/eslint-plugin';

export default [
  stylistic.configs.customize({
    jsx: false,
    semi: true,
  }),
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/array-bracket-newline': ['error', { multiline: true }],
      '@stylistic/array-element-newline': ['error', { multiline: true, minItems: 3 }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/curly-newline': ['error', { consistent: true, ClassBody: { minElements: 1 } }],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      '@stylistic/object-curly-newline': ['error', { multiline: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/quotes': [
        'error',
        'single',
        { avoidEscape: true },
      ],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'ignore' }],
      '@stylistic/space-infix-ops': ['error'],
      '@stylistic/switch-colon-spacing': ['error', { after: true, before: false }],
    },
  },
  {
    ignores: [
      '.adminjs/*',
      '.idea/*',
      'docs/*',
    ],
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
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
    ...mocha.configs.recommended,
    files: ['tests/**/*.js'],
    rules: {
      ...mocha.configs.recommended.rules,
      'mocha/no-identical-title': 'error',
      'mocha/no-exclusive-tests': 'error',
    },
  },
];

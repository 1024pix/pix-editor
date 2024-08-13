module.exports = {
  root: true,
  plugins: ['mocha'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    mocha: true,
    node: true,
    es6: true,
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'computed-property-spacing': ['error', 'never'],
    'eol-last': ['error'],
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'keyword-spacing': ['error'],
    'linebreak-style': ['error', 'unix'],
    'mocha/no-exclusive-tests': ['error'],
    'mocha/no-identical-title': ['error'],
    'mocha/no-skipped-tests': ['warn'],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 1,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '_',
        varsIgnorePattern: '_',
      },
    ],
    'no-var': ['error'],
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': ['error'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'space-before-blocks': ['error'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'ignore',
      },
    ],
    'space-in-parens': ['error'],
    'space-infix-ops': ['error'],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'NewExpression[callee.name=Date][arguments.length=1][arguments.0.type=Literal]:not([arguments.0.value=/^[12][0-9]{3}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z)?$/])',
        message: "Use only ISO8601 UTC syntax ('2019-03-12T01:02:03Z') in Date constructor",
      },
    ],
  },
};

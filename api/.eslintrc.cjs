module.exports = {
  extends: ['../.eslintrc.cjs'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['importAssertions'], // TODO: migrate to 'importAttributes'
      },
    },
  },
};

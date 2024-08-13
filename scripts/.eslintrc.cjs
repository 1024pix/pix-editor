module.exports = {
  extends: ['../.eslintrc.cjs', 'plugin:mocha/recommended'],
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['importAssertions'], // TODO: migrate to 'importAttributes'
      },
    },
  },
  env: {
    mocha: true,
  },
};

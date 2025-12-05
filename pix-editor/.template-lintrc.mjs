export default {
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  plugins: ['ember-template-lint-plugin-prettier'],
  rules: {
    'no-invalid-interactive': false,
    'no-inline-styles': false,
    'style-concatenation': false,
    'no-potential-path-strings': false,
    'link-rel-noopener': false,
  },
  overrides: [
    {
      files: ['**/*.gjs'],
      rules: { prettier: 'off' },
    },
  ],
};

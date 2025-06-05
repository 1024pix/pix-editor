import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  'workflow': [
    {
      'handler': 'silence',
      'matchId': 'ember-data:deprecate-legacy-imports',
    },
    {
      'handler': 'silence',
      'matchId': 'template-action',
    },
    {
      'handler': 'silence',
      'matchId': 'ember-data:deprecate-non-strict-types',
    },
    {
      'handler': 'silence',
      'matchId': 'ember-data:deprecate-relationship-remote-update-clearing-local-state',
    },
  ],
});

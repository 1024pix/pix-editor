import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  'workflow': [
    {
      'handler': 'warn', // this deprecation is only on EmberTable package
      'matchId': 'template-action',
    },
  ],
});

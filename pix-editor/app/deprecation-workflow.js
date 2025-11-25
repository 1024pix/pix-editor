import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    {
      handler: 'error', // this deprecation is only on EmberTable package
      matchId: 'template-action',
    },
  ],
});

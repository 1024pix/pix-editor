self.deprecationWorkflow = self.deprecationWorkflow || {}; /* eslint-disable-line no-undef */
self.deprecationWorkflow.config = { /* eslint-disable-line no-undef */
  throwOnUnhandled: true,
  workflow: [
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-for' },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-since' },
    { handler: 'silence', matchId: 'ember-component.send-action' },
    { handler: 'silence', matchId: 'ember-data:model.toJSON' },
  ]
};

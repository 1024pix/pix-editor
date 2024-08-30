import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | sidebar/search', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:sidebar/search');
  });

  module('#searchSkillsByName', function() {
    test('it should escape skill name', function(assert) {
    // given
      const queryStub = sinon.stub().resolves([]);

      component.store = { query: queryStub };

      // when
      component.searchSkillsByName('\\\'"\t coucou \\\'"\t');

      // then
      assert.ok(queryStub.calledWith('skill', {
        filterByFormula: 'FIND("\\\\\'\\"\\t coucou \\\\\'\\"\\t", LOWER(Nom))',
        maxRecords: 20,
        sort: [{ field: 'Nom', direction: 'asc' }],
      }));
    });
  });
});

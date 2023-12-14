import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | framework', function(hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#sortedAreas', function() {
    test('it should return areas sorted by code', function(assert) {
      // given
      const framework = run(() => store.createRecord('framework', {
        areas: [
          store.createRecord('area', { code: '10' }),
          store.createRecord('area', { code: '9' }),
        ]
      }));

      // when
      const sortedAreas = framework.sortedAreas;

      // then
      assert.strictEqual(sortedAreas.length, 2);
      assert.strictEqual(sortedAreas[0].code, '9');
      assert.strictEqual(sortedAreas[1].code, '10');
    });
  });
});

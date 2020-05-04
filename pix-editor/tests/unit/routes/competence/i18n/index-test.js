import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | competence/i18n/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:competence/i18n/index');
    assert.ok(route);
  });
});

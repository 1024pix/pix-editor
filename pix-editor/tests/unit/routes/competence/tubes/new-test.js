import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Route | competence/tubes/new', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/tubes/new');
    assert.ok(route);
  });
});

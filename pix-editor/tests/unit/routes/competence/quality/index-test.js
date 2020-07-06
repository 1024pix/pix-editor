import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Route | competence/quality/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:competence/quality/index');
    assert.ok(route);
  });
});

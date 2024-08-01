import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../../../setup-intl-rendering';

module('Unit | Controller | competence/prototypes/single/alternatives/single', function (hooks) {
  setupIntlRenderingTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:authenticated.competence/prototypes/single/alternatives/single');
    assert.ok(controller);
  });
});

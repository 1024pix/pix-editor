import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Unit | Controller | competence/quality/single', function (hooks) {
  setupIntlRenderingTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:authenticated.competence/quality/single');
    assert.ok(controller);
  });
});

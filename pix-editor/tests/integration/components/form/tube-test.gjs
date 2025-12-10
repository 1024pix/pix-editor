import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Tube from 'pix-editor/components/form/tube';

module('Integration | Component | tube-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display appropriate fields', async function (assert) {
    const self = this;

    // given
    const tube = EmberObject.create({});
    this.tube = tube;

    // when
    await render(<template><Tube @tube={{self.tube}} /></template>);

    // then
    assert.dom('[data-test-practical-title-fr-field]').exists();
    assert.dom('[data-test-practical-description-fr-field]').exists();
    assert.dom('[data-test-practical-title-en-field]').exists();
    assert.dom('[data-test-practical-description-en-field]').exists();
  });

  module('#not edition', function (hooks) {
    hooks.beforeEach(async function () {
      const self = this;

      const tube = EmberObject.create({});
      this.tube = tube;
      this.edition = false;

      await render(<template><Tube @tube={{self.tube}} @edition={{self.edition}} /></template>);
    });

    test('it should display `pixId` field', function (assert) {
      // then
      assert.dom('[data-test-pix-id-field]').exists();
    });

    test('it should not display `tube.name` field', function (assert) {
      // then
      assert.dom('[data-test-name-field]').doesNotExist();
    });
  });

  module('#edition', function (hooks) {
    hooks.beforeEach(async function () {
      const self = this;

      const tube = EmberObject.create({});
      this.tube = tube;
      this.edition = true;

      await render(<template><Tube @tube={{self.tube}} @edition={{self.edition}} /></template>);
    });

    test('it should not display `pixId` field', function (assert) {
      // then
      assert.dom('[data-test-pix-id-field]').doesNotExist();
    });

    test('it should display `tube.name` field', function (assert) {
      // then
      assert.dom('[data-test-name-field]').exists();
    });
  });
});

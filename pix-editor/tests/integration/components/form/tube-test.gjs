import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Tube from 'pixeditor/components/form/tube';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | tube-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display appropriate fields', async function (assert) {
    const self = this;

    // given
    const tube = EmberObject.create({});
    this.tube = tube;

    // when
    const screen = await render(<template><Tube @tube={{self.tube}} /></template>);

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Titre pratique (fr) :' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Description pratique (fr)' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Titre pratique (en) :' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Description pratique (en)' })).exists();
  });

  module('#not edition', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      const self = this;

      const tube = EmberObject.create({});
      this.tube = tube;
      this.edition = false;

      screen = await render(<template><Tube @tube={{self.tube}} @edition={{self.edition}} /></template>);
    });

    test('it should display `pixId` field', function (assert) {
      // then
      assert.dom(screen.getByRole('textbox', { name: 'Id :' })).exists();
    });

    test('it should not display `tube.name` field', function (assert) {
      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Nom :' })).doesNotExist();
    });
  });

  module('#edition', function (hooks) {
    let screen;
    hooks.beforeEach(async function () {
      const self = this;

      const tube = EmberObject.create({});
      this.tube = tube;
      this.edition = true;

      screen = await render(<template><Tube @tube={{self.tube}} @edition={{self.edition}} /></template>);
    });

    test('it should not display `pixId` field', function (assert) {
      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Id :' })).doesNotExist();
    });

    test('it should display `tube.name` field', function (assert) {
      // then
      assert.dom(screen.getByRole('textbox', { name: 'Nom :' })).exists();
    });
  });
});

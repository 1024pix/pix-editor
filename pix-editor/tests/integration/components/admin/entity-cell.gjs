import { clickByName, render } from '@1024pix/ember-testing-library';
import AdminEntityCell from 'pixeditor/components/admin/entity-cell';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | admin | entity-cell', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  module('when field\'s type is "enum"', function () {
    test("it should display the value's corresponding label", async function (assert) {
      // given
      const field = {
        type: 'enum',
        key: 'flavour',
        options: [
          { value: 123, label: 'Chocolat' },
          { value: 456, label: 'Fraise' },
        ],
      };
      const row = { properties: { flavour: 456 } };

      // when
      screen = await render(<template><AdminEntityCell @row={{row}} @field={{field}} /></template>);

      // then
      assert.dom(await screen.queryByText('Chocolat')).doesNotExist();
      assert.dom(await screen.queryByText('456')).doesNotExist();
      assert.dom(await screen.queryByText('flavour')).doesNotExist();
      assert.dom(await screen.getByText('Fraise')).exists();
    });
  });

  module('when field\'s type is "secret"', function () {
    test('it should initially hide the value', async function (assert) {
      // given
      const field = {
        type: 'secret',
        key: 'flavour',
        label: 'Goût',
      };
      const row = { id: 1, properties: { flavour: 'Chocolat' } };

      // when
      screen = await render(<template><AdminEntityCell @row={{row}} @field={{field}} /></template>);

      // then
      assert.dom(await screen.queryByText('Chocolat')).doesNotExist();
      assert.dom(await screen.getByText('Valeur cachée')).exists();

      await clickByName('Afficher le secret "Goût" de l\'entité "1"');
      assert.dom(await screen.getByText('Chocolat')).exists();
      assert.dom(await screen.queryByText('Valeur cachée')).doesNotExist();

      await clickByName('Cacher le secret "Goût" de l\'entité "1"');
      assert.dom(await screen.queryByText('Chocolat')).doesNotExist();
      assert.dom(await screen.getByText('Valeur cachée')).exists();
    });
  });

  module("when field's type is anything else", function () {
    test('it should display the raw value', async function (assert) {
      // given
      const field = {
        type: 'string',
        key: 'flavour',
      };
      const row = { properties: { flavour: 'Chocolat' } };

      // when
      screen = await render(<template><AdminEntityCell @row={{row}} @field={{field}} /></template>);

      // then
      assert.dom(await screen.queryByText('flavour')).doesNotExist();
      assert.dom(await screen.getByText('Chocolat')).exists();
    });
  });
});

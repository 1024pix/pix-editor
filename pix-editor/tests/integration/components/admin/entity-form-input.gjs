import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import sinon from 'sinon';

import AdminEntityFormInput from 'pixeditor/components/admin/entity-form-input';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | admin | entity-form-input', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  module('when field\'s type is "enum"', function (hooks) {
    const field = {
      type: 'enum',
      key: 'flavour',
      label: 'Goût',
      error: 'Il manque le goût banane',
      options: [
        { value: 123, label: 'Chocolat' },
        { value: 456, label: 'Fraise' },
      ],
      value: 123,
    };

    test('it should display a select', async function (assert) {
      // when
      screen = await render(
        <template>
          <AdminEntityFormInput
            @key={{field.key}}
            @type={{field.type}}
            @label={{field.label}}
            @options={{field.options}}
            @value={{field.value}}
            @error={{field.error}}
          />
        </template>,
      );

      // then
      const select = await screen.findByRole('button', { name: 'Goût *' });
      assert.dom(select).exists();
      await click(select);
      assert.dom(await screen.findByRole('listbox')).exists();
      assert.dom(screen.getByRole('option', { name: 'Chocolat', selected: true })).exists();
      assert.dom(screen.getByRole('option', { name: 'Fraise' })).exists();
      assert.dom(screen.getByText('Il manque le goût banane')).exists();
    });

    module('when an option is selected', function () {
      test('it should call @onChange with the new value', async function (assert) {
        // given
        const onChange = sinon.stub();

        // when
        screen = await render(
          <template>
            <AdminEntityFormInput
              @type={{field.type}}
              @label={{field.label}}
              @options={{field.options}}
              @value={{field.value}}
              @error={{field.error}}
              @onChange={{onChange}}
            />
          </template>,
        );

        // then
        await clickByName('Goût *');
        await click(await screen.findByRole('option', { name: 'Fraise' }));
        assert.strictEqual(onChange.getCalls()[0].firstArg, 456);
      });
    });
  });

  module('when field\'s type is "secret"', function () {
    const field = {
      type: 'secret',
      key: 'flavour',
      label: 'Goût',
      value: 'hehehe',
      error: 'Ce mot de passe est déjà utilisé par Jean',
    };

    test('it should display an password input', async function (assert) {
      // when
      screen = await render(
        <template>
          <AdminEntityFormInput
            @type={{field.type}}
            @label={{field.label}}
            @value={{field.value}}
            @error={{field.error}}
          />
        </template>,
      );

      // then
      const input = await screen.findByLabelText('Goût *');
      assert.dom(input).exists();
      assert.strictEqual(input.type, 'password');
      assert.strictEqual(input.value, field.value);
      assert.dom(screen.getByText('Ce mot de passe est déjà utilisé par Jean')).exists();
      assert.dom(screen.getByRole('button', { name: 'Afficher le mot de passe' })).exists();
    });

    module('when input is filled', function () {
      test('it should call @onChange with the new input value', async function (assert) {
        // given
        const onChange = sinon.stub();

        // when
        screen = await render(
          <template>
            <AdminEntityFormInput
              @type={{field.type}}
              @label={{field.label}}
              @value={{field.value}}
              @error={{field.error}}
              @onChange={{onChange}}
            />
          </template>,
        );

        // then
        await fillByLabel('Goût *', 'patate');
        assert.strictEqual(onChange.getCalls()[0].firstArg, 'patate');
      });
    });
  });

  module('when field\'s type is "number"', function () {
    const field = {
      type: 'number',
      key: 'flavour',
      label: 'Goût',
      value: 123,
      error: 'Attention, je ne sais pas compter au dessus de 25',
    };

    test('it should display an input with type "number"', async function (assert) {
      // when
      screen = await render(
        <template>
          <AdminEntityFormInput
            @type={{field.type}}
            @label={{field.label}}
            @value={{field.value}}
            @error={{field.error}}
          />
        </template>,
      );

      // then
      const input = await screen.findByLabelText('Goût *');
      assert.dom(input).exists();
      assert.strictEqual(input.type, field.type);
      assert.strictEqual(input.value, `${field.value}`);
      assert.dom(screen.getByText('Attention, je ne sais pas compter au dessus de 25')).exists();
    });

    module('when input is filled', function () {
      test('it should call @onChange with the new input value', async function (assert) {
        // given
        const onChange = sinon.stub();

        // when
        screen = await render(
          <template>
            <AdminEntityFormInput
              @type={{field.type}}
              @label={{field.label}}
              @value={{field.value}}
              @error={{field.error}}
              @onChange={{onChange}}
            />
          </template>,
        );

        // then
        await fillByLabel('Goût *', 999);
        assert.strictEqual(onChange.getCalls()[0].firstArg, 999);
      });
    });
  });

  module("when field's type is anything else", function () {
    const field = {
      type: 'string',
      key: 'flavour',
      label: 'Goût',
      value: 'Fromage',
      error: 'Beurk',
    };

    test('it should display an input', async function (assert) {
      // when
      screen = await render(
        <template>
          <AdminEntityFormInput
            @type={{field.type}}
            @label={{field.label}}
            @value={{field.value}}
            @error={{field.error}}
          />
        </template>,
      );

      // then
      const input = await screen.findByLabelText('Goût *');
      assert.dom(input).exists();
      assert.strictEqual(input.value, field.value);
      assert.dom(screen.getByText('Beurk')).exists();
    });

    module('when input is filled', function () {
      test('it should call @onChange with the new input value', async function (assert) {
        // given
        const onChange = sinon.stub();

        // when
        screen = await render(
          <template>
            <AdminEntityFormInput
              @type={{field.type}}
              @label={{field.label}}
              @value={{field.value}}
              @error={{field.error}}
              @onChange={{onChange}}
            />
          </template>,
        );

        // then
        await fillByLabel('Goût *', 'camembert');
        assert.strictEqual(onChange.getCalls()[0].firstArg, 'camembert');
      });
    });
  });
});

import { clickByText, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import ToggleField from 'pix-editor/components/v2/field/toggle-field';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Integration | Component | v2/field/toggle-field', function (hooks) {
  setupIntlRenderingTest(hooks);
  let setDisplayFieldStub;
  let confirmAskStub;
  hooks.beforeEach(function () {
    confirmAskStub = sinon.stub().resolves();
    class ConfirmService extends Service {
      ask = confirmAskStub;
    }
    this.owner.register('service:confirm', ConfirmService);

    setDisplayFieldStub = sinon.stub();
  });

  test('if `edition` is `false` toggle button should be hidden', async function (assert) {
    // given
    const modelData = EmberObject.create({ someField: '' });
    // when
    const screen = await render(
      <template>
        <ToggleField
          @edition={{false}}
          @model={{modelData}}
          @modelField="someField"
          @hideTextButton="Supprimer le champ"
          @displayTextButton="Ajouter un champ"
          @confirmText="le champ"
          @displayField={{false}}
          @setDisplayField={{setDisplayFieldStub}}
        >
          <label for="input">input</label>
          <input type="text" id="input" />
        </ToggleField>
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Ajouter un champ' })).doesNotExist();
  });

  module('if model field is empty', function (hooks) {
    let modelData;
    hooks.beforeEach(function () {
      modelData = EmberObject.create({ someField: '' });
    });

    test('if `displayField` is `false` yield content should be hidden', async function (assert) {
      // when
      const screen = await render(
        <template>
          <ToggleField
            @edition={{true}}
            @model={{modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{false}}
            @setDisplayField={{setDisplayFieldStub}}
          >
            <label for="input">input</label>
            <input type="text" id="input" />
          </ToggleField>
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Ajouter un champ' })).exists();
      assert.dom(screen.queryByRole('input', { name: 'input' })).doesNotExist();
    });

    test('it should call `setDisplayField` on click with `true` as argument', async function (assert) {
      // when
      await render(
        <template>
          <ToggleField
            @edition={{true}}
            @model={{modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{false}}
            @setDisplayField={{setDisplayFieldStub}}
          >
            <label for="input">input</label>
            <input type="text" id="input" />
          </ToggleField>
        </template>,
      );

      await clickByText('Ajouter un champ');

      // then
      assert.ok(setDisplayFieldStub.calledWith(true));
    });

    test('if displayField is `true` yield content should be display', async function (assert) {
      // when
      const screen = await render(
        <template>
          <ToggleField
            @edition={{true}}
            @model={{modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{true}}
            @setDisplayField={{setDisplayFieldStub}}
          >
            <label for="input">input</label>
            <input type="text" id="input" />
          </ToggleField>
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Supprimer le champ' })).exists();
      assert.dom(screen.getByLabelText('input')).exists();
    });
  });

  module('if model field is fill', function (hooks) {
    let modelData;

    hooks.beforeEach(function () {
      modelData = EmberObject.create({ someField: 'Some data' });
    });

    test('yield content should be display', async function (assert) {
      // when
      const screen = await render(
        <template>
          <ToggleField
            @edition={{true}}
            @model={{modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{false}}
            @setDisplayField={{setDisplayFieldStub}}
          >
            <label for="input">input</label>
            <input type="text" id="input" />
          </ToggleField>
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Supprimer le champ' })).exists();
      assert.dom(screen.getByLabelText('input')).exists();
    });

    test('it should call `setDisplayField` on click with `false` as argument and empty model field', async function (assert) {
      // when
      await render(
        <template>
          <ToggleField
            @edition={{true}}
            @model={{modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{true}}
            @setDisplayField={{setDisplayFieldStub}}
          >
            <label for="input">input</label>
            <input type="text" id="input" />
          </ToggleField>
        </template>,
      );

      await clickByText('Supprimer le champ');

      // then
      assert.ok(setDisplayFieldStub.calledWith(false));
      assert.ok(confirmAskStub.calledWith('Suppression', 'Êtes-vous sûr de vouloir supprimer le champ ?'));
    });
  });
});

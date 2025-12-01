import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import ToggleField from 'pixeditor/components/field/toggle-field';

module('Integration | Component | field/toggle-field', function (hooks) {
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

    this.setDisplayField = setDisplayFieldStub;
  });

  test('if `edition` is `false` toggle button should be hidden', async function (assert) {
    const self = this;

    // given
    const modelData = EmberObject.create({ someField: '' });
    this.modelData = modelData;

    // when
    await render(
      <template>
        {{! template-lint-disable require-input-label }}
        <ToggleField
          @edition={{false}}
          @model={{self.modelData}}
          @modelField="someField"
          @hideTextButton="Supprimer le champ"
          @displayTextButton="Ajouter un champ"
          @confirmText="le champ"
          @displayField={{false}}
          @setDisplayField={{self.setDisplayField}}
        >
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </ToggleField>
      </template>,
    );

    // then
    assert.dom('[data-test-toggle-field-button]').doesNotExist();
  });

  module('if model field is empty', function (hooks) {
    hooks.beforeEach(function () {
      const modelData = EmberObject.create({ someField: '' });
      this.modelData = modelData;
    });

    test('if `displayField` is `false` yield content should be hidden', async function (assert) {
      const self = this;

      // when
      await render(
        <template>
          {{! template-lint-disable require-input-label }}
          <ToggleField
            @edition={{true}}
            @model={{self.modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{false}}
            @setDisplayField={{self.setDisplayField}}
          >
            <textarea cols="30" rows="10" class="yield-content"></textarea>
          </ToggleField>
        </template>,
      );

      // then
      assert.dom('[data-test-toggle-field-button]').hasText('Ajouter un champ');
      assert.dom('.yield-content').doesNotExist();
    });

    test('it should call `setDisplayField` on click with `true` as argument', async function (assert) {
      const self = this;

      // when
      await render(
        <template>
          {{! template-lint-disable require-input-label }}
          <ToggleField
            @edition={{true}}
            @model={{self.modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{false}}
            @setDisplayField={{self.setDisplayField}}
          >
            <textarea cols="30" rows="10" class="yield-content"></textarea>
          </ToggleField>
        </template>,
      );
      await click(find('[data-test-toggle-field-button]'));

      // then
      assert.ok(setDisplayFieldStub.calledWith(true));
    });

    test('if displayField is `true` yield content should be display', async function (assert) {
      const self = this;

      // when
      await render(
        <template>
          {{! template-lint-disable require-input-label }}
          <ToggleField
            @edition={{true}}
            @model={{self.modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{true}}
            @setDisplayField={{self.setDisplayField}}
          >
            <textarea cols="30" rows="10" class="yield-content"></textarea>
          </ToggleField>
        </template>,
      );

      // then
      assert.dom('[data-test-toggle-field-button]').hasText('Supprimer le champ');
      assert.dom('.yield-content').exists();
    });
  });

  module('if model field is fill', function (hooks) {
    let modelData;

    hooks.beforeEach(function () {
      modelData = EmberObject.create({ someField: 'Some data' });
      this.modelData = modelData;
    });

    test('yield content should be display', async function (assert) {
      const self = this;

      // when
      await render(
        <template>
          {{! template-lint-disable require-input-label }}
          <ToggleField
            @edition={{true}}
            @model={{self.modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{false}}
            @setDisplayField={{self.setDisplayField}}
          >
            <textarea cols="30" rows="10" class="yield-content"></textarea>
          </ToggleField>
        </template>,
      );

      // then
      assert.dom('[data-test-toggle-field-button]').hasText('Supprimer le champ');
      assert.dom('.yield-content').exists();
    });

    test('it should call `setDisplayField` on click with `false` as argument and empty model field', async function (assert) {
      const self = this;

      // when
      await render(
        <template>
          {{! template-lint-disable require-input-label }}
          <ToggleField
            @edition={{true}}
            @model={{self.modelData}}
            @modelField="someField"
            @hideTextButton="Supprimer le champ"
            @displayTextButton="Ajouter un champ"
            @confirmText="le champ"
            @displayField={{true}}
            @setDisplayField={{self.setDisplayField}}
          >
            <textarea cols="30" rows="10" class="yield-content"></textarea>
          </ToggleField>
        </template>,
      );
      await click(find('[data-test-toggle-field-button]'));

      // then
      assert.ok(setDisplayFieldStub.calledWith(false));
      assert.ok(confirmAskStub.calledWith('Suppression', 'Êtes-vous sûr de vouloir supprimer le champ ?'));
    });
  });
});

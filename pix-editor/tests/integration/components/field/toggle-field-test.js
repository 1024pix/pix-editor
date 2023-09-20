import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | field/toggle-field', function(hooks) {
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

    this.set('setDisplayField', setDisplayFieldStub);
  });

  test('if `edition` is `false` toggle button should be hidden', async function(assert) {
    // given
    const modelData = EmberObject.create({ someField: '' });
    this.set('modelData', modelData);

    // when
    await render(hbs`
        <Field::ToggleField @edition={{false}}
                            @model={{this.modelData}}
                            @modelField="someField"
                            @hideTextButton="Supprimer le champ"
                            @displayTextButton="Ajouter un champ"
                            @confirmText="le champ"
                            @displayField={{false}}
                            @setDisplayField={{this.setDisplayField}}>
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </Field::ToggleField>
      `);

    // then
    assert.dom('[data-test-toggle-field-button]').doesNotExist();
  });

  module('if model field is empty', function (hooks) {

    hooks.beforeEach(function () {
      const modelData = EmberObject.create({ someField: '' });
      this.set('modelData', modelData);
    });

    test('if `displayField` is `false` yield content should be hidden', async function (assert) {
      // when
      await render(hbs`
        <Field::ToggleField @edition={{true}}
                            @model={{this.modelData}}
                            @modelField="someField"
                            @hideTextButton="Supprimer le champ"
                            @displayTextButton="Ajouter un champ"
                            @confirmText="le champ"
                            @displayField={{false}}
                            @setDisplayField={{this.setDisplayField}}>
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </Field::ToggleField>
      `);

      // then
      assert.dom('[data-test-toggle-field-button]').hasText('Ajouter un champ');
      assert.dom('.yield-content').doesNotExist();
    });

    test('it should call `setDisplayField` on click with `true` as argument', async function(assert) {
      // when
      await render(hbs`
        <Field::ToggleField @edition={{true}}
                            @model={{this.modelData}}
                            @modelField="someField"
                            @hideTextButton="Supprimer le champ"
                            @displayTextButton="Ajouter un champ"
                            @confirmText="le champ"
                            @displayField={{false}}
                            @setDisplayField={{this.setDisplayField}}>
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </Field::ToggleField>
      `);
      await click(find('[data-test-toggle-field-button]'));

      // then
      assert.ok(setDisplayFieldStub.calledWith(true));
    });


    test('if displayField is `true` yield content should be display', async function (assert) {
      // when
      await render(hbs`
        <Field::ToggleField @edition={{true}}
                            @model={{this.modelData}}
                            @modelField="someField"
                            @hideTextButton="Supprimer le champ"
                            @displayTextButton="Ajouter un champ"
                            @confirmText="le champ"
                            @displayField={{true}}
                            @setDisplayField={{this.setDisplayField}}>
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </Field::ToggleField>
      `);

      // then
      assert.dom('[data-test-toggle-field-button]').hasText('Supprimer le champ');
      assert.dom('.yield-content').exists();
    });

  });

  module('if model field is fill', function (hooks) {

    let modelData;

    hooks.beforeEach(function () {
      modelData = EmberObject.create({ someField: 'Some data' });
      this.set('modelData', modelData);
    });

    test('yield content should be display', async function (assert) {
      // when
      await render(hbs`
        <Field::ToggleField @edition={{true}}
                            @model={{this.modelData}}
                            @modelField="someField"
                            @hideTextButton="Supprimer le champ"
                            @displayTextButton="Ajouter un champ"
                            @confirmText="le champ"
                            @displayField={{false}}
                            @setDisplayField={{this.setDisplayField}}>
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </Field::ToggleField>
      `);

      // then
      assert.dom('[data-test-toggle-field-button]').hasText('Supprimer le champ');
      assert.dom('.yield-content').exists();
    });

    test('it should call `setDisplayField` on click with `false` as argument and empty model field', async function (assert) {
      // when
      await render(hbs`
        <Field::ToggleField @edition={{true}}
                            @model={{this.modelData}}
                            @modelField="someField"
                            @hideTextButton="Supprimer le champ"
                            @displayTextButton="Ajouter un champ"
                            @confirmText="le champ"
                            @displayField={{true}}
                            @setDisplayField={{this.setDisplayField}}>
          <textarea cols="30" rows="10" class="yield-content"></textarea>
        </Field::ToggleField>
      `);
      await click(find('[data-test-toggle-field-button]'));

      // then
      assert.ok(setDisplayFieldStub.calledWith(false));
      assert.strictEqual(this.modelData.someField, '');
      assert.ok(confirmAskStub.calledWith('Suppression', 'Êtes-vous sûr de vouloir supprimer le champ ?'));
    });
  });
});

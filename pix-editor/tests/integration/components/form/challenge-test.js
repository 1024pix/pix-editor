import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | challenge-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display expected fields if challenge type is `QROC`', async function(assert) {
    // Given
    this.set('challengeData', { type: 'QROC' , isTextBased: true, isPrototype: true });

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);

    // Then
    ['data-test-format-field', 'data-test-tolerence-fields', 'data-test-suggestion-field'].forEach(field => {
      assert.dom(`[${field}]`).exists();
    });
  });

  test('it should hide useless fields if challenge autoReply is `true`', async function(assert) {
    // Given
    this.set('challengeData', { autoReply: true, isTextBased: true, isPrototype: true });

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);

    // Then
    ['data-test-format-field', 'data-test-tolerence-fields', 'data-test-suggestion-field'].forEach(field => {
      assert.dom(`[${field}]`).doesNotExist();
    });
  });

  module('if alternative instructions is empty', function (hooks) {

    hooks.beforeEach(function () {
      this.set('challengeData', { alternativeInstructions: '' });
    });

    test('alternative instructions field should be hidden', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} />`);

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Ajouter une consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').doesNotExist();
    });

    test('it should display on click', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}}/>`);
      await click(find('[data-test-alternative-instructions-button]'));

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Supprimer la consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').exists();
    });
  });

  module('if alternative instructions is filled', function (hooks) {

    let challengeData;

    hooks.beforeEach(function () {
      challengeData = { alternativeInstructions: 'Somme Alternative instructions' };
      this.set('challengeData', challengeData);
    });

    test('alternative instructions field should be displayed', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} />`);

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Supprimer la consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').exists();
    });

    test('it should hide and empty on click', async function (assert) {
      // given
      const confirmAskStub = sinon.stub().resolves();
      class ConfirmService extends Service {
        ask = confirmAskStub;
      }
      this.owner.unregister('service:confirm');
      this.owner.register('service:confirm', ConfirmService);

      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}}/>`);
      await click(find('[data-test-alternative-instructions-button]'));

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Ajouter une consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').doesNotExist();
      assert.ok(this.challengeData.alternativeInstructions === '');
    });
  });
});

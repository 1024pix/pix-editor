import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | challenge-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display expected fields if challenge type is `QROC`', async function(assert) {
    // Given
    const challengeData = EmberObject.create({ type: 'QROC' , isTextBased: true, isPrototype: true });
    this.set('challengeData', challengeData);

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);

    // Then
    ['data-test-format-field', 'data-test-tolerence-fields', 'data-test-suggestion-field'].forEach(field => {
      assert.dom(`[${field}]`).exists();
    });
  });

  test('it should hide useless fields if challenge autoReply is `true`', async function(assert) {
    // Given
    const challengeData = EmberObject.create({ autoReply: true, isTextBased: true, isPrototype: true });
    this.set('challengeData', challengeData);

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);

    // Then
    ['data-test-format-field', 'data-test-tolerence-fields', 'data-test-suggestion-field'].forEach(field => {
      assert.dom(`[${field}]`).doesNotExist();
    });
  });

  module('if alternative instructions is empty', function (hooks) {

    hooks.beforeEach(function () {
      const challengeData = EmberObject.create({ alternativeInstructions: '' });
      this.set('challengeData', challengeData);
    });

    test('alternative instructions field should be hidden', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} />`);

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Ajouter une consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').doesNotExist();
    });

    test('alternative instructions field be display if `displayAlternativeInstructionsField` is true', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}}
                                        @edition={{true}}
                                        @displayAlternativeInstructionsField={{true}} />`);

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Supprimer la consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').exists();
    });

    test('it should set `displayAlternativeInstructionsField` to `true` on click', async function(assert) {
      // given
      const setDisplayAlternativeInstructionsFieldStub = sinon.stub();
      this.set('setDisplayAlternativeInstructionsField', setDisplayAlternativeInstructionsFieldStub);

      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}}
                                        @edition={{true}}
                                        @setDisplayAlternativeInstructionsField={{this.setDisplayAlternativeInstructionsField}} />`);

      await click(find('[data-test-alternative-instructions-button]'));

      // then
      assert.ok(setDisplayAlternativeInstructionsFieldStub.calledWith(true));
    });
  });

  module('if alternative instructions is filled', function (hooks) {

    let challengeData;

    hooks.beforeEach(function () {
      challengeData = EmberObject.create({ alternativeInstructions: 'Somme Alternative instructions' });
      this.set('challengeData', challengeData);
    });

    test('alternative instructions field should be displayed', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} />`);

      // then
      assert.dom('[data-test-alternative-instructions-button]').hasText('Supprimer la consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').exists();
    });

    test('it should set `displayAlternativeInstructionsField` to `false` and empty `challenge.alternativeInstructions` on click', async function (assert) {
      // given
      const confirmAskStub = sinon.stub().resolves();
      class ConfirmService extends Service {
        ask = confirmAskStub;
      }
      this.owner.register('service:confirm', ConfirmService);

      const setDisplayAlternativeInstructionsFieldStub = sinon.stub();
      this.set('setDisplayAlternativeInstructionsField', setDisplayAlternativeInstructionsFieldStub);

      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}}
                                        @edition={{true}}
                                        @setDisplayAlternativeInstructionsField={{this.setDisplayAlternativeInstructionsField}} />`);

      await click(find('[data-test-alternative-instructions-button]'));

      // then
      assert.ok(setDisplayAlternativeInstructionsFieldStub.calledWith(false));
      assert.ok(this.challengeData.alternativeInstructions === '');
      assert.dom('[data-test-alternative-instructions-button]').hasText('Ajouter une consigne alternative');
      assert.dom('[data-test-alternative-instructions-field]').doesNotExist();
    });
  });
});

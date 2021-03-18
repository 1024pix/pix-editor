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

  module('if solutionToDisplay is empty', function (hooks) {

    hooks.beforeEach(function () {
      const challengeData = EmberObject.create({ solutionToDisplay: '' });
      this.set('challengeData', challengeData);
    });

    test('solutionToDisplay field should be hidden', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} />`);

      // then
      assert.dom('[data-test-solution-to-display-button]').hasText('Ajouter une bonne réponse à afficher');
      assert.dom('[data-test-solution-to-display-field ]').doesNotExist();
    });

    test('solutionToDisplay field be display if `displaySolutionToDisplayField` is true', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}}
                                        @edition={{true}}
                                        @displaySolutionToDisplayField={{true}} />`);

      // then
      assert.dom('[data-test-solution-to-display-button]').hasText('Supprimer la bonne réponse à afficher');
      assert.dom('[data-test-solution-to-display-field]').exists();
    });

    test('it should call `setDisplaySolutionToDisplayField` on click with `true` as argument', async function(assert) {
      // given
      const setDisplaySolutionToDisplayFieldStub = sinon.stub();
      this.set('setDisplaySolutionToDisplayField', setDisplaySolutionToDisplayFieldStub);

      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}}
                                        @edition={{true}}
                                        @setDisplaySolutionToDisplayField={{this.setDisplaySolutionToDisplayField}} />`);

      await click(find('[data-test-solution-to-display-button]'));

      // then
      assert.ok(setDisplaySolutionToDisplayFieldStub.calledWith(true));
    });
  });

  module('if solutionToDisplay is filled', function (hooks) {

    let challengeData;

    hooks.beforeEach(function () {
      challengeData = EmberObject.create({ solutionToDisplay: 'Somme solution to display' });
      this.set('challengeData', challengeData);
    });

    test('solutionToDisplay field should be displayed', async function (assert) {
      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} />`);

      // then
      assert.dom('[data-test-solution-to-display-button]').hasText('Supprimer la bonne réponse à afficher');
      assert.dom('[data-test-solution-to-display-field]').exists();
    });

    test('it should call `setDisplaySolutionToDisplayField` as argument `false` and empty `challenge.solutionToDisplay` on click', async function (assert) {
      // given
      const confirmAskStub = sinon.stub().resolves();
      class ConfirmService extends Service {
        ask = confirmAskStub;
      }
      this.owner.register('service:confirm', ConfirmService);

      const setDisplaySolutionToDisplayFieldStub = sinon.stub();
      this.set('setDisplaySolutionToDisplayField', setDisplaySolutionToDisplayFieldStub);

      // when
      await render(hbs`<Form::Challenge @challenge={{this.challengeData}}
                                        @edition={{true}}
                                        @setDisplaySolutionToDisplayField={{this.setDisplaySolutionToDisplayField}} />`);

      await click(find('[data-test-solution-to-display-button]'));

      // then
      assert.ok(setDisplaySolutionToDisplayFieldStub.calledWith(false));
      assert.ok(this.challengeData.solutionToDisplay === '');
      assert.dom('[data-test-solution-to-display-button]').hasText('Ajouter une bonne réponse à afficher');
      assert.dom('[data-test-solution-to-display-field]').doesNotExist();
    });
  });
});

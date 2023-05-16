import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, findAll, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
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

  test('it should display autochecked checkbox if challenge type is `QCM`', async function(assert) {
    // Given
    const store = this.owner.lookup('service:store');
    const challengeData = store.createRecord('challenge',{
      id: 'recChallenge0',
      genealogy: 'Prototype 1',
    });
    this.set('challengeData', challengeData);

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}}/>`);

    await click(find('[data-test-select-type] .ember-basic-dropdown-trigger'));
    await click(findAll('.ember-power-select-option')[1]);

    // Then
    assert.dom('[data-test-checkbox-shuffle]').exists();
    assert.dom('[data-test-checkbox-shuffle] > input').isChecked();

    // WORKAROUND: https://github.com/1024pix/pix-editor/pull/107#issuecomment-1547481515
    await new Promise(resolve => setTimeout(resolve, 200));
    await settled();
  });

  test('it should display autochecked checkbox if challenge type is `QCU`', async function(assert) {
    // Given
    const store = this.owner.lookup('service:store');
    const challengeData = store.createRecord('challenge',{
      id: 'recChallenge0',
      genealogy: 'Prototype 1',
    });
    this.set('challengeData', challengeData);

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}}/>`);

    await click(find('[data-test-select-type] .ember-basic-dropdown-trigger'));
    await click(findAll('.ember-power-select-option')[0]);

    // Then
    assert.dom('[data-test-checkbox-shuffle]').exists();
    assert.dom('[data-test-checkbox-shuffle] > input').isChecked();

    // WORKAROUND: https://github.com/1024pix/pix-editor/pull/107#issuecomment-1547481515
    await new Promise(resolve => setTimeout(resolve, 200));
    await settled();
  });
});

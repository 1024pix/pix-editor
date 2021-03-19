import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | challenge-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display autoReply checkbox if challenge type is `QROC`', async function(assert) {
    // Given
    this.set('challengeData', { type: 'QROC' });

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);

    // Then
    assert.dom('.ui.form').exists();
    assert.dom('#autoReplyField').exists();
  });

  test('it should not display autoReply checkbox if challenge type is not `QROC`', async function(assert) {
    // Given
    this.set('challengeData', { type: 'QCU' });

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);

    // Then
    assert.dom('#autoReplyField').doesNotExist();
  });
});

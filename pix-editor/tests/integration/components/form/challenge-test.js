import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | challenge-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display expected fields if challenge type is `QROC`', async function(assert) {
    // Given
    this.set('challengeData', { type: 'QROC' , isTextBased: true });

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @alternative={{this.alternative}}/>`);
    const labels = this.element.querySelectorAll('label');
    const textLabels = [...labels].map(labelNode=>labelNode.textContent.trim());
    const expectedLabels = ['Consigne', 'Type', 'Format QROC', 'Propositions', 'Réponses', 'Tolérance', 'T1 (espaces/casse/accents)', 'T2 (ponctuation)', 'T3 (distance d\'édition)', 'Embed', 'Type pédagogie', 'Déclinable', 'Timer', 'Internationalisation', 'Langue(s)', 'Géographie', 'Id'];

    // Then
    assert.dom('.ui.form').exists();
    expectedLabels.forEach(expectedLabel=>{
      assert.ok(textLabels.includes(expectedLabel));
    });
  });

  test('it should hide useless fields if challenge autoReply is `true`', async function(assert) {
    // Given
    this.set('challengeData', { autoReply: true, isTextBased: true });

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}}/>`);
    const labels = this.element.querySelectorAll('label');
    const textLabels = [...labels].map(labelNode=>labelNode.textContent.trim());
    const expectedLabels = ['Consigne', 'Type', 'Réponses', 'Embed', 'Type pédagogie', 'Déclinable', 'Timer', 'Internationalisation', 'Langue(s)', 'Géographie', 'Id'];
    const notExpectedLabels = ['Format QROC', 'Tolérance', 'Propositions'];

    // Then
    assert.dom('.ui.form').exists();
    expectedLabels.forEach(expectedLabel=>{
      assert.ok(textLabels.includes(expectedLabel));
    });
    notExpectedLabels.forEach(notExpectedLabel=>{
      assert.notOk(textLabels.includes(notExpectedLabel));
    });
  });
});

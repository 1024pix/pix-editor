import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenge-form', function(hooks) {
  setupIntlRenderingTest(hooks);
  let screen;

  test('it should display expected fields if challenge type is `QROC`', async function(assert) {
    // Given
    const countries = [{ FR: 'France' }];
    const challengeData = EmberObject.create({ type: 'QROC', isTextBased: true, isPrototype: true });
    this.set('countries', countries);
    this.set('challengeData', challengeData);
    this.set('checkEmbedURL', () => {});

    // When
    screen = await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @checkEmbedURL={{this.checkEmbedURL}} @countries={{this.countries}}/>`);

    // Then
    assert.dom(screen.getByLabelText('Format QROC')).exists();
    assert.dom('[data-test-tolerence-fields]').exists();
    assert.dom('[data-test-suggestion-field]').exists();
  });

  test('it should hide useless fields if challenge autoReply is `true`', async function(assert) {
    // Given
    const countries = [{ FR: 'France' }];
    const challengeData = EmberObject.create({ autoReply: true, isTextBased: true, isPrototype: true });
    this.set('countries', countries);
    this.set('challengeData', challengeData);
    this.set('checkEmbedURL', () => {});

    // When
    await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @checkEmbedURL={{this.checkEmbedURL}} @countries={{this.countries}}/>`);

    // Then
    ['data-test-format-field', 'data-test-tolerence-fields', 'data-test-suggestion-field'].forEach((field) => {
      assert.dom(`[${field}]`).doesNotExist();
    });
  });

  test('it should display autochecked checkbox if challenge type is `QCM`', async function(assert) {
    // Given
    const store = this.owner.lookup('service:store');
    const challengeData = store.createRecord('challenge', {
      id: 'recChallenge0',
      genealogy: 'Prototype 1',
      type: 'QCU',
    });
    this.set('challengeData', challengeData);
    this.set('checkEmbedURL', () => {});

    // When
    screen = await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}} @checkEmbedURL={{this.checkEmbedURL}}/>`);
    await click(screen.getByRole('button', { name: 'Type' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'QCM' }));

    // Then
    assert.dom('[data-test-checkbox-shuffle]').exists();
    assert.dom('[data-test-checkbox-shuffle] > input').isChecked();

    // WORKAROUND: https://github.com/1024pix/pix-editor/pull/107#issuecomment-1547481515
    await new Promise((resolve) => setTimeout(resolve, 400));
    await settled();
  });

  test('it should display autochecked checkbox if challenge type is `QCU`', async function(assert) {
    // Given
    const countries = [{ FR: 'France' }];
    const store = this.owner.lookup('service:store');
    const challengeData = store.createRecord('challenge', {
      id: 'recChallenge0',
      genealogy: 'Prototype 1',
      type: 'QCM',
    });
    this.set('countries', countries);
    this.set('challengeData', challengeData);
    this.set('checkEmbedURL', () => {});

    // When
    screen = await render(hbs`<Form::Challenge @challenge={{this.challengeData}} @edition={{true}}  @checkEmbedURL={{this.checkEmbedURL}}/>`);
    await click(screen.getByRole('button', { name: 'Type' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'QCM' }));

    // Then
    assert.dom('[data-test-checkbox-shuffle]').exists();
    assert.dom('[data-test-checkbox-shuffle] > input').isChecked();

    // WORKAROUND: https://github.com/1024pix/pix-editor/pull/107#issuecomment-1547481515
    await new Promise((resolve) => setTimeout(resolve, 400));
    await settled();
  });
});

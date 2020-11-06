import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | list/i18n', function(hooks) {
  setupRenderingTest(hooks);

  test('should display a list of challenge', async function(assert) {
    // given
    const challenge1 = {
      id: 'rec654258',
      languages: ['Francophone','Franco Français'],
      instructions: 'Some instructions 1'
    };
    const challenge2 = {
      id: 'rec654259',
      languages: ['Anglais'],
      instructions: 'Some instructions 2'

    };
    const challenge3 = {
      id: 'rec456789',
      languages: ['Franco Français'],
      instructions: 'Some instructions 3'
    };

    const challengesByLanguages = [
      { language: 'Francophone',challenge: challenge1,alternativesCount:'10' },
      { language: 'Anglais',challenge: challenge2,alternativesCount:'5' },
      { language: 'Franco Français',challenge: challenge3,alternativesCount:'8' }
    ];

    this.set('challengesByLanguages', challengesByLanguages);

    // when
    await render(hbs`<List::I18n @list={{challengesByLanguages}} @skill={{skill}}/>`);

    // then
    assert.equal(this.element.querySelectorAll('.challenge-prototype').length, 3);
    assert.dom(this.element.querySelectorAll('.challenge-prototype td:nth-child(1)')[0]).hasText('Some instructions 1');
    assert.dom(this.element.querySelectorAll('.challenge-prototype td:nth-child(3)')[0]).hasText('10');
  });
});

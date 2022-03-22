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
      locales: ['Francophone','Franco Français'],
      instruction: 'Some instructions 1'
    };
    const challenge2 = {
      id: 'rec654259',
      locales: ['Anglais'],
      instruction: 'Some instructions 2'

    };
    const challenge3 = {
      id: 'rec456789',
      locales: ['Franco Français'],
      instruction: 'Some instructions 3'
    };

    const challengesByLanguages = [
      { language: 'Francophone', challenge: challenge1, alternativesCount:'10' },
      { language: 'Anglais', challenge: challenge2, alternativesCount:'5' },
      { language: 'Franco Français', challenge: challenge3, alternativesCount:'8' }
    ];

    this.set('challengesByLanguages', challengesByLanguages);

    this.skill = {
      id: 'skillId',
      productionPrototype:  {}
    };

    // when
    await render(hbs`<List::I18n @list={{this.challengesByLanguages}} @skill={{this.skill}}/>`);

    // then
    assert.equal(this.element.querySelectorAll('.challenge-prototype').length, 3);
    assert.dom(this.element.querySelectorAll('.challenge-prototype td:nth-child(1)')[0]).hasText('Some instructions 1');
    assert.dom(this.element.querySelectorAll('.challenge-prototype td:nth-child(3)')[0]).hasText('10');
  });
});

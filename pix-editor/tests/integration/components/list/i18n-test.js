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
    };
    const challenge2 = {
      id: 'rec654259',
      languages: ['Anglais'],
    };
    const challenge3 = {
      id: 'rec654259',
      languages: ['Anglais'],
    };
    const challenge4= {
      id: 'rec456789',
      languages: ['Franco Français'],
      alternatives:[]
    };
    const skill = {
      id: 'rec123456',
      name: 'skillName',
      productionChallenges: [challenge2,challenge1,challenge3, challenge4]
    };
    const challengesByLanguages = [
      {language: 'Francophone',challenge: challenge1},
      {language: 'Anglais',challenge: challenge2},
      {language: 'Franco Français',challenge: challenge4}
      ];

    this.set('challengesByLanguages', challengesByLanguages)
    this.set('skill', skill);

    // when
    await render(hbs`<List::I18n @list={{challengesByLanguages}} @skill={{skill}}/>`);

    // then
    assert.equal(this.element.querySelectorAll('.challenge-template').length, 3);
    assert.equal(this.element.querySelectorAll('.challenge-template .alternatives')[1].textContent.trim(), "2");
  });
});

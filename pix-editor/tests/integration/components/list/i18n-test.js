import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | list/i18n', function(hooks) {
  setupRenderingTest(hooks);

  test('should display a list of template', async function(assert) {
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
      id: 'rec456789',
      languages: ['Francophone','Franco Français'],
      alternatives:[]
    };
    const skill = {
      id: 'rec123456',
      name: 'skillName',
      productionChallenges: [challenge2,challenge1,challenge3]
    };

    const challengesByLanguages = [challenge1, challenge2]
    this.set('challengesByLanguages', challengesByLanguages)
    this.set('skill', skill);

    // when
    await render(hbs`<List::I18n @list={{challengesByLanguages}} @skill={{skill}}/>`);

    // then
    assert.equal(this.element.querySelectorAll('.challenge-template').length, 2);
  });
});

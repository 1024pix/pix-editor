import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | list/i18n', function(hooks) {
  setupRenderingTest(hooks);

  test('should display a list of template', async function(assert) {
    // given
    const challengeAlternative1 = {
      id: 'rec654258',
    };
    const challengeAlternative2 = {
      id: 'rec654259',
    };
    const templateChallenge1 = {
      id: 'rec456789',
      languages: ['Francophone','Franco Français'],
      alternatives:[]
    };
    const templateChallenge2 = {
      id: 'rec987654',
      languages: ['Anglais'],
      alternatives:[challengeAlternative1,challengeAlternative2]
    };
    const skill = {
      id: 'rec123456',
      name: 'skillName',
      productionTemplates: [templateChallenge1,templateChallenge2]
    };
    this.set('skill', skill);

    // when
    await render(hbs`<List::I18n @list={{this.skill.productionTemplates}}/>`);

    // then
    assert.equal(this.element.querySelectorAll('.production-template').length, 2);
  });
});

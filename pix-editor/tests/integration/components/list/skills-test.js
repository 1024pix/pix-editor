import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | list/skill', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a list of skills', async function(assert) {
    // given
    const challenge1 = {
      id: 'recChallenge1',
    };
    const challenge2 = {
      id: 'recChallenge2',
    };
    const challenge3 = {
      id: 'recChallenge3',
    };
    const skill1 = {
      id: 'recSkill1',
      pixId: 'pixSkill1',
      version: '1',
      description: 'description_1',
      date: '14/07/1986 à 11:20',
      challenges: [challenge1, challenge2],
      status: 'en construction',
      statusCSS: 'suggested',
    };
    const skill2 = {
      id: 'recSkill2',
      pixId: 'pixSkill2',
      version: '2',
      description: 'description_2',
      date: '11/01/2020 à 11:20',
      challenges: [challenge3],
      status: 'actif',
      statusCSS: 'validated',
    };
    this.skills = [skill2, skill1];

    // when
    await render(hbs`<List::Skills @list={{this.skills}}/>`);

    // then
    assert.dom('[data-test-skill-row]').exists({ count: this.skills.length });
  });
});

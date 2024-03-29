import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | competence/grid/grid-cell', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    const section = 'i18n';
    const challenge = {
      id: 'rec456789',
      locales: ['Francophone'],
    };
    const skill = {
      id: 'rec123456',
      name: 'skill1',
      productionPrototypes: [challenge],
      validatedChallenges: [challenge],
      languages: ['Francophone'],
      challenges: [challenge],
    };
    this.set('section', section);
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::GridCell @section={{this.section}} @skill={{this.skill}}/>`);

    // then
    assert.dom('.i18n').exists();
  });
});

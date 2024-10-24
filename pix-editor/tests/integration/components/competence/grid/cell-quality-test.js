import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Integration | Component | quality-view', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const skill = {
      productionPrototype: {},
      tutoSolution: [],
      tutoMore: [],
      challenges: [],
    };

    this.skill = skill;
    // when
    await render(hbs`<Competence::Grid::CellQuality @skill={{this.skill}} />`);

    // then
    assert.dom(this.element).hasText('0');
  });
});

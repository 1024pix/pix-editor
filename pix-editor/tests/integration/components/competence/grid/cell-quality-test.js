import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | quality-view', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const skill = {
      productionPrototype: {},
      tutoSolution: [],
      tutoMore: []
    };

    this.skill = skill;
    // when
    await render(hbs`<Competence::Grid::CellQuality @skill={{this.skill}} />`);

    // then
    assert.dom(this.element).hasText('0');
  });
});

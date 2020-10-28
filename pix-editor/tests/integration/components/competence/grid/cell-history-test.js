import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | competence/grid/cell-history', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    const tube = EmberObject.create({ id:1, filledDeadSkills:[[]] });
    const skill = EmberObject.create({ name:'@skill1' });
    this.set('tube', tube);
    this.set('skill', skill);
    this.set('level', 0);

    await render(hbs`<Competence::Grid::CellHistory @tube={{this.tube}} @skill={{this.skill}} @level={{this.level}}/>`);

    assert.dom(this.element.querySelector('.skill-name')).hasText('@skill1');
    assert.dom(this.element.querySelector('.history-count')).hasText('0 - 0');
  });
});

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

    assert.equal(this.element.querySelector('.skill-name').textContent.trim(), '@skill1');
    assert.equal(this.element.querySelector('.history-count').textContent.trim(), '0 - 0');
  });
});

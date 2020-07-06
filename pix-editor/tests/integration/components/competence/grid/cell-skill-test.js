import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | competence/grid/cell-skill', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const skill = EmberObject.create({ descriptionCSS:'skill_CSS', name:'skill_name' });
    this.set('skill', skill);
    // when
    await render(hbs`{{competence/grid/cell-skill skill=skill}}`);
    // then
    assert.equal(this.element.querySelector('.skill_CSS').textContent.trim(), 'skill_name');

  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | competence/grid/cell-workbench', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given
    const templates = ['template_1', 'template_2', 'template_3'];
    const skill = EmberObject.create({templates});
    this.set('skill', skill);
    // when
    await render(hbs`{{competence/grid/cell-workbench skill=skill}}`);
    // then
    assert.equal(this.element.querySelector('.draft').textContent.trim(), templates.length);


  });
});

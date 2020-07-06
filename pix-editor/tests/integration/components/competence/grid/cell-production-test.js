import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | competence/grid/cell-production', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given
    const productionAlternatives = [1,2,3];
    const skill = EmberObject.create({ productionTemplate:{ productionAlternatives } });
    this.set('skill', skill);
    // when
    await render(hbs`{{competence/grid/cell-production skill=skill}}`);
    // then
    assert.equal(this.element.querySelector('.production').textContent.trim(), productionAlternatives.length);

  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | target-profile/competence-profile', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given

    const competence = EmberObject.create({ description:'competence_description', title:'competence_title' });
    this.set('competence', competence);

    // when

    await render(hbs`{{target-profile/competence-profile competence=competence}}`);

    // then

    assert.equal(this.element.querySelector('.competence-title').textContent.trim(), 'competence_title');
  });
});

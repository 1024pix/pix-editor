import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | competence/competence-header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given

    const competence = EmberObject.create({ name:'competence_name' });
    this.set('competence', competence);
    this.set('externalAction', ()=>{});

    //  when

    await render(hbs`{{competence/competence-header competence=competence selectSection=(action externalAction)}}`);

    //  then
    assert.dom('h1').exists();
    assert.equal(this.element.querySelector('h1').textContent.trim(), 'competence_name');
  });
});

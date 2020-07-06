import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competence/competence-actions', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given

    this.set('config', {lite:false});
    this.set('externalAction', ()=>{});

    // when
    await render(hbs`{{competence/competence-actions
      shareSkills=(action externalAction)
      selectView=(action externalAction)
      refresh=(action externalAction)
      config=config
      section="challenges"}}`);

    // then

    assert.equal(this.element.querySelector('.production').textContent.trim(), 'En production');

  });
});

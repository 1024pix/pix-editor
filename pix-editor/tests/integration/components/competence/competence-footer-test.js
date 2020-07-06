import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competence/competence-footer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given

    this.set('mayCreateTube', true);
    this.set('externalAction', () => {
    });

    // when

    await render(hbs`{{competence/competence-footer
    mayCreateTube=mayCreateTube
    selectView=(action externalAction)
    newTube=(action externalAction)
    newTemplate=(action externalAction)
     }}`);

    // then

    assert.dom('.ui.borderless.bottom').exists();
  });
});

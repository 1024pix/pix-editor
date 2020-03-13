import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pop-in/tutorial', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    this.set('tutorial', {
      title:'',
      link:'',
      source:'',
      license:'',
      format:'',
      duration:'',
      level:'',
      tags:[]
    });

    await render(hbs`{{pop-in/tutorial close=(action close) saveTutorial=(action saveTutorial) tutorial=tutorial}}`);

    assert.dom('.ember-modal-dialog').exists();

  });
});

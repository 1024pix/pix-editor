import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | challenge-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('showIllustrationAction', function() {});
    this.set('challengeData', {t1:false, t2:false, t3:false})

    await render(hbs`{{form/challenge showIllustration=(action showIllustrationAction) challenge=challengeData}}`);

    assert.dom('.ui.form').exists();

  });
});

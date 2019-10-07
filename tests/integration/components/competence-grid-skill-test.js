import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competence-grid-skill', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {


    await render(hbs`{{competence-grid-skill view="skills"}}`);

    assert.dom('.skill-name').exists();

  });
});

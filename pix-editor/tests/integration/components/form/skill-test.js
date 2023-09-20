import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | skill-form', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('skill', { i18n:false });


    await render(hbs`<Form::Skill @skill={{this.skill}} />`);

    assert.dom('.ui.form').exists();

  });
});

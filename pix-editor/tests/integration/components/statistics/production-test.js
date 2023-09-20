import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | statistics/production', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('areas', []);
    this.set('competenceCodes', []);

    await render(hbs`<Statistics::Production @areas={{this.areas}} @competenceCodes={{this.competenceCodes}}/>`);

    assert.dom('.ui.header').exists();

  });
});

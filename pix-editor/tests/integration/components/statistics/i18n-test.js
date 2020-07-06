import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | statistics/i18n', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('areas', []);
    this.set('competenceCodes', []);

    await render(hbs`<Statistics::I18n @areas={{this.areas}} @competenceCodes={{this.competenceCodes}}/>`);

    assert.dom('.ui.header').exists();

  });
});

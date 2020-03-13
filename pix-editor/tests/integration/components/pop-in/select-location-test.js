import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | popin-select-location', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.owner.register('service:currentData', class MockService extends Service {
      getCompetence() {
        return null;
      }
      getAreas() {
        return [];
      }
    });

    await render(hbs`{{pop-in/select-location class="test"}}`);

    assert.dom('.ember-modal-dialog').exists();
  });
});

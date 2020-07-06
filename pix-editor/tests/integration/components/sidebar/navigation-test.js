import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | sidebar/navigation', function(hooks) {
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
      getSources() {
        return [];
      }
      getSource() {
        return '';
      }
    });

    await render(hbs`<Sidebar::Navigation />`);

    assert.dom('.ui.accordion.inverted').exists();
  });
});

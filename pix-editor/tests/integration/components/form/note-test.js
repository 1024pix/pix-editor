import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | note-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('closeAction', function() {});
    this.set('editAction', function() {});
    this.set('entry', {status:false});

    await render(hbs`{{form/note close=(action closeAction) edit=(action editAction) entry=entry}}`);

    assert.dom('.ui.content').exists();

  });
});

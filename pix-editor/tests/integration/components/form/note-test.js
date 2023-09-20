import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | note-form', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('closeAction', function() {});
    this.set('editAction', function() {});
    this.set('entry', { status:false });

    await render(hbs`<Form::Note @close={{this.closeAction}}
                                 @edit={{this.editAction}}
                                 @entry={{this.entry}} />`);

    assert.dom('.ui.content').exists();

  });
});

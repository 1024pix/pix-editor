import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pop-in/new-framework', function(hooks) {
  setupRenderingTest(hooks);

  test('it should disable save button if name field is empty', async function(assert) {
    //given
    this.set('close', () => {});
    this.set('save', () => {});
    this.set('framework', { name: '' });

    //when
    await render(hbs`<PopIn::NewFramework @close={{this.close}}
                                          @save={{this.save}}
                                          @framework={{this.framework}}/>`);

    //then
    const saveButton = find('[data-test-save-action]');
    assert.ok(saveButton.disabled);
  });

  test('it should unable save button if name field is fill', async function(assert) {
    // given
    this.set('close', () => {});
    this.set('save', () => {});
    this.set('framework', { name: 'frameworkName' });

    //when
    await render(hbs`<PopIn::NewFramework @close={{this.close}}
                                          @save={{this.save}}
                                          @framework={{this.framework}}/>`);

    //then
    const saveButton = find('[data-test-save-action]');
    assert.notOk(saveButton.disabled);
  });
});

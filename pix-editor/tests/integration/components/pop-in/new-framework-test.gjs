import { find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import NewFramework from 'pix-editor/components/pop-in/new-framework';

module('Integration | Component | pop-in/new-framework', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should disable save button if name field is empty', async function (assert) {
    const self = this;

    // given
    this.close = () => {};
    this.save = () => {};
    this.framework = { name: '' };

    // when
    await render(
      <template><NewFramework @close={{self.close}} @save={{self.save}} @framework={{self.framework}} /></template>,
    );

    // then
    const saveButton = find('[data-test-save-action]');
    assert.dom(saveButton).hasAria('disabled', 'true');
  });

  test('it should unable save button if name field is fill', async function (assert) {
    const self = this;

    // given
    this.close = () => {};
    this.save = () => {};
    this.framework = { name: 'frameworkName' };

    // when
    await render(
      <template><NewFramework @close={{self.close}} @save={{self.save}} @framework={{self.framework}} /></template>,
    );

    // then
    const saveButton = find('[data-test-save-action]');
    assert.dom(saveButton).doesNotHaveAttribute('aria-disabled');
  });
});

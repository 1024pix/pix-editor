import { render } from '@1024pix/ember-testing-library';
import NewFramework from 'pixeditor/components/pop-in/new-framework';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in/new-framework', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should disable save button if name field is empty', async function (assert) {
    const self = this;

    // given
    this.close = () => {};
    this.save = () => {};
    this.framework = { name: '' };

    // when
    const screen = await render(
      <template>
        <NewFramework @close={{self.close}} @save={{self.save}} @framework={{self.framework}} @showModal={{true}} />
      </template>,
    );

    // then
    const saveButton = screen.getByRole('button', { name: /Enregistrer/, hidden: true });
    assert.dom(saveButton).exists();
  });

  test('it should unable save button if name field is fill', async function (assert) {
    const self = this;

    // given
    this.close = () => {};
    this.save = () => {};
    this.framework = { name: 'frameworkName' };

    // when
    const screen = await render(
      <template>
        <NewFramework @close={{self.close}} @save={{self.save}} @framework={{self.framework}} @showModal={{true}} />
      </template>,
    );

    // then
    const saveButton = screen.getByRole('button', { name: /Enregistrer/ });
    assert.dom(saveButton).exists();
  });
});

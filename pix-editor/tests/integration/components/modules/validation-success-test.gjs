import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModuleValidationSuccess from 'pixeditor/components/modules/validation-success';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/validation-success', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a success message and publish button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const draftModule = store.createRecord('draft-module', { internalTitle: 'Module Judy' });

    // when
    const screen = await render(<template><ModuleValidationSuccess @draftModule={{draftModule}} /></template>);

    // then
    assert.dom(screen.getByText(t('modules.components.validation-success.content'))).exists();
    assert
      .dom(
        screen.getByRole('button', {
          name: t('modules.components.publish-module-button.aria-label', { title: draftModule.internalTitle }),
        }),
      )
      .exists();
  });
});

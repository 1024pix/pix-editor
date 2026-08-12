import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModuleValidationErrors from 'pixeditor/components/modules/validation-errors';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/validation-errors', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display errors', async function (assert) {
    // given
    const validationErrors = ['Le slug est mal formatté', "Problème de duplications d'Ids"];

    // where
    const screen = await render(<template><ModuleValidationErrors @validationErrors={{validationErrors}} /></template>);

    // then
    const accordion = screen.getByRole('button', {
      name: `${t('modules.components.validation-errors.title')} ${t('modules.components.validation-errors.error-count', { count: 2 })}`,
    });
    await click(accordion);
    const listItems = screen.getAllByRole('listitem');
    assert.dom(listItems[0]).hasText('Le slug est mal formatté');
    assert.dom(listItems[1]).hasText("Problème de duplications d'Ids");
  });
});

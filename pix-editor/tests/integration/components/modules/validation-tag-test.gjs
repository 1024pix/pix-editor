import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModuleValidationTag from 'pixeditor/components/modules/validation-tag';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/validation-tag', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the module has errors', function () {
    test('it should display an error validation status', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', {
        internalTitle: 'Module Judy',
        hasBeenValidated: false,
        validationErrors: ['wouf'],
      });

      // when
      const screen = await render(
        <template><ModuleValidationTag @hasBeenValidated={{draftModule.hasBeenValidated}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('modules.draft-module.validation-failure'))).exists();
    });
  });

  module('when the module has no errors', function () {
    test('it should display success validation status', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', {
        internalTitle: 'Module Judy',
        hasBeenValidated: true,
        validationErrors: [],
      });

      // when
      const screen = await render(
        <template><ModuleValidationTag @hasBeenValidated={{draftModule.hasBeenValidated}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('modules.draft-module.validation-success'))).exists();
    });
  });
});

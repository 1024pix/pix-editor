import { render } from '@1024pix/ember-testing-library';
import ModuleValidationSuccess from 'pixeditor/components/modules/validation-success';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/validation-success', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is allowed to publish module', function () {
    test('it should display a success message and publish button', async function (assert) {
      // given
      const accessServiceStub = this.owner.lookup('service:access');
      sinon.stub(accessServiceStub, 'mayCreateOrEditModule').returns(true);
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', { internalTitle: 'Module Judy' });

      // when
      const screen = await render(<template><ModuleValidationSuccess @draftModule={{draftModule}} /></template>);

      // then
      assert.dom(screen.getByText('Aucune erreur de validation.')).exists();
      assert.dom(screen.getByText('Il est désormais possible de publier ce brouillon.')).exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: `Publier le brouillon "${draftModule.internalTitle}"`,
          }),
        )
        .exists();
    });
  });

  module('when user is not allowed to publish module', function () {
    test('it should display a success message', async function (assert) {
      // given
      const accessServiceStub = this.owner.lookup('service:access');
      sinon.stub(accessServiceStub, 'mayCreateOrEditModule').returns(false);
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', { internalTitle: 'Module Judy' });

      // when
      const screen = await render(<template><ModuleValidationSuccess @draftModule={{draftModule}} /></template>);

      // then
      assert.dom(screen.getByText('Aucune erreur de validation.')).exists();
      assert.dom(screen.getByText('Il est désormais possible de publier ce brouillon.')).exists();
      assert
        .dom(
          screen.queryByRole('button', {
            name: `Publier le brouillon "${draftModule.internalTitle}"`,
          }),
        )
        .doesNotExist();
    });
  });
});

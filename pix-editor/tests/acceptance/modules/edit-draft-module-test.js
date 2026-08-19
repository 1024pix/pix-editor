import { visit, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Acceptance | Modules | Edit Draft Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    return authenticateSession();
  });

  test('displays a breadcrumb', async function (assert) {
    // given
    const module = this.server.create('draft-module', {
      id: crypto.randomUUID(),
      internalTitle: 'MODULE_DRAFT',
      validationErrors: [],
    });

    // when
    const screen = await visit(`/modules/workbench/${module.id}/edit`);
    // WORKAROUND: let some time for monaco-editor to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // then
    const breadcrumb = screen.getByRole('navigation');
    assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.workbench.label') })).exists();
    assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.draft-module.label') })).exists();
    assert.dom(within(breadcrumb).getByText(t('modules.breadcrumb.edit-draft-module.label'))).exists();
  });

  module('when a module has errors', function () {
    test('it should display errors', async function (assert) {
      // given
      const moduleWithErrors = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        internalTitle: 'MODULE_DRAFT',
        validationErrors: ['oups !'],
        hasBeenValidated: false,
      });

      // when
      const screen = await visit(`/modules/workbench/${moduleWithErrors.id}/edit`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('modules.components.validation-errors.title', { count: 1 })} ${t('modules.components.validation-errors.information')}`,
          }),
        )
        .exists();
    });
  });

  module('when saving fails with a payload validation error', function () {
    test('it displays the error detail in the notification', async function (assert) {
      // given
      class PixToastNotificationsStub extends Service {
        sendError() {}
      }
      this.owner.register('service:notifications', PixToastNotificationsStub);
      const notificationsStub = this.owner.lookup('service:notifications');
      const pixToastSendError = sinon.stub(notificationsStub, 'sendError');

      const moduleWithErrors = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        internalTitle: 'MODULE_DRAFT',
        validationErrors: [],
      });

      this.server.patch(
        '/draft-modules/:id',
        () =>
          new Response(
            400,
            {},
            {
              errors: [
                {
                  status: '400',
                  title: 'Invalid Request Payload',
                  detail: '"data.attributes.internal-title" ne doit pas être vide',
                },
                {
                  status: '400',
                  title: 'Invalid Request Payload',
                  detail: '"data.attributes.title" est requis',
                },
              ],
            },
          ),
      );

      const screen = await visit(`/modules/workbench/${moduleWithErrors.id}/edit`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // when
      await click(await screen.findByRole('button', { name: t('modules.components.module-form.save') }));

      // then
      const expectedMessage = `${t('modules.new.draft-error')}<br><br>${t('modules.new.draft-error-detail')} internal-title ne doit pas être vide, title est requis.`;
      assert.ok(pixToastSendError.calledOnce);
      assert.strictEqual(pixToastSendError.args[0][0].toString(), expectedMessage);
    });
  });

  module('when a module has no errors', function () {
    test('it should not display errors', async function (assert) {
      // given
      const module = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        internalTitle: 'MODULE_DRAFT',
        validationErrors: [],
      });

      const screen = await visit(`/modules/workbench/${module.id}/edit`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: `${t('modules.components.validation-errors.title', { count: 1 })} ${t('modules.components.validation-errors.information')}`,
          }),
        )
        .doesNotExist();
    });
  });
});

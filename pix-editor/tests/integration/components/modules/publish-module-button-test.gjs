import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import PublishModuleButton from 'pixeditor/components/modules/publish-module-button';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/publish-module-button', function (hooks) {
  setupIntlRenderingTest(hooks);

  let loaderStopStub, sendSuccessStub, sendErrorStub, replaceWithStub;

  hooks.beforeEach(function () {
    const loader = this.owner.lookup('service:loader');
    loaderStopStub = sinon.stub(loader, 'stop');

    class NotificationsStub extends Service {
      sendSuccess() {}
      sendError() {}
    }
    this.owner.register('service:notifications', NotificationsStub);
    const notifications = this.owner.lookup('service:notifications');
    sendSuccessStub = sinon.stub(notifications, 'sendSuccess');
    sendErrorStub = sinon.stub(notifications, 'sendError');

    class RouterStub extends Service {
      replaceWith = sinon.stub();
    }
    this.owner.register('service:router', RouterStub);
    replaceWithStub = this.owner.lookup('service:router').replaceWith;
  });

  test('it publishes the draft module and redirects to the production module', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const draftModule = store.createRecord('draft-module', { internalTitle: 'Mon module' });
    const publishedModule = store.createRecord('module', { id: 'moduleId', internalTitle: 'Mon module' });
    sinon.stub(draftModule, 'publish').resolves(publishedModule);

    const screen = await render(<template><PublishModuleButton @draftModule={{draftModule}} /></template>);

    // when
    await click(
      screen.getByRole('button', {
        name: t('modules.components.publish-module-button.aria-label', { title: 'Mon module' }),
      }),
    );

    // then
    assert.ok(
      sendSuccessStub.calledWith(t('modules.components.publish-module-button.success', { title: 'Mon module' })),
    );
    assert.ok(replaceWithStub.calledWith('authenticated.modules.production-module', 'moduleId'));
    assert.ok(loaderStopStub.calledOnce);
  });

  module('when publication fails because of validation errors', function () {
    test('it displays a specific notification', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', { internalTitle: 'Mon module' });
      sinon.stub(draftModule, 'publish').rejects({ errors: [{ code: 'DRAFT_MODULE_VALIDATION_ERROR' }] });

      const screen = await render(<template><PublishModuleButton @draftModule={{draftModule}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('modules.components.publish-module-button.aria-label', { title: 'Mon module' }),
        }),
      );

      // then
      assert.ok(sendErrorStub.calledWith(t('modules.components.publish-module-button.validation-error')));
    });
  });

  module('when publication fails for another reason', function () {
    test('it displays a generic error notification', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', { internalTitle: 'Mon module' });
      sinon.stub(draftModule, 'publish').rejects(new Error('boom'));

      const screen = await render(<template><PublishModuleButton @draftModule={{draftModule}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('modules.components.publish-module-button.aria-label', { title: 'Mon module' }),
        }),
      );

      // then
      assert.ok(sendErrorStub.calledWith(t('modules.components.publish-module-button.error')));
    });
  });
});

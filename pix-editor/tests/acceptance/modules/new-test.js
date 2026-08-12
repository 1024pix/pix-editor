import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

const isChrome = navigator?.userAgent?.includes(' Chrome/');

module('Acceptance | Modules | New', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    return authenticateSession();
  });

  module.if('when creating a new module', !isChrome, function () {

    test('displays a breadcrumb', async function (assert) {
      // when
      const screen = await visit('/');

      await click(await screen.findByRole('link', { name: 'Modules' }));
      await click(
        await screen.findByRole('link', { name: t('modules.components.create-module-button.create-module') }),
      );

      // then
      const breadcrumb = screen.getByRole('navigation');

      assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.all-modules.label') })).exists();
      assert.dom(within(breadcrumb).getByText(t('modules.breadcrumb.new-module.label'))).exists();

      // WORKAROUND: let some time for Monaco
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    test('works correctly', async function (assert) {
      // when
      const screen = await visit('/');

      await click(await screen.findByRole('link', { name: 'Modules' }));
      await click(
        await screen.findByRole('link', { name: t('modules.components.create-module-button.create-module') }),
      );

      // then
      assert.dom(await screen.findByRole('heading', { name: t('modules.new.module-title') })).exists();
      assert.strictEqual(currentURL(), '/modules/workbench/new');

      await fillIn(
        await screen.findByRole('textbox', {
          name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
        }),
        'NEW_MODULE',
      );

      await fillIn(
        await screen.findByLabelText(t('modules.components.module-form.content-label')),
        JSON.stringify({
          title: 'Nouveau module',
          isBeta: true,
          slug: 'slug',
          visibility: 'public',
          details: {
            level: 'novice',
          },
          sections: [
            {
              id: 'section1',
            },
            {
              id: 'section2',
            },
          ],
          glossary: [
            {
              word: 'pouet',
              definition: 'sound',
            },
          ],
        }),
      );

      // WORKAROUND: let some time for Monaco
      await new Promise((resolve) => setTimeout(resolve, 100));

      await screen.getByRole('button', { name: t('modules.components.module-form.save') }).click();

      assert.dom(await screen.findByRole('heading', { name: t('modules.workbench.title') })).exists();
      assert.strictEqual(currentURL(), '/modules/workbench');
      assert.dom(screen.getByText('NEW_MODULE')).exists();
      assert.dom(await screen.findByText(t('modules.new.module-success', { title: 'NEW_MODULE' }))).exists();
    });
  });

  module.if('when creating a draft from an existing module', !isChrome, function (hooks) {
    let id;
    const internalTitle = 'MON_BEAU_MODULE';

    hooks.beforeEach(function () {
      id = crypto.randomUUID();
      this.server.create('module', { id, internalTitle });
    });

    test('displays a breadcrumb with detail module page', async function (assert) {
      // when
      const screen = await visit(`/modules/workbench/new?moduleId=${id}`);

      // then
      const breadcrumb = screen.getByRole('navigation');
      assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.production.label') })).exists();
      assert
        .dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.production-module.label') }))
        .exists();
      assert.dom(within(breadcrumb).getByText(t('modules.breadcrumb.new-module.label'))).exists();

      // WORKAROUND: let some time for Monaco
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    test('creates a new draft', async function (assert) {
      // when
      const screen = await visit(`/modules/workbench/new?moduleId=${id}`);

      // then
      assert.dom(await screen.findByRole('heading', { name: t('modules.new.draft-title') })).exists();
      assert.strictEqual(currentURL(), `/modules/workbench/new?moduleId=${id}`);

      await fillIn(
        await screen.findByRole('textbox', {
          name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
        }),
        'MOD_666',
      );

      // WORKAROUND: let some time for Monaco
      await new Promise((resolve) => setTimeout(resolve, 100));

      await screen.getByRole('button', { name: t('modules.components.module-form.save') }).click();

      assert.dom(await screen.findByRole('heading', { name: t('modules.draft-module.title') })).exists();
      assert.strictEqual(currentURL(), `/modules/workbench/${id}`);
      assert.dom(await screen.findByRole('heading', { name: 'MOD_666' })).exists();
      assert.dom(await screen.findByText(t('modules.new.draft-success', { title: 'MOD_666' }))).exists();
    });
  });
});

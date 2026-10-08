import { visit, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

const isChrome = navigator?.userAgent?.includes(' Chrome/');

module('Acceptance | Modules | New', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user is allowed to create draft modules', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'admin' });

      return authenticateSession();
    });

    module('when saving fails with a payload validation error', function () {
      test('displays the error detail in the notification', async function (assert) {
        // given
        class PixToastNotificationsStub extends Service {
          sendError() {}
        }
        this.owner.register('service:notifications', PixToastNotificationsStub);
        const notificationsStub = this.owner.lookup('service:notifications');
        const pixToastSendError = sinon.stub(notificationsStub, 'sendError');

        this.server.post(
          '/draft-modules',
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
                ],
              },
            ),
        );

        const screen = await visit('/');

        await click(await screen.findByRole('link', { name: 'Modules' }));
        await click(await screen.findByRole('link', { name: 'Créer un module' }));

        await fillIn(await screen.findByRole('textbox', { name: 'Titre interne *' }), 'NEW_MODULE');

        await fillIn(
          await screen.findByLabelText('Contenu (JSON)'),
          JSON.stringify({
            title: 'Nouveau module',
            isBeta: true,
            slug: 'slug',
            visibility: 'public',
            details: {
              level: 'novice',
            },
            sections: [],
            glossary: [],
          }),
        );

        // WORKAROUND: let some time for Monaco
        await new Promise((resolve) => setTimeout(resolve, 100));

        // when
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        const expectedMessage = `Une erreur est survenue lors de l’enregistrement du draft.<br><br>Détail de l’erreur : internal-title ne doit pas être vide.`;
        assert.ok(pixToastSendError.calledOnce);
        assert.strictEqual(pixToastSendError.args[0][0].toString(), expectedMessage);
      });
    });

    module.if('when creating a new module', !isChrome, function () {
      test('displays a breadcrumb', async function (assert) {
        // when
        const screen = await visit('/');

        await click(await screen.findByRole('link', { name: 'Modules' }));
        await click(await screen.findByRole('link', { name: 'Créer un module' }));

        // then
        const breadcrumb = screen.getByRole('navigation');

        assert.dom(within(breadcrumb).getByRole('link', { name: 'Liste des modules' })).exists();
        assert.dom(within(breadcrumb).getByText('Création du brouillon')).exists();

        // WORKAROUND: let some time for Monaco
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      test('works correctly', async function (assert) {
        // when
        const screen = await visit('/');

        await click(await screen.findByRole('link', { name: 'Modules' }));
        await click(await screen.findByRole('link', { name: 'Créer un module' }));

        // then
        assert.dom(await screen.findByRole('heading', { name: 'Création d’un module' })).exists();
        assert.strictEqual(currentURL(), '/modules/workbench/new');

        await fillIn(
          await screen.findByRole('textbox', {
            name: new RegExp(`^Titre interne`),
          }),
          'NEW_MODULE',
        );

        await fillIn(
          await screen.findByLabelText('Contenu (JSON)'),
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

        await screen.getByRole('button', { name: 'Enregistrer' }).click();

        assert.dom(await screen.findByRole('heading', { name: 'Modules' })).exists();
        assert.strictEqual(currentURL(), '/modules/workbench');
        assert.dom(screen.getByText('NEW_MODULE')).exists();
        assert.dom(await screen.findByText('Le module "NEW_MODULE" a été enregistré.')).exists();
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
        assert.dom(within(breadcrumb).getByRole('link', { name: 'Liste des modules en production' })).exists();
        assert.dom(within(breadcrumb).getByRole('link', { name: 'Détail du module' })).exists();
        assert.dom(within(breadcrumb).getByText('Création du brouillon')).exists();

        // WORKAROUND: let some time for Monaco
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      test('creates a new draft', async function (assert) {
        // when
        const screen = await visit(`/modules/workbench/new?moduleId=${id}`);

        // then
        assert.dom(await screen.findByRole('heading', { name: 'MON_BEAU_MODULE' })).exists();
        assert.strictEqual(currentURL(), `/modules/workbench/new?moduleId=${id}`);

        await fillIn(
          await screen.findByRole('textbox', {
            name: new RegExp(`^${'Titre interne'}`),
          }),
          'MOD_666',
        );

        // WORKAROUND: let some time for Monaco
        await new Promise((resolve) => setTimeout(resolve, 100));

        await screen.getByRole('button', { name: 'Enregistrer' }).click();
        assert.dom(await screen.findByRole('heading', { name: 'MOD_666' })).exists();
        assert.strictEqual(currentURL(), `/modules/workbench/${id}`);
        assert.dom(await screen.findByRole('heading', { name: 'MOD_666' })).exists();
        assert.dom(await screen.findByText('Le draft "MOD_666" a été enregistré.')).exists();
      });
    });
  });

  module('when user is not allowed to create draft modules', function () {
    test('it redirects to module list page', async function (assert) {
      // given
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'readonly' });

      await authenticateSession();

      await visit('/modules/workbench/new');

      // then
      assert.strictEqual(currentURL(), '/modules/production');
    });
  });
});

import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL, fillIn } from '@ember/test-helpers';
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

    this.server.createList('module', 2);

    return authenticateSession();
  });

  test.if('creates a new module', !isChrome, async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');
    await screen.getByRole('link', { name: 'Créer un module' }).click();

    // then
    assert.strictEqual(currentURL(), '/modules/new');
    assert.dom(await screen.findByRole('heading', { name: "Création d'un module" })).exists();

    await fillIn(await screen.findByRole('textbox', { name: /^Titre interne/ }), 'NEW_MODULE');

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

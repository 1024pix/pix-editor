import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

const isChrome = navigator?.userAgent?.includes(' Chrome/');

module('Acceptance | Modules | New', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.createList('module-summary', 2);

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

    const editor = await screen.findByLabelText('Contenu (JSON)');

    await fillIn(
      editor,
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

    await screen.getByRole('button', { name: 'Enregistrer' }).click();

    assert.dom(await screen.findByRole('heading', { name: 'Modules' })).exists();
    assert.dom(await screen.findByText('Nouveau module')).exists();
    assert.dom(await screen.findByText('Le module "Nouveau module" a été enregistré.')).exists();
  });
});

import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { getByRole } from '@testing-library/dom';
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

    await click(await screen.findByRole('link', { name: 'Modules' }));
    await click(await screen.findByRole('link', { name: 'Créer un module' }));

    // then
    assert.dom(await screen.findByRole('heading', { name: 'Création d’un module' })).exists();
    assert.strictEqual(currentURL(), '/modules/workbench/new');

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

  test.if('creates a new draft', !isChrome, async function (assert) {
    // when
    const screen = await visit('/');

    await click(await screen.findByRole('link', { name: 'Modules' }));

    await click(await screen.findByRole('link', { name: 'En production' }));

    assert.dom(await screen.findByText('MOD_0')).exists();
    const firstModule = screen.getByText('MOD_0').closest('tr');
    await click(getByRole(firstModule, 'link', { name: 'Voir le détail' }));

    const [, moduleId] = currentURL().match(/\/modules\/production\/(.*)$/);

    await new Promise((resolve) => setTimeout(resolve, 100));
    await screen.getByRole('link', { name: 'Créer un draft' }).click();

    // then
    assert.dom(await screen.findByRole('heading', { name: 'Création d’un draft' })).exists();
    assert.strictEqual(currentURL(), `/modules/workbench/new?moduleId=${moduleId}`);

    await fillIn(await screen.findByRole('textbox', { name: /^Titre interne/ }), 'MOD_666');

    // WORKAROUND: let some time for Monaco
    await new Promise((resolve) => setTimeout(resolve, 100));

    await screen.getByRole('button', { name: 'Enregistrer' }).click();

    assert.dom(await screen.findByRole('heading', { name: 'Détail du draft de module' })).exists();
    assert.strictEqual(currentURL(), `/modules/workbench/${moduleId}`);
    assert.dom(await screen.findByRole('heading', { name: 'MOD_666' })).exists();
    assert.dom(await screen.findByText('Le draft "MOD_666" a été enregistré.')).exists();
  });
});

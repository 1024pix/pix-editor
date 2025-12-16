import { clickByText, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Create-Tutorial', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let competence, skill;
  hooks.beforeEach(function () {
    this.server.create('config', { tutorialLocaleToLanguageMap: { fr: 'Français' } });

    this.server.create('user', { trigram: 'ABC' });
    this.server.create('tag', { id: 'recTag1' });
    this.server.create('tutorial', { id: 'recTuto1', source: 'ma source' });

    this.server.create('challenge', { id: 'recChallenge1' });

    skill = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkillWorkbench', name: '@workbench', code: null });

    this.server.create('tube', { id: 'recTube1', name: 'monTube', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTubeWorkbench', name: '@workbench', rawSkillIds: ['recSkillWorkbench'] });

    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recThemeWorkbench', name: 'workbench_1_1', rawSkillIds: ['recTubeWorkbench'] });
    competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      code: '1',
      title: 'Titre compétence',
      pixId: 'pixId recCompetence1.1',
      rawThemeIds: ['recTheme1', 'recThemeWorkbench'],
      rawTubeIds: ['recTube1', 'recTubeWorkbench'],
    });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1' });

    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [],
    });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-workbench`,
      thematicOverviews: [],
    });

    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('area', {
      id: 'recArea2',
      name: '2. Communication et collaboration',
      code: '2',
      competenceIds: ['recCompetence2.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
  });

  test('create a new tutorial', async function (assert) {
    // when
    const screen = await visit(`/competence/${competence.id}/skills/${skill.id}?view=production`);
    await click(screen.getByRole('button', { name: 'Modifier' }));
    const createTutorialLink = screen.getByRole('button', {
      name: 'Ajouter un tutoriel Pour réussir la prochaine fois',
    });

    await click(createTutorialLink);

    await fillByLabel('Titre *', 'Titre de mon tutoriel');

    await clickByText('Langue');
    await click(await screen.findByRole('option', { name: 'Français' }));

    await fillByLabel('Lien *', 'http://www.google.com');

    await clickByText('Source');
    await fillByLabel('Rechercher une source', 'ma source');
    await click(await screen.findByRole('option', { name: 'ma source' }));

    await clickByText('Format');
    await click(await screen.findByRole('option', { name: 'jeu' }));

    await clickByText('Niveau');
    await click(await screen.findByRole('option', { name: '2' }));

    await fillByLabel('Durée (hh:mm:ss) *', '12:30:00');

    await clickByText('Rechercher tags');
    await fillByLabel('Rechercher tags', 'Super tag');
    await clickByText('Ajouter');

    assert.strictEqual(screen.getAllByText('Super tag').length, 2);
    assert.dom(screen.getByRole('button', { name: 'Supprimer le tag: Super tag' })).exists();

    const dialog = screen.getByRole('dialog', { name: 'Créer un tutoriel' });
    // BUG : need one click to lose focus, then another click to the button WE DONT KNOW WHY
    await click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    await click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    const modifyButton = await screen.findByRole('button', { name: 'Modifier le tutoriel' });
    await click(modifyButton);

    // then
    assert.dom('[data-test-main-message]').hasText('Tutoriel enregistré');

    assert.dom(screen.getByText('Titre de mon tutoriel')).exists();

    const languageMenu = await screen.getByLabelText('Langue *');
    assert.strictEqual(languageMenu.textContent.trim(), 'Français');
    assert.dom(languageMenu).selected;

    assert.dom(screen.getByLabelText('Lien *')).hasValue('http://www.google.com');

    const formatMenu = await screen.getByLabelText('Format *');
    assert.strictEqual(formatMenu.textContent.trim(), 'jeu');
    assert.dom(formatMenu).selected;

    assert.dom(screen.getByLabelText('Durée (hh:mm:ss) *')).hasValue('12:30:00');
    await clickByText('Niveau');
    assert.dom(await screen.findByRole('option', { name: '2' })).hasAria('selected', 'true');
    await clickByText('Niveau');
    await clickByText('Licence');
    assert.dom(await screen.findByRole('option', { name: 'Licence non renseignée' })).hasAria('selected', 'true');

    assert.strictEqual(screen.getAllByText('Super tag').length, 2);
  });

  test('verify if the url link is valid', async function (assert) {
    // when
    const screen = await visit(`/competence/${competence.id}/skills/${skill.id}?view=production`);
    await clickByText('Modifier');
    const createTutorialLink = screen.getByRole('button', {
      name: 'Ajouter un tutoriel Pour réussir la prochaine fois',
    });

    await click(createTutorialLink);

    await fillByLabel('Titre *', 'Titre de mon tutoriel');

    await clickByText('Langue');
    await click(await screen.findByRole('option', { name: 'Français' }));

    await fillByLabel('Lien *', 'PAS BON LE LINK');

    await clickByText('Source');
    await fillByLabel('Rechercher une source', 'ma source');
    await click(await screen.findByRole('option', { name: 'ma source' }));

    await clickByText('Format');
    await click(await screen.findByRole('option', { name: 'jeu' }));

    await fillByLabel('Durée (hh:mm:ss) *', '12:30:00');

    const dialog = screen.getByRole('dialog', { name: 'Créer un tutoriel' });
    await click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    assert.dom(screen.getByText('Lien du tutoriel non valide')).exists();
    assert.dom(screen.getByLabelText('Lien *')).hasValue('PASBONLELINK');
  });
});

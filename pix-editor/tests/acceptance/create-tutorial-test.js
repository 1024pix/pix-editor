import { clickByText, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Create-Tutorial', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let competence, skill;
  hooks.beforeEach(function () {
    this.server.create('config', { tutorialLocaleToLanguageMap: { fr: 'Français' } });

    this.server.create('user', { trigram: 'ABC' });
    this.server.create('tag', { id: 'recTag1' });

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
    // given
    const store = this.owner.lookup('service:store');

    // when
    const screen = await visit(`/competence/${competence.id}/skills/${skill.id}?view=production`);
    await click(screen.getByRole('button', { name: 'Modifier' }));
    const createTutorialLink = screen.getByRole('button', {
      name: 'Ajouter un tutoriel Pour réussir la prochaine fois',
    });

    await click(createTutorialLink);

    await fillByLabel('Titre *', 'Titre de mon tutoriel');

    await clickByText('Langue');
    await screen.findByRole('listbox');
    await screen.getByRole('option', { name: 'Français' }).click();

    await fillByLabel('Lien *', 'http://www.google.com');

    await clickByText('Source');
    await fillIn(screen.getByPlaceholderText('Rechercher une source'), 'ma source');
    await screen.findByRole('listbox');
    await click(await screen.findByRole('option', { name: 'ma source' }));

    await clickByText('Licence');
    await screen.findByRole('listbox');
    await click(await screen.findByRole('option', { name: 'Youtube' }));

    await clickByText('Format');
    await screen.findByRole('listbox');
    await click(await screen.findByRole('option', { name: 'jeu' }));

    await clickByText('Niveau');
    await screen.findByRole('listbox');
    await click(await screen.findByRole('option', { name: '2' }));

    await fillByLabel('Durée (hh:mm:ss) *', '12:30:00');

    await clickByText('Rechercher tags');
    await fillIn(screen.getByPlaceholderText('Rechercher un tag'), 'Super tag');
    await screen.findByRole('menu');
    await clickByText('Ajouter');

    assert.dom(screen.getByRole('button', { name: 'Supprimer le tag: Super tag' })).exists();

    const dialog = screen.getByRole('dialog', { name: 'Créer un tutoriel' });
    // BUG : need one click to lose focus, then another click to the button WE DONT KNOW WHY
    await click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    await click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    // then
    const tutorial = await store.peekAll('tutorial')[0];
    assert.dom(screen.getByText('Tutoriel enregistré')).exists();

    assert.strictEqual(tutorial.title, 'Titre de mon tutoriel');
    assert.strictEqual(tutorial.duration, '12:30:00');
    assert.strictEqual(tutorial.source, 'ma source');
    assert.strictEqual(tutorial.format, 'jeu');
    assert.strictEqual(tutorial.link, 'http://www.google.com');
    assert.strictEqual(tutorial.license, 'Youtube');
    assert.strictEqual(tutorial.level, '2');
    assert.notOk(tutorial.crush);
    assert.strictEqual(tutorial.language, 'fr');
    assert.strictEqual(tutorial.tagsTitle, 'Super tag');
  });

  test('verify if the url link is valid', async function (assert) {
    // given
    this.server.create('tutorial', {
      id: 'tutoId',
      title: 'mon tuto',
    });
    skill.update({ tutoSolutionIds: ['tutoId'] });

    // when
    const screen = await visit(`/competence/${competence.id}/skills/${skill.id}?view=production`);
    await clickByText('Modifier');

    await click(
      screen.getByRole('button', {
        name: 'Modifier le tutoriel',
      }),
    );
    await fillByLabel('Lien *', 'PAS BON LE LINK');

    const dialog = screen.getByRole('dialog', { name: 'Modifier un tutoriel' });
    await click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    assert.dom(screen.getByText('Lien du tutoriel non valide')).exists();
    assert.dom(screen.getByLabelText('Lien *')).hasValue('PASBONLELINK');
  });
});

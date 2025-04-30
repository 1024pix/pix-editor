import { clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, fillIn, find, waitUntil } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Create-Tutorial', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let competence, skill;
  hooks.beforeEach(function() {
    this.server.create('config', {
      tutorialLocaleToLanguageMap: {
        fr: 'Français',
      },
    });

    this.server.create('user', { trigram: 'ABC' });
    this.server.create('tag', { id: 'recTag1',
    });
    this.server.create('tutorial', { id: 'recTuto1', source: 'ma source' });

    this.server.create('challenge', { id: 'recChallenge1' });

    skill = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkillWorkbench', name: '@workbench', code: null });

    this.server.create('tube', { id: 'recTube1', name: 'monTube', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTubeWorkbench', name: '@workbench', rawSkillIds: ['recSkillWorkbench'] });

    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recThemeWorkbench', name: 'workbench_1_1', rawSkillIds: ['recTubeWorkbench'] });
    competence = this.server.create('competence', { id: 'recCompetence1.1', code: '1', title: 'Titre compétence', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1', 'recThemeWorkbench'], rawTubeIds: ['recTube1', 'recTubeWorkbench'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1' });

    this.server.create('competence-overview', { id: `${competence.pixId}:challenges-production`, thematicOverviews: [] });
    this.server.create('competence-overview', { id: `${competence.pixId}:challenges-workbench`, thematicOverviews: [] });

    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
  });

  test('create a new tutorial', async function(assert) {

    // when
    const screen = await visit(`/competence/${competence.id}/skills/${skill.id}?view=production`);
    await clickByText('Modifier');
    const createTutorialLink = screen.getByRole('link', {
      name: 'Ajouter un tutoriel Pour réussir la prochaine fois',
    });

    await click(createTutorialLink);

    await fillByLabel('Titre *', 'Titre de mon tutoriel');
    await clickByText('Langue');
    await click(await screen.findByRole('option', { name: 'Français' }));
    await fillByLabel('Lien *', 'http://www.google.com');

    await click(find('[data-test-select-source-for-tutorial] .ember-basic-dropdown-trigger'));
    await fillIn('input.ember-power-select-search-input', 'ma source');
    await waitUntil(function() {
      return find('.tutorial-search li');
    }, { timeout: 1000 });
    await click(find('.tutorial-search li'));

    await clickByText('Format');
    await click(await screen.findByRole('option', { name: 'jeu' }));

    await fillByLabel('Durée (hh:mm:ss) *', '12:30:00');

    await click(find('[data-test-tag-search] .ember-basic-dropdown-trigger'));
    await fillIn('input.ember-power-select-search-input', 'mon tag');
    await waitUntil(function() {
      return find('.tutorial-search li');
    }, { timeout: 1000 });
    await click(find('.tutorial-search li'));

    await click(find('[data-test-save-tutorial-button]'));

    const modifieButton = await screen.findByRole('button', { name: 'Modifier le tutoriel' });
    await click(modifieButton);

    // then
    assert.dom('[data-test-main-message]').hasText('Tutoriel créé');

    assert.dom(screen.getByText('Titre de mon tutoriel')).exists();
    assert.dom(screen.getByText('Français')).exists();
    assert.dom(screen.getByLabelText('Lien *')).hasValue('http://www.google.com');
    assert.dom(screen.getByText('jeu')).exists();
    assert.dom(screen.getByLabelText('Durée (hh:mm:ss) *')).hasValue('12:30:00');
    assert.dom(screen.getByText('mon tag')).exists();
  });
  test('verify if the url link is valid', async function(assert) {

    // when
    const screen = await visit(`/competence/${competence.id}/skills/${skill.id}?view=production`);
    await clickByText('Modifier');
    const createTutorialLink = screen.getByRole('link', {
      name: 'Ajouter un tutoriel Pour réussir la prochaine fois',
    });

    await click(createTutorialLink);

    await fillByLabel('Titre *', 'Titre de mon tutoriel');
    await clickByText('Langue');
    await click(await screen.findByRole('option', { name: 'Français' }));
    await fillByLabel('Lien *', 'PAS BON LE LINK');

    await click(find('[data-test-select-source-for-tutorial] .ember-basic-dropdown-trigger'));
    await fillIn('input.ember-power-select-search-input', 'ma source');
    await waitUntil(function() {
      return find('.tutorial-search li');
    }, { timeout: 1000 });
    await click(find('.tutorial-search li'));

    await clickByText('Format');
    await click(await screen.findByRole('option', { name: 'jeu' }));

    await fillByLabel('Durée (hh:mm:ss) *', '12:30:00');

    await click(find('[data-test-save-tutorial-button]'));

    assert.dom(screen.getByText('Lien du tutoriel non valide')).exists();
    assert.dom(screen.getByLabelText('Lien *')).hasValue('PAS BON LE LINK');

  });
});


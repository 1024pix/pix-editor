import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Controller | Get Alternative challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let competence, prototype, alternative;

  hooks.beforeEach(function () {
    this.server.create('config', {
      id: 'pix-editor-global-config',
      localeToLanguageMap: {
        fr: 'Francophone',
      },
    });
    this.server.create('user', { trigram: 'ABC' });

    prototype = this.server.create('challenge', {
      id: 'challenge1',
      version: 1,
      status: 'validé',
      genealogy: 'Prototype 1',
    });
    alternative = this.server.create('challenge', {
      id: 'challenge1-1',
      status: 'validé',
      genealogy: 'Décliné 1',
      version: 1,
      alternativeVersion: 1,
      instruction: 'Ma consigne déclinée',
      alternativeInstruction: 'Ma consigne alternative',
      type: 'QCU',
      autoReply: false,
      proposals: 'Mes propositions',
      solution: 'Ma solution',
      solutionToDisplay: 'Ma solution à afficher',
      embedURL: 'https://mon-embed-url.pop',
      embedHeight: 500,
      embedTitle: 'Titre de mon embed',
      urlsToConsult: ['https://test-aleternative.pop'],
      locales: ['fr'],
      geography: 'BR',
      validatedAt: '2021-10-02T14:00:00.000Z',
      updatedAt: '2021-10-02T14:00:00.000Z',
    });
    const skill = this.server.create('skill', {
      id: 'recSkill1',
      name: '@sujet1',
      challengeIds: ['challenge1', 'challenge1-1'],
      level: 1,
    });

    const tube = this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'pixId recCompetence1.1',
      rawThemeIds: ['recTheme1'],
      rawTubeIds: ['recTube1'],
    });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [
        {
          id: thematic.id,
          name: thematic.name,
          tubeOverviews: [
            {
              id: tube.id,
              name: tube.name,
              skillOverviews: [
                {
                  id: skill.id,
                  name: skill.name,
                  prototypeId: prototype.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 0,
                  validatedChallengesCount: 2,
                },
                null,
                null,
                null,
                null,
                null,
                null,
              ],
            },
          ],
        },
      ],
    });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('it should display the alternative challenge', async function (assert) {
    // when
    const screen = await visit('/');
    await click(screen.getByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code Title' }));

    await click(screen.getByRole('link', { name: '@sujet1 2' }));
    await click(screen.getByRole('button', { name: 'Déclinaisons >>' }));
    await click(screen.getByRole('cell', { name: 'Ma consigne déclinée' }));

    // then
    const alternativePanel = within(screen.getByTestId('panel-alternative-challenge'));

    assert.dom(alternativePanel.getByText('Ma consigne déclinée')).exists();
    assert.dom(screen.getByText('Ma consigne alternative')).exists();
    assert.dom(screen.getByText('Mes propositions')).exists();

    assert.dom(alternativePanel.getByLabelText('Réponses')).hasValue('Ma solution');
    assert.dom(screen.getByLabelText('Bonne réponse à afficher')).hasValue('Ma solution à afficher');
    assert
      .dom(screen.getByLabelText("URLs externes nécessaires à la résolution de l'épreuve"))
      .hasValue('https://test-aleternative.pop');
    assert.dom(alternativePanel.getByLabelText('URL :')).hasValue('https://mon-embed-url.pop');
    assert.dom(alternativePanel.getByLabelText('Hauteur :')).hasValue('500');
    assert.dom(alternativePanel.getByLabelText('Titre :')).hasValue('Titre de mon embed');
    assert.strictEqual(alternativePanel.getByLabelText('Langue(s)').textContent.trim(), 'Francophone');
    assert.strictEqual(alternativePanel.getByLabelText('Géographie').textContent.trim(), 'Brésil');

    assert.dom(alternativePanel.getByLabelText('Id :')).hasValue('challenge1-1');
  });

  test('it should be switchable with the prototype', async function (assert) {
    // given
    const screen = await visit(
      `/competence/${competence.id}/prototypes/${prototype.id}/alternatives/${alternative.id}`,
    );

    // when
    await click(screen.getByRole('button', { name: 'Inverser avec le prototype' }));
    await click(await screen.findByRole('button', { name: 'Oui' }));

    // then
    assert.dom(await screen.findByText('Inversion effectuée')).exists();
    assert.ok(currentURL().startsWith(`/competence/${competence.id}/prototypes/${alternative.id}`));
    assert.dom(await screen.findByText('Ma consigne déclinée')).exists();
  });

  test('it should not show the switch button when user is not admin', async function (assert) {
    // given
    this.server.db.users.remove();
    this.server.create('user', { trigram: 'DEF', access: 'editor' });

    const screen = await visit(
      `/competence/${competence.id}/prototypes/${prototype.id}/alternatives/${alternative.id}`,
    );

    // when then
    assert.dom(screen.queryByRole('button', { name: 'Inverser avec le prototype' })).doesNotExist();
  });
});

import { clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, find } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { waitForSelectToBeClosed } from 'pixeditor/tests/helpers/wait-for-select-to-be-closed';
import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Modify-Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    return authenticateSession();
  });

  module('modifying a draft challenge', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('challenge', {
        id: 'recChallenge1',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: 'Prototype 1',
        version: 1,
        status: 'proposé',
        instruction:
          "Cliquer sur instructions du proto pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        geography: 'FR',
      });
      this.server.create('challenge', {
        id: 'recChallenge2',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: 'Décliné 1',
        version: 1,
        status: 'proposé',
        instruction: 'Cliquer sur instructions de la décli pour interagir avec',
        geography: 'FR',
      });
      const skill = this.server.create('skill', {
        id: 'recSkill1',
        level: 2,
        name: '@trululu2',
        challengeIds: ['recChallenge1', 'recChallenge2'],
        status: 'en construction',
      });
      const tube = this.server.create('tube', { id: 'recTube1', name: '@trululu', rawSkillIds: ['recSkill1'] });
      const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
      const competence = this.server.create('competence', {
        id: 'recCompetence1.1',
        code: '1',
        title: 'titre compétence',
        pixId: 'pixId recCompetence1.1',
        rawThemeIds: ['recTheme1'],
        rawTubeIds: ['recTube1'],
      });
      this.server.create('competence-overview', {
        id: `${competence.pixId}:challenges-production`,
        thematicOverviews: [],
      });
      this.server.create('competence-overview', {
        id: `${competence.pixId}:challenges-workbench`,
        thematicOverviews: [
          {
            airtableId: thematic.id,
            name: thematic.name,
            tubeOverviews: [
              {
                airtableId: tube.id,
                name: tube.name,
                skillOverviews: [
                  {
                    airtableId: skill.id,
                    name: skill.name,
                    proposedChallengesCount: 2,
                    validatedChallengesCount: 0,
                    archivedChallengesCount: 0,
                    obsoleteChallengesCount: 0,
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
    });

    test('can modify attributes when challenge is a prototype', async function (assert) {
      const screen = await visit('/');
      await clickByText('1. Information et données');
      await clickByText('1 titre compétence');
      await clickByText('Atelier');
      await clickByText('@trululu2');
      await clickByText(
        "Cliquer sur instructions du proto pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
      );
      await clickByText('Modifier');
      await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
      await fillByLabel(
        "URLs externes nécessaires à la résolution de l'épreuve",
        ' https://mon-url.com \n mon-autre-url.com',
      );
      await clickByText('Épreuve de sensibilisation');
      await clickByText('Accès GAFAM requis');
      await clickByText('Épreuve à revoir');
      await clickByText('Incompatible iPad certif');
      await clickByText('Sans validation (Pix Junior)');
      await clickByText("Validation par l'embed (Pix Junior)");
      await clickByText('Sourds et malentendants');
      await click(await screen.findByRole('option', { name: 'RAS' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Non voyant');
      await click(await screen.findByRole('option', { name: 'OK' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Daltonien');
      await click(await screen.findByRole('option', { name: 'KO' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Spoil');
      await click(await screen.findByRole('option', { name: 'Facilement Sp' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Responsive');
      await click(await screen.findByRole('option', { name: 'Non' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Géographie');
      await click(await screen.findByRole('option', { name: 'Japon' }));
      await waitForSelectToBeClosed(screen);
      await click(find('[data-test-save-challenge-button]'));
      await click(find('[data-test-confirm-log-approve]'));

      const challenge = await store.peekRecord('challenge', 'recChallenge1');
      assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
      assert.deepEqual(challenge.urlsToConsult, ['https://mon-url.com']);
      assert.dom(await find('[data-test-save-challenge-button]')).doesNotExist();
      assert.strictEqual((await screen.getByLabelText('Sourds et malentendants')).childNodes[3].textContent, 'RAS');
      assert.strictEqual((await screen.getByLabelText('Non voyant')).childNodes[3].textContent, 'OK');
      assert.strictEqual((await screen.getByLabelText('Daltonien')).childNodes[3].textContent, 'KO');
      assert.strictEqual((await screen.getByLabelText('Spoil')).childNodes[3].textContent, 'Facilement Sp');
      assert.strictEqual((await screen.getByLabelText('Responsive')).childNodes[3].textContent, 'Non');
      assert.strictEqual((await screen.getByLabelText('Géographie')).childNodes[3].textContent, 'Japon');
      assert.true(screen.getByRole('checkbox', { name: 'Épreuve de sensibilisation' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'Accès GAFAM requis' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'Épreuve à revoir' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'Incompatible iPad certif' }).checked);
      assert.true(screen.getByRole('checkbox', { name: 'Sans validation (Pix Junior)' }).checked);
      assert.true(screen.getByRole('checkbox', { name: "Validation par l'embed (Pix Junior)" }).checked);
    });

    test('can modify common attributes but not the quality attributes when challenge is an alternative', async function (assert) {
      await visit('/');
      await clickByText('1. Information et données');
      await clickByText('1 titre compétence');
      await clickByText('Atelier');
      await clickByText('@trululu2');
      await clickByText(
        "Cliquer sur instructions du proto pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
      );
      await clickByText('Déclinaisons >>');
      await clickByText('Cliquer sur instructions de la décli pour interagir avec');
      await click('[data-test-modify-challenge-button="recChallenge2"]');
      await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
      await fillByLabel(
        "URLs externes nécessaires à la résolution de l'épreuve",
        ' https://mon-url.com \n mon-autre-url.com',
      );
      assert.dom(find('[data-test-accessibility1-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-accessibility2-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-spoil-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-responsive-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-deaf-and-hard-of-hearing-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-is-awareness-challenge-challenge-id="recChallenge2"]')).doesNotExist();
      assert
        .dom(find('[data-test-require-gafam-website-access-challenge-challenge-id="recChallenge2"]'))
        .doesNotExist();
      assert.dom(find('[data-test-to-rephrase-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-is-incompatible-ipad-certif-challenge-id="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-no-validation-needed-checkbox="recChallenge2"]')).doesNotExist();
      assert.dom(find('[data-test-has-embed-internal-validation-checkbox="recChallenge2"]')).doesNotExist();
      await click(find('[data-test-save-challenge-button]'));
      await click(find('[data-test-confirm-log-approve]'));

      const challenge = await store.peekRecord('challenge', 'recChallenge2');
      assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
      assert.deepEqual(challenge.urlsToConsult, ['https://mon-url.com']);
    });
  });

  module('modifying a production challenge', function (hooks) {
    hooks.beforeEach(function () {
      const prototype = this.server.create('challenge', {
        id: 'recChallenge1',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: 'Prototype 1',
        status: 'validé',
        instruction:
          "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        geography: 'FR',
      });
      const skill = this.server.create('skill', {
        id: 'recSkill1',
        level: 2,
        name: '@trululu2',
        challengeIds: ['recChallenge1'],
        status: 'actif',
      });
      const tube = this.server.create('tube', { id: 'recTube1', name: '@trululu', rawSkillIds: ['recSkill1'] });
      const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
      const competence = this.server.create('competence', {
        id: 'recCompetence1.1',
        code: '1',
        title: 'titre compétence',
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
                    proposedChallengesCount: 1,
                    validatedChallengesCount: 0,
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
    });

    test('can modify attributes', async function (assert) {
      const screen = await visit('/');
      await clickByText('1. Information et données');
      await clickByText('1 titre compétence');
      await clickByText('@trululu2');
      await clickByText('Modifier');
      await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
      await fillByLabel(
        "URLs externes nécessaires à la résolution de l'épreuve",
        ' https://mon-url.com \n mon-autre-url.com',
      );
      await clickByText('Sans validation (Pix Junior)');
      await clickByText("Validation par l'embed (Pix Junior)");
      await clickByText('Épreuve de sensibilisation');
      await clickByText('Accès GAFAM requis');
      await clickByText('Épreuve à revoir');
      await clickByText('Incompatible iPad certif');
      await clickByText('Sourds et malentendants');
      await click(await screen.findByRole('option', { name: 'RAS' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Non voyant');
      await click(await screen.findByRole('option', { name: 'OK' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Daltonien');
      await click(await screen.findByRole('option', { name: 'KO' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Spoil');
      await click(await screen.findByRole('option', { name: 'Facilement Sp' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Responsive');
      await click(await screen.findByRole('option', { name: 'Tablette' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Géographie');
      await click(await screen.findByRole('option', { name: 'Japon' }));
      await waitForSelectToBeClosed(screen);
      await click(find('[data-test-save-challenge-button]'));
      await click(find('[data-test-confirm-log-approve]'));

      const challenge = await store.peekRecord('challenge', 'recChallenge1');
      assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
      assert.deepEqual(challenge.urlsToConsult, ['https://mon-url.com']);
      assert.dom(await find('[data-test-save-challenge-button]')).doesNotExist();
      assert.deepEqual(challenge.geography, 'JP');
    });

    test("modify a challenge's urlsToConsult when playing around with the field", async function (assert) {
      // when
      const store = this.owner.lookup('service:store');

      const screen = await visit('/');
      await clickByText('1. Information et données');
      await clickByText('1 titre compétence');
      await clickByText('@trululu2');

      assert.dom('[data-test-challenge-urls-to-consult]').doesNotExist();

      await clickByText('Modifier');
      await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");

      await fillByLabel(
        "URLs externes nécessaires à la résolution de l'épreuve",
        'https://mon-url.com\n mon-autre-url.com',
      );

      // then
      const challenge = await store.peekRecord('challenge', 'recChallenge1');
      assert.dom('[data-test-invalid-urls-to-consult]').hasText('URLs invalides : mon-autre-url.com');
      assert.deepEqual(challenge.urlsToConsult, ['https://mon-url.com']);

      const saveButton = await screen.findByRole('button', { name: 'Enregistrer' });
      await click(saveButton);
      await clickByText('Valider');

      assert.dom('[data-test-invalid-urls-to-consult]').doesNotExist();
    });
  });

  module('modifying an archived challenge', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('challenge', {
        id: 'recChallenge1',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: 'Prototype 1',
        status: 'archivé',
        instruction:
          "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        geography: 'FR',
      });
      const skill = this.server.create('skill', {
        id: 'recSkill1',
        level: 2,
        name: '@trululu2',
        challengeIds: ['recChallenge1'],
        status: 'archivé',
      });
      const tube = this.server.create('tube', { id: 'recTube1', name: '@trululu', rawSkillIds: ['recSkill1'] });
      const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
      const competence = this.server.create('competence', {
        id: 'recCompetence1.1',
        code: '1',
        title: 'titre compétence',
        pixId: 'pixId recCompetence1.1',
        rawThemeIds: ['recTheme1'],
        rawTubeIds: ['recTube1'],
      });
      this.server.create('competence-overview', {
        id: `${competence.pixId}:challenges-production`,
        thematicOverviews: [],
      });
      this.server.create('competence-overview', {
        id: `${competence.pixId}:challenges-workbench`,
        thematicOverviews: [
          {
            airtableId: thematic.id,
            name: thematic.name,
            tubeOverviews: [
              {
                airtableId: tube.id,
                name: tube.name,
                skillOverviews: [
                  {
                    airtableId: skill.id,
                    name: skill.name,
                    proposedChallengesCount: 2,
                    validatedChallengesCount: 0,
                    archivedChallengesCount: 0,
                    obsoleteChallengesCount: 0,
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
    });

    test('can modify attributes', async function (assert) {
      const screen = await visit('/');
      await clickByText('1. Information et données');
      await clickByText('1 titre compétence');
      await clickByText('Atelier');
      await clickByText('@trululu2');
      await clickByText(
        "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
      );
      await clickByText('Modifier');
      await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
      await fillByLabel(
        "URLs externes nécessaires à la résolution de l'épreuve",
        ' https://mon-url.com \n mon-autre-url.com',
      );
      await clickByText('Sans validation (Pix Junior)');
      await clickByText("Validation par l'embed (Pix Junior)");
      await clickByText('Épreuve de sensibilisation');
      await clickByText('Accès GAFAM requis');
      await clickByText('Épreuve à revoir');
      await clickByText('Incompatible iPad certif');

      await clickByText('Sourds et malentendants');
      await click(await screen.findByRole('option', { name: 'RAS' }));
      await waitForSelectToBeClosed(screen);

      await clickByText('Non voyant');
      await click(await screen.findByRole('option', { name: 'OK' }));
      await waitForSelectToBeClosed(screen);

      await clickByText('Daltonien');
      await click(await screen.findByRole('option', { name: 'KO' }));
      await waitForSelectToBeClosed(screen);

      await clickByText('Spoil');
      await click(await screen.findByRole('option', { name: 'Facilement Sp' }));
      await waitForSelectToBeClosed(screen);

      await clickByText('Responsive');
      await click(await screen.findByRole('option', { name: 'Non' }));
      await waitForSelectToBeClosed(screen);

      await clickByText('Géographie');
      await click(await screen.findByRole('option', { name: 'Japon' }));
      await waitForSelectToBeClosed(screen);

      await click(find('[data-test-save-challenge-button]'));
      await click(find('[data-test-confirm-log-approve]'));

      const challenge = await store.peekRecord('challenge', 'recChallenge1');
      assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
      assert.deepEqual(challenge.urlsToConsult, ['https://mon-url.com']);
      assert.dom(await find('[data-test-save-challenge-button]')).doesNotExist();
      assert.deepEqual(challenge.geography, 'JP');
    });
  });

  module('modifying an obsolete challenge', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('challenge', {
        id: 'recChallenge1',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: 'Prototype 1',
        status: 'périmé',
        instruction:
          "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        geography: 'FR',
      });
      const skill = this.server.create('skill', {
        id: 'recSkill1',
        level: 2,
        name: '@trululu2',
        challengeIds: ['recChallenge1'],
        status: 'archivé',
      });
      const tube = this.server.create('tube', { id: 'recTube1', name: '@trululu', rawSkillIds: ['recSkill1'] });
      const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
      const competence = this.server.create('competence', {
        id: 'recCompetence1.1',
        code: '1',
        title: 'titre compétence',
        pixId: 'pixId recCompetence1.1',
        rawThemeIds: ['recTheme1'],
        rawTubeIds: ['recTube1'],
      });
      this.server.create('competence-overview', {
        id: `${competence.pixId}:challenges-production`,
        thematicOverviews: [],
      });
      this.server.create('competence-overview', {
        id: `${competence.pixId}:challenges-workbench`,
        thematicOverviews: [
          {
            airtableId: thematic.id,
            name: thematic.name,
            tubeOverviews: [
              {
                airtableId: tube.id,
                name: tube.name,
                skillOverviews: [
                  {
                    airtableId: skill.id,
                    name: skill.name,
                    proposedChallengesCount: 2,
                    validatedChallengesCount: 0,
                    archivedChallengesCount: 0,
                    obsoleteChallengesCount: 0,
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
    });

    test('cannot modify an obsolete challenge', async function (assert) {
      const screen = await visit('/');
      await clickByText('1. Information et données');
      await clickByText('1 titre compétence');
      await clickByText('Atelier');
      await clickByText('@trululu2');
      await clickByText(
        "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
      );

      assert.dom(screen.queryByText('Modifier')).doesNotExist();
    });
  });
});

import { render } from '@1024pix/ember-testing-library';
import ChallengeView from 'pixeditor/components/challenge-view/challenge-view';
import Challenge from 'pixeditor/models/challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenge-view | challenge-view', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, challengeFromStore;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    challengeFromStore = store.createRecord('challenge', {
      id: 'challengeProtoValidee',
      instruction: 'instructions',
      alternativeInstruction: 'alternativeInstruction',
      type: 'QROC',
      format: 'format',
      proposals: 'suggestion',
      solution: 'answers',
      t1Status: false,
      t2Status: true,
      t3Status: false,
      pedagogy: 'pedagogy',
      author: ['jean'],
      declinable: 'difficilement',
      version: 1,
      genealogy: 'Prototype 1',
      status: Challenge.STATUSES.VALIDE,
      preview: '/api/urlto/challengeProtoValidee',
      airtableId: undefined,
      timer: 10,
      embedURL: 'https://mon-site.fr/my-link.html',
      embedTitle: 'embedTitle',
      embedHeight: 800,
      alternativeVersion: null,
      accessibility1: 'Ok',
      accessibility2: 'Ok',
      deafAndHardOfHearing: 'Ok',
      spoil: 'spoil',
      focusable: false,
      responsive: 'responsive',
      locales: 'languages',
      geography: 'FR',
      files: [],
      isAwarenessChallenge: true,
      requireGafamWebsiteAccess: true,
      toRephrase: false,
      isIncompatibleIpadCertif: true,
      contextualizedFields: 'contextualizedFields',
      updatedAt: '2021-10-02T14:00:00.000Z',
    });
  });
  test('it should display readonly form', async function (assert) {
    // given
    const challenge = challengeFromStore;
    // when
    screen = await render(
      <template>
        <ChallengeView @challenge={{challenge}} @skillId="skillId" @overview="overview" @competenceId="competenceId" />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText('Consigne')).hasText('instructions');
    assert.dom(screen.getByLabelText('Alternative textuelle')).hasText('alternativeInstruction');
    assert.dom(screen.getByLabelText('Modalité')).hasText('QROC');
    assert.dom(screen.getByLabelText('Format')).hasValue('format');
    assert.dom(screen.getByLabelText('Propositions')).hasText('suggestion');
    assert.dom(screen.getByLabelText('Réponses')).hasText('answers');
    assert.dom(screen.getByLabelText('T1 (espaces/casse/accents)')).isNotChecked();
    assert.dom(screen.getByLabelText('T2 (ponctuation)')).isChecked();
    assert.dom(screen.getByLabelText("T3 (distance d'édition)")).isNotChecked();
    assert.dom(screen.getByLabelText('Embed URL')).hasValue('https://mon-site.fr/my-link.html');
    assert.dom(screen.getByLabelText('Hauteur')).hasValue('800');
    assert.dom(screen.getByLabelText('Titre')).hasValue('embedTitle');
    assert.dom(screen.getByLabelText('Type pédagogie')).hasValue('pedagogy');
    assert.dom(screen.getByLabelText('Timer')).isChecked();
    assert.dom(screen.getByLabelText('Durée du timer')).hasValue('10');
    assert.dom(screen.getByLabelText('Focus')).isNotChecked();
    assert.dom(screen.getByLabelText('Langue(s)')).hasValue('languages');
    assert.dom(screen.getByLabelText('Spoil')).hasValue('spoil');
    assert.dom(screen.getByLabelText('Déclinable')).hasValue('difficilement');
    assert.dom(screen.getByLabelText('Responsive')).hasValue('responsive');
    assert.dom(screen.getByLabelText('Géographie')).hasValue('FR');
    assert.dom(screen.getByLabelText('Non voyant')).hasValue('Ok');
    assert.dom(screen.getByLabelText('Daltonien')).hasValue('Ok');
    assert.dom(screen.getByLabelText('Sourds et malentendants')).hasValue('Ok');
    assert.dom(screen.getByLabelText('Épreuve de sensibilisation')).isChecked();
    assert.dom(screen.getByLabelText('Accès GAFAM requis')).isChecked();
    assert.dom(screen.getByLabelText('Formulation à revoir')).isNotChecked();
    assert.dom(screen.getByLabelText('Incompatible iPad certif')).isChecked();
    assert.dom(screen.getByLabelText('Champs contextualisés')).hasValue('contextualizedFields');
    assert.dom(screen.getByLabelText('Id')).hasValue('challengeProtoValidee');
  });

  test('it should display actions', async function (assert) {
    // given
    const challenge = challengeFromStore;

    // when
    screen = await render(
      <template>
        <ChallengeView @challenge={{challenge}} @skillId="skillId" @overview="overview" @competenceId="competenceId" />
      </template>,
    );
    // then
    assert.dom(screen.getByRole('button', { name: "Copier le lien de l'épreuve" })).exists();
    const link = screen.getByRole('link', { name: "Prévisualiser l'épreuve" });
    assert.ok(link.href.endsWith('/api/urlto/challengeProtoValidee'));
  });

  module('#header', function () {
    module('when challenge is validate', function () {
      test('it should display only "Validée" when no date provided', async function (assert) {
        // given
        challengeFromStore.validatedAt = null;
        challengeFromStore.status = Challenge.STATUSES.VALIDE;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Validée')).exists();
      });
      test('it should display "Validée le 21/02/2025" when date provided', async function (assert) {
        // given
        challengeFromStore.validatedAt = new Date('2025-02-21T12:00:00Z');
        challengeFromStore.status = Challenge.STATUSES.VALIDE;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Validée le 21/02/2025')).exists();
      });
    });
    module('when challenge is archived', function () {
      test('it should display only "Archivée" when no date provided', async function (assert) {
        // given
        challengeFromStore.archivedAt = null;
        challengeFromStore.status = Challenge.STATUSES.ARCHIVE;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Archivée')).exists();
      });
      test('it should display "Archivée le 21/02/2025" when date provided', async function (assert) {
        // given
        challengeFromStore.archivedAt = new Date('2025-02-21T12:00:00Z');
        challengeFromStore.status = Challenge.STATUSES.ARCHIVE;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Archivée le 21/02/2025')).exists();
      });
    });
    module('when challenge is obsolete', function () {
      test('it should display only "Périmée" when no date provided', async function (assert) {
        // given
        challengeFromStore.madeObsoleteAt = null;
        challengeFromStore.status = Challenge.STATUSES.PERIME;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Périmée')).exists();
      });
      test('it should display "Périmée le 21/02/2025" when date provided', async function (assert) {
        // given
        challengeFromStore.madeObsoleteAt = new Date('2025-02-21T12:00:00Z');
        challengeFromStore.status = Challenge.STATUSES.PERIME;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Périmée le 21/02/2025')).exists();
      });
    });
    module('when challenge is proposed', function () {
      test('it should display "Proposée"', async function (assert) {
        // given
        challengeFromStore.status = Challenge.STATUSES.PROPOSE;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Proposée')).exists();
      });
    });
    module('when challenge is prototype', function () {
      test('it should display wright title', async function (assert) {
        // given
        const challenge = challengeFromStore;
        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );
        // then
        assert.dom(screen.getByText('Proto (V1)')).exists();
      });
    });
    module('when challenge is alternative', function () {
      test('it should display wright title', async function (assert) {
        // given
        challengeFromStore.genealogy = 'Décliné 1';
        challengeFromStore.alternativeVersion = 2;
        const challenge = challengeFromStore;

        // when
        screen = await render(
          <template>
            <ChallengeView
              @challenge={{challenge}}
              @skillId="skillId"
              @overview="overview"
              @competenceId="competenceId"
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Déclinaison 2 (V1)')).exists();
      });
    });
  });
});

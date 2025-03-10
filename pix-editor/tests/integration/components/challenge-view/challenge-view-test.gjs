import { render } from '@1024pix/ember-testing-library';
import ChallengeView from 'pixeditor/components/challenge-view/challenge-view';
import Challenge from 'pixeditor/models/challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenge-view | challenge-view', function(hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, challengeFromStore;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
    challengeFromStore =
      store.createRecord('challenge', {
        id: 'challengeProtoValidee',
        instruction: 'instructions',
        type: 'QCU',
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
        spoil: 'spoil',
        responsive: 'responsive',
        locales: 'languages',
        geography: 'geography',
        files: [],
        updatedAt: '2021-10-02T14:00:00.000Z',
      });

  });
  test('it should display readonly form', async function(assert) {
    // given
    const challenge = challengeFromStore;
    // when
    screen = await render(<template>
      <ChallengeView
        @challenge={{challenge}}
        @skillId="skillId"
        @overview="overview"
        @competenceId="competenceId"
      />
    </template>,
    );

    // then
    assert.dom(screen.getByLabelText('Consigne')).hasText('instructions');
  });

  test('it should display actions', async function(assert) {
    // given
    const challenge = challengeFromStore;

    // when
    screen = await render(<template>
      <ChallengeView
        @challenge={{challenge}}
        @skillId="skillId"
        @overview="overview"
        @competenceId="competenceId"
      />
    </template>,
    );
    // then
    assert.dom(screen.getByRole('button', { name: 'Copier le lien de l\'épreuve' })).exists();
    const link = screen.getByRole('link', { name: 'Prévisualiser l\'épreuve' });
    assert.ok(link.href.endsWith('/api/urlto/challengeProtoValidee'));
  });

  module('#header', function() {
    module('when challenge is validate', function() {
      test('it should display only "Validée" when no date provided', async function(assert) {
        // given
        challengeFromStore.validatedAt = null;
        challengeFromStore.status = Challenge.STATUSES.VALIDE;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
      test('it should display "Validée le 21/02/2025" when date provided', async function(assert) {
        // given
        challengeFromStore.validatedAt = new Date('2025-02-21T12:00:00Z');
        challengeFromStore.status = Challenge.STATUSES.VALIDE;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
    module('when challenge is archived', function() {
      test('it should display only "Archivée" when no date provided', async function(assert) {
        // given
        challengeFromStore.archivedAt = null;
        challengeFromStore.status = Challenge.STATUSES.ARCHIVE;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
      test('it should display "Archivée le 21/02/2025" when date provided', async function(assert) {
        // given
        challengeFromStore.archivedAt = new Date('2025-02-21T12:00:00Z');
        challengeFromStore.status = Challenge.STATUSES.ARCHIVE;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
    module('when challenge is obsolete', function() {
      test('it should display only "Périmée" when no date provided', async function(assert) {
        // given
        challengeFromStore.madeObsoleteAt = null;
        challengeFromStore.status = Challenge.STATUSES.PERIME;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
      test('it should display "Périmée le 21/02/2025" when date provided', async function(assert) {
        // given
        challengeFromStore.madeObsoleteAt = new Date('2025-02-21T12:00:00Z');
        challengeFromStore.status = Challenge.STATUSES.PERIME;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
    module('when challenge is proposed', function() {
      test('it should display "Proposée"', async function(assert) {
        // given
        challengeFromStore.status = Challenge.STATUSES.PROPOSE;
        const challenge = challengeFromStore;

        // when
        screen = await render(<template>
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
  });
});

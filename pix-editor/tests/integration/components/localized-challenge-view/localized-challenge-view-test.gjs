import { render } from '@1024pix/ember-testing-library';
import LocalizedChallengeView from 'pixeditor/components/localized-challenge-view/localized-challenge-view';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | localized-challenge-view | localized-challenge-view', function(hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, challenge, competence, chalengeLocale, localizedChallenge, attachment;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
    attachment = store.createRecord('attachment', { type: 'attachment' });
    competence = store.createRecord('competence', {
      id: 'competenceId',
      code: '1.1',
    });
    challenge =
      store.createRecord('challenge', {
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
        attachments: [attachment],
        isAwarenessChallenge: true,
        requireGafamWebsiteAccess: true,
        toRephrase: false,
        isIncompatibleIpadCertif: true,
        contextualizedFields: 'contextualizedFields',
        updatedAt: '2021-10-02T14:00:00.000Z',
      });
    localizedChallenge =
      store.createRecord('localized-challenge', {
        id: 'localizedChallengeId',
        locale: 'en',
        embedURL: `${challenge.embedURL}?lang=en`,
        status: LocalizedChallenge.STATUSES.PLAY,
        attachments: [attachment],
      });
    chalengeLocale = store.createRecord('challenge-locale', {
      challenge,
      localizedChallenge,
      locale: 'en',
    });
  });
  test('it should display readonly form', async function(assert) {
    // when
    screen = await render(<template>
      <LocalizedChallengeView
        @challengeLocale={{chalengeLocale}}
        @localizedChallenge={{localizedChallenge}}
        @competence={{competence}}
        @overview={{'overview'}}
        @skillId={{'skillId'}}
      />
    </template>,
    );

    // then
    assert.dom(screen.getByLabelText('Embed URL')).hasValue('https://mon-site.fr/my-link.html?lang=en');
    assert.dom(screen.getByText('Pièces jointes')).exists();

  });

  module('when challenge has no embed URL', function() {
    test('it should not display embed input', async function(assert) {
      // given
      challenge.embedURL = null;

      // when
      screen = await render(<template>
        <LocalizedChallengeView
          @challengeLocale={{chalengeLocale}}
          @localizedChallenge={{localizedChallenge}}
          @competence={{competence}}
          @overview={{'overview'}}
          @skillId={{'skillId'}}
        />
      </template>,
      );

      // then
      assert.dom(screen.queryByLabelText('Embed URL')).doesNotExist();

    });
  });
  module('when challenge has no attachment', function() {
    test('it should not display attachment input', async function(assert) {
      // given
      challenge.attachments = [];

      // when
      screen = await render(<template>
        <LocalizedChallengeView
          @challengeLocale={{chalengeLocale}}
          @localizedChallenge={{localizedChallenge}}
          @competence={{competence}}
          @overview={{'overview'}}
          @skillId={{'skillId'}}
        />
      </template>,
      );

      // then
      assert.dom(screen.queryByText('Pièces jointes')).doesNotExist();

    });
  });
});

import { render } from '@1024pix/ember-testing-library';
import LocalizedChallengeView from 'pixeditor/components/localized-challenge-view/localized-challenge-view';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | localized-challenge-view | localized-challenge-view', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, challenge, competence, challengeLocale, localizedChallenge, attachment;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    attachment = store.createRecord('attachment', { type: 'attachment' });
    competence = store.createRecord('competence', {
      id: 'competenceId',
      code: '1.1',
    });
    challenge
      = store.createRecord('challenge', {
        id: 'challengeProtoValidee',
        version: 1,
        genealogy: 'Prototype 1',
        status: Challenge.STATUSES.VALIDE,
        embedURL: 'https://mon-site.fr/my-link.html',
        geography: 'FR',
        attachments: [attachment],
      });
    localizedChallenge
      = store.createRecord('localized-challenge', {
        id: 'localizedChallengeId',
        locale: 'en',
        embedURL: `${challenge.embedURL}?lang=en`,
        status: LocalizedChallenge.STATUSES.PLAY,
        attachments: [attachment, store.createRecord('attachment', { type: 'illustration' })],
      });
    challengeLocale = store.createRecord('challenge-locale', {
      challenge,
      localizedChallenge,
      locale: 'en',
    });
  });

  test('it should display readonly form', async function (assert) {
    // when
    screen = await render(<template>
      <LocalizedChallengeView
        @challengeLocale={{challengeLocale}}
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
    assert.dom(screen.getByText('Illustration')).exists();
    assert.dom(screen.getByLabelText('Géographie')).hasText('Neutre');
    assert.dom(screen.getByLabelText('Id')).hasValue('localizedChallengeId');
  });

  module('when challenge has no embed URL', function () {
    test('it should not display embed input', async function (assert) {
      // given
      challenge.embedURL = null;

      // when
      screen = await render(<template>
        <LocalizedChallengeView
          @challengeLocale={{challengeLocale}}
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

  module('when challenge has no attachment', function () {
    test('it should not display attachment input', async function (assert) {
      // given
      challenge.attachments = [];

      // when
      screen = await render(<template>
        <LocalizedChallengeView
          @challengeLocale={{challengeLocale}}
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

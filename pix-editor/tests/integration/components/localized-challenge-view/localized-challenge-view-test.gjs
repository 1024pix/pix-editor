import { fillByLabel, render } from '@1024pix/ember-testing-library';
import LocalizedChallengeView from 'pixeditor/components/localized-challenge-view/localized-challenge-view';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | localized-challenge-view | localized-challenge-view', function(hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, challenge, competence, challengeLocale, localizedChallenge, attachment, edition;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
    attachment = store.createRecord('attachment', { id: 'attachmentId', type: 'attachment', url: 'data:,', filename: 'attachment-name' });
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
        attachments: [attachment, store.createRecord('attachment', { id: 'illustrationId', type: 'illustration' })],
      });
    challengeLocale = store.createRecord('challenge-locale', {
      challenge,
      localizedChallenge,
      locale: 'en',
    });
  });

  module('when edition is false', function(hooks) {
    hooks.beforeEach(function() {
      edition = false;
    });

    test('it should display readonly form', async function(assert) {
      // when
      screen = await render(<template>
        <LocalizedChallengeView
          @challengeLocale={{challengeLocale}}
          @localizedChallenge={{localizedChallenge}}
          @competence={{competence}}
          @overview={{'overview'}}
          @skillId={{'skillId'}}
          @edition={{edition}}
        />
      </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Embed URL'))
        .hasValue('https://mon-site.fr/my-link.html?lang=en')
        .hasAttribute('readonly');
      assert.dom(screen.getByText('Pièces jointes')).exists();
      assert.dom(screen.getByRole('heading', { name: 'Illustration' })).exists();
      assert.dom(screen.getByLabelText('Géographie'))
        .hasText('Neutre')
        .hasAttribute('aria-disabled');
      assert.dom(screen.getByLabelText('Id')).hasValue('localizedChallengeId');
    });

    module('when primary challenge has no embed URL', function() {
      test('it should not display embed input', async function(assert) {
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
            @edition={{edition}}
          />
        </template>,
        );

        // then
        assert.dom(screen.queryByLabelText('Embed URL')).doesNotExist();
      });
    });

    module('when primary challenge has no attachment', function() {
      test('it should not display attachment input', async function(assert) {
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
            @edition={{edition}}
          />
        </template>,
        );

        // then
        assert.dom(screen.queryByText('Pièces jointes')).doesNotExist();
      });
    });
  });

  module('when edition is true', function(hooks) {
    hooks.beforeEach(function() {
      edition = true;
    });

    module('when primary challenge has an embed URL', function() {
      test('it should warn when embedUrl is invalid', async function(assert) {
        // given
        challenge.embedURL = 'https://mon-embed-url.fr';

        // when
        screen = await render(<template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview={{'overview'}}
            @skillId={{'skillId'}}
            @edition={{edition}}
          />
        </template>,
        );
        await fillByLabel('Embed URL', 'un embed url raté');

        // then
        assert.dom(screen.getByText('Votre URL n\'est pas bien formatée')).exists();
      });

      test('it should not warn when embedUrl is valid', async function(assert) {
        // given
        challenge.embedURL = 'https://mon-embed-url.fr';

        // when
        screen = await render(<template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview={{'overview'}}
            @skillId={{'skillId'}}
            @edition={{edition}}
          />
        </template>,
        );
        await fillByLabel('Embed URL', 'https://mon-autre-embed-url.fr');

        // then
        assert.dom(screen.queryByText('Votre URL n\'est pas bien formatée')).doesNotExist();
      });
    });
  });
});

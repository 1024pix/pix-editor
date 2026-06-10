import { fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import LocalizedChallengeView from 'pixeditor/components/localized-challenge-view/localized-challenge-view';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';
import { click, find } from '@ember/test-helpers';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import sinon from 'sinon';

module('Integration | Component | localized-challenge-view | localized-challenge-view', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen,
    store,
    challenge,
    competence,
    challengeLocale,
    localizedChallenge,
    edition,
    loader,
    save,
    pixToastSendSuccess,
    pixToastSendError;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    loader = this.owner.lookup('service:loader');
    sinon.stub(loader, 'start');
    sinon.stub(loader, 'stop');
    const notifications = this.owner.lookup('service:notifications');
    pixToastSendSuccess = sinon.stub(notifications, 'sendSuccess');
    pixToastSendError = sinon.stub(notifications, 'sendError');
    const attachment = store.createRecord('attachment', {
      id: 'attachmentId',
      type: 'attachment',
      url: 'data:,',
      filename: 'attachment-name',
    });
    const illustration = store.createRecord('attachment', { id: 'illustrationId', type: 'illustration' });
    competence = store.createRecord('competence', {
      id: 'competenceId',
      code: '1.1',
      source: 'Pix',
    });
    challenge = store.createRecord('challenge', {
      id: 'challengeProtoValidee',
      version: 1,
      genealogy: 'Prototype 1',
      status: Challenge.STATUSES.VALIDE,
      embedURL: 'https://mon-site.fr/my-link.html',
      geography: 'FR',
      preview: 'previewURL',
      attachments: [attachment, illustration],
    });
    localizedChallenge = store.createRecord('localized-challenge', {
      id: 'localizedChallengeId',
      challenge,
      locale: 'en',
      embedURL: `${challenge.embedURL}?lang=en`,
      status: LocalizedChallenge.STATUSES.PLAY,
      attachments: [attachment, illustration],
    });
    challengeLocale = store.createRecord('challenge-locale', {
      challenge,
      localizedChallenge,
      locale: 'en',
    });
  });

  module('when user is not allowed to edit a challenge', function (hooks) {
    let mayChangeLocalizedChallengeStatusStub, mayEditLocalizedStub;
    hooks.beforeEach(function () {
      mayChangeLocalizedChallengeStatusStub = sinon.stub().returns(true);

      class AccessService extends Service {
        mayChangeLocalizedChallengeStatus = mayChangeLocalizedChallengeStatusStub;
        mayEditLocalized = false;
      }
      this.owner.register('service:access', AccessService);
    });

    test('it should not display edit button', async function (assert) {
      // given
      // when
      screen = await render(
        <template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview="overview"
            @skillId="skillId"
            @edition={{edition}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
    });
  });

  module('when edition is false', function (hooks) {
    let mayChangeLocalizedChallengeStatusStub, mayEditLocalizedStub;
    hooks.beforeEach(function () {
      edition = false;
      save = sinon.stub();
      mayChangeLocalizedChallengeStatusStub = sinon.stub().returns(true);
      mayEditLocalizedStub = sinon.stub().returns(true);

      class AccessService extends Service {
        mayChangeLocalizedChallengeStatus = mayChangeLocalizedChallengeStatusStub;
        mayEditLocalized = mayEditLocalizedStub;
      }
      this.owner.register('service:access', AccessService);
    });
    test('it should not display toggle status button when mayChangeStatus return `false`', async function (assert) {
      // given
      mayChangeLocalizedChallengeStatusStub.returns(false);

      // when
      screen = await render(
        <template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview="overview"
            @skillId="skillId"
            @edition={{edition}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Mettre en pause' })).doesNotExist();
    });

    module('when status is play', function () {
      test('it should change status to pause', async function (assert) {
        // given
        localizedChallenge.save = save;
        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        await click(screen.getByRole('button', { name: 'Mettre en pause' }));
        await click(await screen.findByRole('button', { name: 'Oui' }));

        // then
        assert.strictEqual(localizedChallenge.status, LocalizedChallenge.STATUSES.PAUSE);
        assert.ok(pixToastSendSuccess.calledOnce);
        assert.ok(pixToastSendSuccess.calledWith('Statut modifié avec succès !'));
        assert.notOk(pixToastSendError.calledOnce);
        assert.ok(loader.start.calledOnce);
        assert.ok(loader.stop.calledOnce);
      });

      test("it should notify on modification's failure", async function (assert) {
        localizedChallenge.save = save.rejects();
        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        await click(screen.getByRole('button', { name: 'Mettre en pause' }));
        await click(await screen.findByRole('button', { name: 'Oui' }));

        // then
        assert.strictEqual(localizedChallenge.status, LocalizedChallenge.STATUSES.PAUSE);
        assert.ok(pixToastSendSuccess.notCalled);
        assert.ok(pixToastSendError.calledOnce);
        assert.ok(pixToastSendError.calledWith("Erreur de la mise en pause de l'épreuve localisée"));
        assert.ok(loader.start.calledOnce);
        assert.ok(loader.stop.calledOnce);
      });
    });

    module('when status is pause', function (hooks) {
      hooks.beforeEach(function () {
        localizedChallenge.status = LocalizedChallenge.STATUSES.PAUSE;
      });

      test('it should change status to play', async function (assert) {
        // given
        mayChangeLocalizedChallengeStatusStub.returns(true);

        localizedChallenge.save = save;
        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        await click(screen.getByRole('button', { name: 'Mettre en prod' }));
        await click(await screen.findByRole('button', { name: 'Oui' }));

        // then
        assert.strictEqual(localizedChallenge.status, LocalizedChallenge.STATUSES.PLAY);
        assert.ok(pixToastSendSuccess.calledOnce);
        assert.ok(pixToastSendSuccess.calledWith('Statut modifié avec succès !'));
        assert.notOk(pixToastSendError.calledOnce);
        assert.ok(loader.start.calledOnce);
        assert.ok(loader.stop.calledOnce);
      });

      test("it should notify on modification's failure", async function (assert) {
        localizedChallenge.save = save.rejects();
        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        await click(screen.getByRole('button', { name: 'Mettre en prod' }));
        await click(await screen.findByRole('button', { name: 'Oui' }));

        // then
        assert.ok(pixToastSendSuccess.notCalled);
        assert.ok(pixToastSendError.calledOnce);
        assert.ok(pixToastSendError.calledWith("Erreur de la mise en prod de l'épreuve localisée"));
        assert.ok(loader.start.calledOnce);
        assert.ok(loader.stop.calledOnce);
      });
    });

    test('it should fail during change status', async function (assert) {
      // given
      mayChangeLocalizedChallengeStatusStub.returns(true);

      localizedChallenge.save = save;
      // when
      screen = await render(
        <template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview="overview"
            @skillId="skillId"
            @edition={{edition}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: 'Mettre en pause' }));
      await click(await screen.findByRole('button', { name: 'Oui' }));

      // then
      assert.strictEqual(localizedChallenge.status, LocalizedChallenge.STATUSES.PAUSE);
      assert.ok(pixToastSendSuccess.calledOnce);
      assert.ok(pixToastSendSuccess.calledWith('Statut modifié avec succès !'));
      assert.notOk(pixToastSendError.calledOnce);
      assert.ok(loader.start.calledOnce);
      assert.ok(loader.stop.calledOnce);
    });

    test('it should display action buttons', async function (assert) {
      // given
      const clipboardStub = sinon.spy();

      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: { writeText: clipboardStub },
      });

      // when
      screen = await render(
        <template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview="overview"
            @skillId="skillId"
            @edition={{edition}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: "Ouvrir la liste des prévisualisations de l'épreuve" }));

      // then
      assert.ok(
        (await screen.findByRole('link', { name: "Prévisualiser l'épreuve source" }))
          .getAttribute('href')
          .endsWith('/previewURL'),
        'href ends with /previewURL',
      );
      assert.ok(
        screen
          .getByRole('link', { name: "Prévisualiser l'épreuve traduite" })
          .getAttribute('href')
          .endsWith('/previewURL?locale=en'),
        'href ends with /previewURL?locale=en',
      );

      await click(screen.getByRole('button', { name: "Ouvrir la liste des liens de prévisualisations d'épreuves" }));
      await click(screen.getByRole('button', { name: "Copier le lien de l'épreuve traduite" }));
      assert.ok(clipboardStub.lastCall.firstArg.endsWith('/previewURL?locale=en'));

      await click(screen.getByRole('button', { name: "Ouvrir la liste des liens de prévisualisations d'épreuves" }));
      await click(screen.getByRole('button', { name: "Copier le lien de l'épreuve source" }));
      assert.ok(clipboardStub.lastCall.firstArg.endsWith('/previewURL'));
    });

    test('it should display readonly form', async function (assert) {
      // when
      screen = await render(
        <template>
          <LocalizedChallengeView
            @challengeLocale={{challengeLocale}}
            @localizedChallenge={{localizedChallenge}}
            @competence={{competence}}
            @overview="overview"
            @skillId="skillId"
            @edition={{edition}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByLabelText('Embed URL'))
        .hasValue('https://mon-site.fr/my-link.html?lang=en')
        .hasAttribute('readonly');
      assert.dom(screen.getByText('Pièces jointes')).exists();
      assert.dom(screen.getByRole('heading', { name: 'Illustration' })).exists();
      assert.dom(screen.getByLabelText('Géographie')).hasText('Neutre').hasAttribute('aria-disabled');
      assert.dom(screen.getByLabelText('Id')).hasValue('localizedChallengeId');
    });

    module('when primary challenge has no embed URL', function () {
      test('it should not display embed input', async function (assert) {
        // given
        challenge.embedURL = null;

        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByLabelText('Embed URL')).doesNotExist();
      });
    });

    module('when primary challenge has no attachment', function () {
      test('it should not display attachments inputs', async function (assert) {
        // given
        challenge.attachments = [];

        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByText('Pièces jointes')).doesNotExist();
        assert.dom(screen.queryByText('Illustration')).doesNotExist();
      });
    });
  });

  module('when edition is true', function (hooks) {
    hooks.beforeEach(function () {
      edition = true;
    });

    module('when primary challenge has an embed URL', function () {
      test('it should warn when embedUrl is invalid', async function (assert) {
        // given
        class AccessService extends Service {
          mayChangeLocalizedChallengeStatus = () => true;
          mayEditLocalized = true;
        }
        this.owner.register('service:access', AccessService);
        challenge.embedURL = 'https://mon-embed-url.fr';

        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        await fillByLabel('Embed URL', 'un embed url raté');

        // then
        assert.dom(screen.getByText("Votre URL n'est pas bien formatée")).exists();
      });

      test('it should not warn when embedUrl is valid', async function (assert) {
        // given
        class AccessService extends Service {
          mayChangeLocalizedChallengeStatus = () => true;
          mayEditLocalized = true;
        }
        this.owner.register('service:access', AccessService);
        challenge.embedURL = 'https://mon-embed-url.fr';

        // when
        screen = await render(
          <template>
            <LocalizedChallengeView
              @challengeLocale={{challengeLocale}}
              @localizedChallenge={{localizedChallenge}}
              @competence={{competence}}
              @overview="overview"
              @skillId="skillId"
              @edition={{edition}}
            />
          </template>,
        );

        await fillByLabel('Embed URL', 'https://mon-autre-embed-url.fr');

        // then
        assert.dom(screen.queryByText("Votre URL n'est pas bien formatée")).doesNotExist();
      });
    });
  });
});

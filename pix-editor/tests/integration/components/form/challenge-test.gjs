import { render, clickByName } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, settled } from '@ember/test-helpers';
import FormChallenge from 'pixeditor/components/form/challenge';
import Challenge from 'pixeditor/models/challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenge-form', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen;

  module('when edition is `false`', function () {
    test('it should display expected fields if challenge type is `QROC`', async function (assert) {
      const self = this;

      // Given
      const countries = [{ FR: 'France' }];
      const challengeData = EmberObject.create({ type: 'QROC', isTextBased: true, isPrototype: true });
      this.countries = countries;
      this.challengeData = challengeData;
      this.checkEmbedURL = () => {};

      // When
      screen = await render(
        <template>
          <FormChallenge
            @challenge={{self.challengeData}}
            @checkEmbedURL={{self.checkEmbedURL}}
            @countries={{self.countries}}
          />
        </template>,
      );

      // Then
      assert.dom(screen.getByLabelText('Format QROC')).exists();
      assert.dom('[data-test-tolerence-fields]').exists();
      assert.dom('[data-test-suggestion-field]').exists();
    });

    test('it should hide useless fields if challenge autoReply is `true`', async function (assert) {
      const self = this;

      // Given
      const countries = [{ FR: 'France' }];
      const challengeData = EmberObject.create({ autoReply: true, isTextBased: true, isPrototype: true });
      this.countries = countries;
      this.challengeData = challengeData;
      this.checkEmbedURL = () => {};

      // When
      await render(
        <template>
          <FormChallenge
            @challenge={{self.challengeData}}
            @checkEmbedURL={{self.checkEmbedURL}}
            @countries={{self.countries}}
          />
        </template>,
      );

      // Then
      ['data-test-format-field', 'data-test-tolerence-fields', 'data-test-suggestion-field'].forEach((field) => {
        assert.dom(`[${field}]`).doesNotExist();
      });
    });
  });

  module('when edition is `true`', function () {
    test('it should set locales', async function (assert) {
      const self = this;

      // Given
      class ConfigService extends Service {
        get localeToLanguageMap() {
          return {
            en: 'Anglais',
            'fr-fr': 'Franco Français',
            fr: 'Francophone',
          };
        }
      }
      this.owner.register('service:config', ConfigService);

      const countries = [{ FR: 'France' }];
      const store = this.owner.lookup('service:store');
      const challengeData = store.createRecord('challenge', {
        id: 'recChallenge_1',
        name: 'challenge',
        locales: [],
      });
      this.countries = countries;
      this.challengeData = challengeData;
      this.checkEmbedURL = () => {};

      // When
      screen = await render(
        <template>
          <FormChallenge
            @challenge={{self.challengeData}}
            @edition={{true}}
            @checkEmbedURL={{self.checkEmbedURL}}
            @countries={{self.countries}}
          />
        </template>,
      );
      await clickByName('Langue(s)');
      await screen.findByRole('menu');

      await clickByName('Anglais');
      await clickByName('Franco Français');
      await clickByName('Francophone');

      // Then
      assert.ok(this.challengeData.locales, ['en', 'fr-fr', 'fr']);
    });

    module('when challenge genealogy is prototype', function () {
      test('it should display autochecked checkbox if challenge type is `QCM`', async function (assert) {
        const self = this;

        // Given
        const store = this.owner.lookup('service:store');
        const countries = [{ FR: 'France' }];
        const challengeData = store.createRecord('challenge', {
          id: 'recChallenge0',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          type: 'QCU',
        });
        this.countries = countries;
        this.challengeData = challengeData;
        this.checkEmbedURL = () => {};

        // When
        screen = await render(
          <template>
            <FormChallenge
              @challenge={{self.challengeData}}
              @edition={{true}}
              @checkEmbedURL={{self.checkEmbedURL}}
              @countries={{self.countries}}
            />
          </template>,
        );
        await click(screen.getByRole('button', { name: 'Modalité' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'QCM' }));

        // Then
        assert.dom('[data-test-checkbox-shuffle]').exists();
        assert.dom('[data-test-checkbox-shuffle] > input').isChecked();

        // WORKAROUND: https://github.com/1024pix/pix-editor/pull/107#issuecomment-1547481515
        await new Promise((resolve) => setTimeout(resolve, 400));
        await settled();
      });

      test('it should display autochecked checkbox if challenge type is `QCU`', async function (assert) {
        const self = this;

        // Given
        const countries = [{ FR: 'France' }];
        const store = this.owner.lookup('service:store');
        const challengeData = store.createRecord('challenge', {
          id: 'recChallenge0',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          type: 'QCM',
        });
        this.countries = countries;
        this.challengeData = challengeData;
        this.checkEmbedURL = () => {};

        // When
        screen = await render(
          <template>
            <FormChallenge
              @challenge={{self.challengeData}}
              @edition={{true}}
              @checkEmbedURL={{self.checkEmbedURL}}
              @countries={{self.countries}}
            />
          </template>,
        );
        await click(screen.getByRole('button', { name: 'Modalité' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'QCM' }));

        // Then
        assert.dom('[data-test-checkbox-shuffle]').exists();
        assert.dom('[data-test-checkbox-shuffle] > input').isChecked();

        // WORKAROUND: https://github.com/1024pix/pix-editor/pull/107#issuecomment-1547481515
        await new Promise((resolve) => setTimeout(resolve, 400));
        await settled();
      });

      test('it should set assessmentMaintenanceTags', async function (assert) {
        // Given

        const store = this.owner.lookup('service:store');
        const countries = [{ FR: 'France' }];
        const challengeData = store.createRecord('challenge', {
          id: 'recChallenge_1',
          name: 'challenge',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          assessmentMaintenanceTags: [],
        });
        this.countries = countries;
        this.challengeData = challengeData;

        // When
        screen = await render(
          <template>
            <FormChallenge @challenge={{this.challengeData}} @edition={{true}} @countries={{this.countries}} />
          </template>,
        );
        await clickByName('Évaluation');
        await screen.findByRole('menu');

        await clickByName(Challenge.ASSESSMENT_MAINTENANCE_TAGS.RULE);
        await clickByName(Challenge.ASSESSMENT_MAINTENANCE_TAGS.AMBIGUOUS_ANSWERS);

        // Then
        assert.ok(this.challengeData.assessmentMaintenanceTags, [
          Challenge.ASSESSMENT_MAINTENANCE_TAGS.RULE,
          Challenge.ASSESSMENT_MAINTENANCE_TAGS.AMBIGUOUS_ANSWERS,
        ]);
      });

      test('it should set translationMaintenanceTags', async function (assert) {
        // Given

        const store = this.owner.lookup('service:store');
        const countries = [{ FR: 'France' }];
        const challengeData = store.createRecord('challenge', {
          id: 'recChallenge_2',
          name: 'challenge',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          translationMaintenanceTags: [],
        });
        this.countries = countries;
        this.challengeData = challengeData;

        // When
        screen = await render(
          <template>
            <FormChallenge @challenge={{this.challengeData}} @edition={{true}} @countries={{this.countries}} />
          </template>,
        );
        await clickByName('Traduction');
        await screen.findByRole('menu');

        await clickByName(Challenge.TRANSLATION_MAINTENANCE_TAGS.NAME);
        await clickByName(Challenge.TRANSLATION_MAINTENANCE_TAGS.MISC);

        // Then
        assert.ok(this.challengeData.translationMaintenanceTags, [
          Challenge.TRANSLATION_MAINTENANCE_TAGS.NAME,
          Challenge.TRANSLATION_MAINTENANCE_TAGS.MISC,
        ]);
      });
    });

    module('when challenge genealogy is declinaison', function () {
      test('it should not display assessmentMaintenanceTags field', async function (assert) {
        const store = this.owner.lookup('service:store');
        const countries = [{ FR: 'France' }];
        const challengeData = store.createRecord('challenge', {
          id: 'recChallenge_1',
          name: 'challenge',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          assessmentMaintenanceTags: [],
        });
        this.countries = countries;
        this.challengeData = challengeData;

        // When
        screen = await render(
          <template>
            <FormChallenge @challenge={{this.challengeData}} @edition={{true}} @countries={{this.countries}} />
          </template>,
        );
        assert.dom(await screen.queryByRole('button', { name: 'Évaluation' })).doesNotExist();
      });

      test('it should not display translationMaintenanceTags field', async function (assert) {
        const store = this.owner.lookup('service:store');
        const countries = [{ FR: 'France' }];
        const challengeData = store.createRecord('challenge', {
          id: 'recChallenge_1',
          name: 'challenge',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          translationMaintenanceTags: [],
        });
        this.countries = countries;
        this.challengeData = challengeData;

        // When
        screen = await render(
          <template>
            <FormChallenge @challenge={{this.challengeData}} @edition={{true}} @countries={{this.countries}} />
          </template>,
        );
        assert.dom(await screen.queryByRole('button', { name: 'Traduction' })).doesNotExist();
      });
    });
  });
});

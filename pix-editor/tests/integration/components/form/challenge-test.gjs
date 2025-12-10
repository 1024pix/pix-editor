import { render, clickByName } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, settled } from '@ember/test-helpers';
import FormChallenge from 'pix-editor/components/form/challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenge-form', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen;

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

  test('it should display autochecked checkbox if challenge type is `QCM`', async function (assert) {
    const self = this;

    // Given
    const store = this.owner.lookup('service:store');
    const countries = [{ FR: 'France' }];
    const challengeData = store.createRecord('challenge', {
      id: 'recChallenge0',
      genealogy: 'Prototype 1',
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
      genealogy: 'Prototype 1',
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
});

import { clickByName, clickByText, fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';
import FormWhitelistedUrl from 'pixeditor/components/form/whitelisted-url';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | Form | whitelisted-url', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should submit correctly formed whitelisted url', async function (assert) {
    const self = this;

    const onSubmit = sinon.spy(() => {});

    this.submitButtonText = 'Ajouter';
    this.createWhitelistedUrl = onSubmit;

    const screen = await render(
      <template>
        <FormWhitelistedUrl
          @initialUrl=""
          @initialComment=""
          @initialRelatedSkillNames=""
          @initialCheckType=""
          @submitButtonText={{self.submitButtonText}}
          @onFormSubmitted={{self.createWhitelistedUrl}}
        />
      </template>,
    );

    await fillByLabel('URL à ne pas analyser', 'https://example.org');

    const submitButton = screen.getByRole('button', { name: 'Ajouter' });
    await click(submitButton);
    assert.ok(onSubmit.calledOnce);
    assert.deepEqual(onSubmit.args[0][0], {
      checkType: 'exact_match',
      url: 'https://example.org',
      comment: '',
      relatedSkillNames: '',
    });

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@test1,@test2');
    await click(submitButton);
    assert.ok(onSubmit.calledTwice);
    assert.strictEqual(onSubmit.args[1][0].relatedSkillNames, '@test1,@test2');

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', ' @test1,  ,,@test2  ');
    await click(submitButton);
    assert.ok(onSubmit.calledThrice);
    assert.strictEqual(onSubmit.args[2][0].relatedSkillNames, '@test1,@test2');

    await clickByName("Type de comparaison d'URL");
    await clickByText('Commence par');
    await click(submitButton);
    assert.strictEqual(onSubmit.callCount, 4);
    assert.strictEqual(onSubmit.args[3][0].checkType, 'starts_with');
  });

  test('should enable add url button when mandatory information has been given', async function (assert) {
    const self = this;

    this.submitButtonText = 'Ajouter';

    const screen = await render(
      <template>
        <FormWhitelistedUrl
          @initialUrl=""
          @initialComment=""
          @initialRelatedSkillNames=""
          @initialCheckType=""
          @submitButtonText={{self.submitButtonText}}
        />
      </template>,
    );

    await fillByLabel('URL à ne pas analyser', 'https://example.org');

    const button = screen.getByRole('button', { name: 'Ajouter' });
    assert.dom(button).doesNotHaveAttribute('disabled');
  });

  test('should disable create whitelisted URL button when no complete informations', async function (assert) {
    const self = this;

    this.submitButtonText = 'Ajouter';

    const screen = await render(
      <template>
        <FormWhitelistedUrl
          @initialUrl=""
          @initialComment=""
          @initialRelatedSkillNames=""
          @initialCheckType=""
          @submitButtonText={{self.submitButtonText}}
        />
      </template>,
    );

    const button = screen.getByRole('button', { name: 'Ajouter' });
    assert.dom(button).hasAria('disabled', 'true');

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@test1,@test2');
    await fillByLabel('Commentaire', 'Ça rend la chose plus claire');
    assert.dom(button).hasAria('disabled', 'true');
  });

  test('should display errors when input values are unexpected', async function (assert) {
    const self = this;

    const screen = await render(
      <template>
        <FormWhitelistedUrl
          @initialUrl=""
          @initialComment=""
          @initialRelatedSkillNames=""
          @initialCheckType=""
          @submitButtonText={{self.submitButtonText}}
        />
      </template>,
    );

    await fillByLabel('URL à ne pas analyser', '');
    const urlErrorMandatoryField = screen.getByText("L'URL est obligatoire");
    assert.dom(urlErrorMandatoryField).isVisible();

    await fillByLabel('URL à ne pas analyser *', 'chouchou beignets');
    const urlErrorInvalidUrl = screen.getByText("L'URL n'est pas valide");
    assert.dom(urlErrorInvalidUrl).isVisible();

    await fillByLabel('URL à ne pas analyser *', 'https://example.org');
    assert.dom(urlErrorInvalidUrl).isNotVisible();
    assert.dom(urlErrorMandatoryField).isNotVisible();

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', 'test');
    const skillNamesError = screen.getByText(
      "Les noms d'acquis doivent être séparés par des virgules et ne peuvent pas être vides.",
    );
    assert.dom(skillNamesError).isVisible();

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@test');
    assert.dom(skillNamesError).isVisible();

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@test,@abc');
    assert.dom(skillNamesError).isVisible();

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@test,@abc1');
    assert.dom(skillNamesError).isVisible();

    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@test2,@abc1');
    assert.dom(skillNamesError).isNotVisible();
  });
});

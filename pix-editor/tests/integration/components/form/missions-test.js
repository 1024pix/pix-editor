import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { click, find, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';

module('Integration | Component | mission', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('Should enable create mission button when mandatory informations have been given', async function(assert) {

    this.set('mission', {});
    this.set('competences', [{ title: 'Notre compétence', pixId: 'pixId' , themes: [{}] }]);
    this.set('submitButtonText', 'Créer la mission');

    const screen = await render(hbs`<Form::Mission
                                              @mission={{this.mission}}
                                              @competences={{this.competences}}
                                              @submitButtonText={{this.submitButtonText}}
                                              />`);

    await fillByLabel('* Nom de la mission', 'Nouvelle mission de test');
    await triggerEvent(find('#mission-name'), 'keyup', '');

    await clickByName('Compétence');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Notre compétence' }));

    const button = screen.getByRole('button', { name: 'Créer la mission' });

    assert.dom(button).doesNotHaveAttribute('disabled');
  });


  test('Should disable create mission button when no complete informations', async function(assert) {

    this.set('mission', {});
    this.set('competences', [{}]);
    this.set('submitButtonText', 'Créer la mission');

    const screen = await render(hbs`<Form::Mission  @mission={{this.mission}}
                                                    @competences={{this.competences}}
                                                    @submitButtonText={{this.submitButtonText}}
                                                    />`);

    await fillByLabel('* Nom de la mission', 'Nouvelle mission de test');
    await triggerEvent(find('#mission-name'), 'keyup', '');

    const button = screen.getByRole('button', { name: 'Créer la mission' });

    assert.dom(button).hasAttribute('disabled');
  });
});

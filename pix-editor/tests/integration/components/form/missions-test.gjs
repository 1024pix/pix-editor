import { clickByText, fillByLabel, render } from '@1024pix/ember-testing-library';
import { click, find, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import FormMission from 'pixeditor/components/form/mission';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | mission', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('Should enable create mission button when mandatory informations have been given', async function (assert) {
    const self = this;

    this.mission = {};
    this.competences = [{ title: 'Notre compétence', pixId: 'pixId', themes: [{}] }];
    this.submitButtonText = 'Créer la mission';

    const screen = await render(
      <template>
        <FormMission
          @mission={{self.mission}}
          @competences={{self.competences}}
          @submitButtonText={{self.submitButtonText}}
        />
      </template>,
    );

    await fillByLabel('Nom de la mission *', 'Nouvelle mission de test');
    await triggerEvent(find('#mission-name'), 'keyup', '');

    await fillByLabel(
      "URL de l'image de la carte",
      'https://images.pix.fr/badges/Pix_Plus-Donnee-Visualisation_des_donnees.svg.svg',
    );

    await clickByText('Compétence');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Notre compétence' }));

    const button = screen.getByRole('button', { name: 'Créer la mission' });

    assert.dom(button).doesNotHaveAttribute('disabled');
  });

  test('Should disable create mission button when no complete informations', async function (assert) {
    const self = this;

    this.mission = {};
    this.competences = [{}];
    this.submitButtonText = 'Créer la mission';

    const screen = await render(
      <template>
        <FormMission
          @mission={{self.mission}}
          @competences={{self.competences}}
          @submitButtonText={{self.submitButtonText}}
        />
      </template>,
    );

    await fillByLabel('Nom de la mission *', 'Nouvelle mission de test');
    await triggerEvent(find('#mission-name'), 'keyup', '');

    const button = screen.getByRole('button', { name: 'Créer la mission' });

    assert.dom(button).hasAria('disabled', 'true');
  });
});

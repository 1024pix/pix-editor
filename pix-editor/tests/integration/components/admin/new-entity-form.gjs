import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import sinon from 'sinon';

import NewAdminEntityForm from 'pixeditor/components/admin/new-entity-form';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | admin | new-entity-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  module('when submitting the form', function (hooks) {
    const entityFields = [
      {
        key: 'country',
        label: 'Pays',
        type: 'string',
        pattern: '^[A-Z]+[a-z]*$',
      },
      {
        key: 'dish',
        label: 'Plat',
        type: 'string',
      },
    ];

    test('it should call @onSubmit with the form data', async function (assert) {
      // given
      const onSubmit = sinon.stub();
      const country = 'France';
      const dish = 'Boeuf bourguignon';

      // when
      screen = await render(
        <template><NewAdminEntityForm @entityFields={{entityFields}} @onSubmit={{onSubmit}} /></template>,
      );
      await fillByLabel('Pays *', country);
      await fillByLabel('Plat *', dish);
      await click(screen.getByRole('button', { name: 'Créer' }));

      // then
      assert.deepEqual(onSubmit.getCalls()[0].firstArg, { country, dish });
    });

    module("when a field pattern isn't matched", function (hooks) {
      test('it should display an error and not call @onSubmit until form', async function (assert) {
        // given
        const onSubmit = sinon.stub();
        const country = 'fRANCE';
        const dish = 'Boeuf bourguignon';

        // when
        screen = await render(
          <template><NewAdminEntityForm @entityFields={{entityFields}} @onSubmit={{onSubmit}} /></template>,
        );
        await fillByLabel('Pays *', country);
        await fillByLabel('Plat *', dish);
        const createButton = screen.getByRole('button', { name: 'Créer' });
        await click(createButton);

        // then
        assert.dom(createButton).hasAria('disabled');
        assert.notOk(onSubmit.calledOnce, '@onSubmit has not been called');
        assert
          .dom(
            screen.getByText("La valeur de ce champ doit respecter l'expression régulière suivante : /^[A-Z]+[a-z]*$/"),
          )
          .exists();

        // furthermore
        const fixedCountry = 'FRANCE';
        await fillByLabel('Pays *', fixedCountry);
        await click(screen.getByRole('button', { name: 'Créer' }));
        assert.deepEqual(onSubmit.getCalls()[0].firstArg, { country: fixedCountry, dish });
      });
    });
  });
});

import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ModuleValidationErrors from 'pixeditor/components/modules/validation-errors';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/validation-errors', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display errors', async function (assert) {
    // given
    const validationErrors = [{ message: 'Le slug est mal formatté' }, { message: "Problème de duplications d'Ids" }];

    // where
    const screen = await render(<template><ModuleValidationErrors @validationErrors={{validationErrors}} /></template>);

    // then
    const listItems = screen.getAllByRole('listitem');
    assert.dom(listItems[0]).hasText('Le slug est mal formatté');
    assert.dom(listItems[1]).hasText("Problème de duplications d'Ids");
  });

  module('details button label', function () {
    module('when collapsed', function () {
      test('it displays the expand label with the errors count', async function (assert) {
        // given
        const validationErrors = ['Le slug est mal formatté', "Problème de duplications d'Ids"];

        // when
        const screen = await render(
          <template><ModuleValidationErrors @validationErrors={{validationErrors}} /></template>,
        );

        // then
        assert.dom(screen.getByText('Voir les erreurs')).exists();
        assert.dom(screen.queryByText('Tout replier')).doesNotExist();
      });
    });

    test('it displays the collapse label once expanded', async function (assert) {
      // given
      const validationErrors = ['Le slug est mal formatté', "Problème de duplications d'Ids"];
      const screen = await render(
        <template><ModuleValidationErrors @validationErrors={{validationErrors}} /></template>,
      );

      // when
      const summary = screen.getByRole('group').querySelector('summary');
      await click(summary);

      // then
      assert.dom(screen.getByText('Tout replier')).exists();
      assert.dom(screen.queryByText('Voir les erreurs')).doesNotExist();
    });
  });

  module('on edit page', function () {
    test('it should display the edit page information message', async function (assert) {
      // given
      const validationErrors = [{ message: 'Le slug est mal formatté' }];

      // when
      const screen = await render(
        <template><ModuleValidationErrors @validationErrors={{validationErrors}} @isEditPage={{true}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByText(
            "Il est possible d'enregistrer le brouillon même si des erreurs subsistent. Vous pourrez les traiter plus tard.",
          ),
        )
        .exists();
      assert.dom(screen.queryByText('La publication est impossible tant que des erreurs subsistent.')).doesNotExist();
    });
  });

  module('on details page', function () {
    test('it should display the detail page information message', async function (assert) {
      // given
      const validationErrors = [{ message: 'Le slug est mal formatté' }];

      // when
      const screen = await render(
        <template><ModuleValidationErrors @validationErrors={{validationErrors}} /></template>,
      );

      // then
      assert.dom(screen.getByText('La publication est impossible tant que des erreurs subsistent.')).exists();
      assert
        .dom(
          screen.queryByText(
            "Il est possible d'enregistrer le brouillon même si des erreurs subsistent. Vous pourrez les traiter plus tard.",
          ),
        )
        .doesNotExist();
    });
  });

  module('errors count', function () {
    test('it counts the validation errors', async function (assert) {
      // given
      const validationErrors = [{ message: 'Le slug est mal formatté' }, { message: 'Missing comma' }];

      // when
      const screen = await render(
        <template><ModuleValidationErrors @validationErrors={{validationErrors}} /></template>,
      );

      // then
      assert.dom(screen.getByText('2 erreurs de validation')).exists();
    });
  });
});

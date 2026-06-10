import { render } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import LocalizedFramework from 'pixeditor/components/v2/localized-framework';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | v2/localized-framework', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;
  hooks.beforeEach(async function () {
    const tubeId = 'tubeId1';
    const competence = {
      id: 'competenceId1',
      sortedThemes: [
        {
          name: 'ma thematique',
          tubes: [
            {
              id: tubeId,
              name: '@tubeName',
            },
          ],
        },
      ],
    };
    const locale = 'nl';
    const localizedFrameworkTubes = [];

    // when
    screen = await render(
      <template>
        <LocalizedFramework
          @competence={{competence}}
          @locale={{locale}}
          @localizedFrameworkTubes={{localizedFrameworkTubes}}
        />
      </template>,
    );
  });

  module('it should warn', function () {
    test('if max-level is out of range', async function (assert) {
      // when
      await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), '30');

      // then
      assert.dom(screen.getByText('la valeur doit être comprise entre 0 et 8')).exists();
    });

    test('if max-level is not a number', async function (assert) {
      // when
      await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), 'george');

      // then
      assert.dom(screen.getByText('la valeur doit être comprise entre 0 et 8')).exists();
    });
  });

  test('save action should be disabled if form is not valid', async function (assert) {
    // when
    await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), 'george');

    // then
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).hasAttribute('aria-disabled', 'true');
  });
});

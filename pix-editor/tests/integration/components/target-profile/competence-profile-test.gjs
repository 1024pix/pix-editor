import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import CompetenceProfile from 'pixeditor/components/target-profile/competence-profile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/competence-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it filter', async function (assert) {
    // given
    const theme_1 = EmberObject.create({
      name: 'theme_1',
      hasSelectedProductionTube: true,
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }],
    });
    const theme_2 = EmberObject.create({
      name: 'theme_2',
      hasSelectedProductionTube: false,
      productionTubes: [{ selectedLevel: false }, { selectedLevel: false }],
    });
    const theme_3 = EmberObject.create({
      name: 'theme_3',
      hasSelectedProductionTube: true,
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }],
    });

    const competence = EmberObject.create({
      title: 'competence_title',
      description: 'competence_description',
      code: '1',
      sortedThemes: [theme_1, theme_2, theme_3],
    });
    const filter = true;

    // when
    const screen = await render(
      <template><CompetenceProfile @competence={{competence}} @filter={{filter}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: /competence_title/ })).exists();
    assert.dom(screen.getByText(/theme_1/)).exists();
    assert.dom(screen.getByText(/theme_3/)).exists();
  });

  test('it should not display empty theme', async function (assert) {
    // given
    const theme_1 = EmberObject.create({
      name: 'theme_1',
      hasProductionTubes: true,
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }],
    });

    const theme_2 = EmberObject.create({
      name: 'theme_2',
      hasProductionTubes: false,
      productionTubes: [],
    });

    const competence = EmberObject.create({
      title: 'competence_title',
      description: 'competence_description',
      code: '1',
      sortedThemes: [theme_1, theme_2],
    });

    // when
    const screen = await render(<template><CompetenceProfile @competence={{competence}} /></template>);

    // then
    assert.dom(screen.getByText(/theme_1/)).exists();
    assert.dom(screen.getByText(/theme_1/)).exists();
  });
});

import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import AreaProfile from 'pixeditor/components/target-profile/area-profile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/area-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it filter', async function (assert) {
    const self = this;

    // given
    const competence_1 = EmberObject.create({
      code: 'competence_1',
      selectedProductionTubeCount: 2,
      sortedThemes: [{ productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }] }],
    });
    const competence_2 = EmberObject.create({
      code: 'competence_2',
      selectedProductionTubeCount: 0,
      sortedThemes: [{ productionTubes: [{ selectedLevel: false }, { selectedLevel: false }] }],
    });
    const competence_3 = EmberObject.create({
      code: 'competence_3',
      selectedProductionTubeCount: 2,
      sortedThemes: [{ productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }] }],
    });

    const area = EmberObject.create({
      name: 'area_name',
      sortedCompetences: [competence_1, competence_2, competence_3],
    });
    this.area = area;
    this.filter = true;

    // when
    const screen = await render(<template><AreaProfile @area={{self.area}} @filter={{self.filter}} /></template>);

    // then
    assert.dom(screen.getByText(/competence_3/)).exists();
    assert.dom(screen.getByText(/competence_1/)).exists();
    assert.dom(screen.queryByText(/competence_2/)).doesNotExist();
  });
});

import { render } from '@ember/test-helpers';
import CellQuality from 'pix-editor/components/competence/grid/cell-quality';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Integration | Component | quality-view', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    const skill = {
      productionPrototype: {},
      tutoSolution: [],
      tutoMore: [],
      challenges: [],
    };

    // when
    await render(<template><CellQuality @skill={{skill}} /></template>);

    // then
    assert
      .dom(this.element)
      .hasText(
        "0 Spoil Non testé Responsive Non testé Non/Mal voyant Non testé Daltonien Non testé Indice Pas d'indice",
      );
  });
});

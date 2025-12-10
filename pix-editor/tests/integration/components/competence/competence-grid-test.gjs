import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import CompetenceGrid from 'pix-editor/components/competence/competence-grid';

module('Integration | Component | competence-grid', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('using competence-overview', function (hooks) {
    hooks.beforeEach(function () {
      const competenceOverview = EmberObject.create({ thematicOverviews: [] });

      this.competenceOverview = competenceOverview;
    });

    test('it renders', async function (assert) {
      const self = this;

      // when
      await render(<template><CompetenceGrid @competenceOverview={{self.competenceOverview}} /></template>);

      // then
      assert.dom('.competence-grid').exists();
    });
  });

  module('using competence', function (hooks) {
    hooks.beforeEach(function () {
      const competence = EmberObject.create({ sortedThemes: [] });

      this.competence = competence;
    });

    test('it renders', async function (assert) {
      const self = this;

      // when
      await render(<template><CompetenceGrid @competence={{self.competence}} /></template>);

      // then
      assert.dom('.competence-grid').exists();
    });
  });
});

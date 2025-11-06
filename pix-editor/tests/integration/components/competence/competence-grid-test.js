import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence-grid', function(hooks) {
  setupIntlRenderingTest(hooks);

  module('using competence-overview', function(hooks) {
    hooks.beforeEach(function() {
      const competenceOverview = EmberObject.create({ thematicOverviews: [] });

      this.set('competenceOverview', competenceOverview);
    });

    test('it renders', async function(assert) {
      // when
      await render(hbs`<Competence::CompetenceGrid @competenceOverview={{this.competenceOverview}} />`);

      // then
      assert.dom('.competence-grid').exists();
    });
  });

  module('using competence', function(hooks) {
    hooks.beforeEach(function() {
      const competence = EmberObject.create({ sortedThemes: [] });

      this.set('competence', competence);
    });

    test('it renders', async function(assert) {
      // when
      await render(hbs`<Competence::CompetenceGrid @competence={{this.competence}} />`);

      // then
      assert.dom('.competence-grid').exists();
    });
  });
});

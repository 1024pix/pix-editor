import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | target-profile/competence-profile', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it filter', async function(assert) {

    // given
    const theme_1 = EmberObject.create({
      name: 'theme_1',
      hasSelectedProductionTube: true,
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }]
    });
    const theme_2 = EmberObject.create({
      name: 'theme_2',
      hasSelectedProductionTube: false,
      productionTubes: [{ selectedLevel: false }, { selectedLevel: false }]
    });
    const theme_3 = EmberObject.create({
      name: 'theme_3',
      hasSelectedProductionTube: true,
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }]
    });

    const competence = EmberObject.create({
      title:'competence_title',
      description:'competence_description',
      code: '1',
      sortedThemes: [theme_1, theme_2, theme_3]
    });
    this.set('competence', competence);
    this.set('filter', true);

    // when
    await render(hbs`<TargetProfile::CompetenceProfile @competence={{this.competence}} @filter={{this.filter}}/>`);

    // then
    assert.dom('.competence-title').hasText('competence_title');
    assert.dom('[data-test-theme-profile]').exists({ count: 2 });
  });

  test('it should not display empty theme', async function (assert) {
    // given
    const theme_1 = EmberObject.create({
      name: 'theme_1',
      hasProductionTubes: true,
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }]
    });

    const theme_2 = EmberObject.create({
      name: 'theme_2',
      hasProductionTubes: false,
      productionTubes: []
    });

    const competence = EmberObject.create({
      title:'competence_title',
      description:'competence_description',
      code: '1',
      sortedThemes: [theme_1, theme_2]
    });
    this.set('competence', competence);

    // when
    await render(hbs`<TargetProfile::CompetenceProfile @competence={{this.competence}}/>`);

    // then
    assert.dom('[data-test-theme-profile]').exists({ count: 1 });

  });
});

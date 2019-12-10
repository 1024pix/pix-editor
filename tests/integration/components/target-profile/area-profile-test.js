import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | target-profile/area-profile', function (hooks) {
  setupRenderingTest(hooks);

  test('it filter', async function (assert) {

    // given
    const competence_1 = EmberObject.create({
      name: 'competence_1',
      selectedProductionTubeCount: 2,
      productionTubes: [{selectedLevel: 5}, {selectedLevel: 5}]
    });
    const competence_2 = EmberObject.create({
      name: 'competence_2',
      selectedProductionTubeCount: 0,
      productionTubes: [{selectedLevel: false}, {selectedLevel: false}]
    });
    const competence_3 = EmberObject.create({
      name: 'competence_1',
      selectedProductionTubeCount: 2,
      productionTubes: [{selectedLevel: 5}, {selectedLevel: 5}]
    });


    const area = EmberObject.create({
      name: 'area_name',
      competences: [
        competence_1,
        competence_2,
        competence_3,
      ]
    });
    this.set('area', area);
    this.set('filter', true);

    // when

    await render(hbs`{{target-profile/area-profile area=area filter=filter}}`);

    //then

    assert.equal(this.element.querySelectorAll('.competence-profile').length, 2)
  });
});

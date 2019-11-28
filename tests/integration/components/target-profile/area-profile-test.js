import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | target-profile/area-profile', function (hooks) {
  setupRenderingTest(hooks);

  test('it filter', async function (assert) {

    // given

    const area = EmberObject.create({
      name:'area_name',
      competences:[
        {name:'competence1', selectedProductionTubeCount:2},
        {name:'competence2', selectedProductionTubeCount:0},
        {name:'competence3', selectedProductionTubeCount:5},
      ]
    });
    this.set('area', area);
    this.set('filter', true);

    // when

    await render(hbs`{{target-profile/area-profile area=area filter=filter}}`);

    //then

    assert.equal(this.element.querySelectorAll('.tubes-profile').length  ,2)
  });
});

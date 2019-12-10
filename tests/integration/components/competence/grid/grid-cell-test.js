import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | competence/grid/grid-cell', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given

    // when
    await render(hbs`{{competence/grid/grid-cell view="challenges" displaySkill=false mayAddSkill=false}}`);

    // then
    assert.dom('.skill-cell__empty').exists();
  });
});

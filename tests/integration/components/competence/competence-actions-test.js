import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module.only('Integration | Component | competence/competence-actions', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given

    // when
    await render(hbs`{{competence/competence-actions section="challenges"}}`);

    // then

    assert.equal(this.element.querySelector('.production').textContent.trim(), 'En production');

  });
});

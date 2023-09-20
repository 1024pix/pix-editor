import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence-grid', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    // when

    await render(hbs`<Competence::CompetenceGrid />`);

    // then

    assert.dom('.competence-grid').exists();
  });
});

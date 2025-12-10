import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Production from 'pix-editor/components/statistics/production';

module('Integration | Component | statistics/production', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    this.areas = [];
    this.competenceCodes = [];

    await render(<template><Production @areas={{self.areas}} @competenceCodes={{self.competenceCodes}} /></template>);

    assert.dom('.ui.header').exists();
  });
});

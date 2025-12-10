import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import I18n from 'pix-editor/components/statistics/i18n';

module('Integration | Component | statistics/i18n', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    this.areas = [];
    this.competenceCodes = [];

    await render(<template><I18n @areas={{self.areas}} @competenceCodes={{self.competenceCodes}} /></template>);

    assert.dom('.ui.header').exists();
  });
});

import { render } from '@1024pix/ember-testing-library';
import Production from 'pixeditor/components/statistics/production';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | statistics/production', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    this.areas = [];
    this.competenceCodes = [];

    const screen = await render(
      <template><Production @areas={{self.areas}} @competenceCodes={{self.competenceCodes}} /></template>,
    );

    assert.dom(screen.getByRole('heading', { name: 'En production' })).exists();
  });
});

import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import ThemeProfile from 'pixeditor/components/target-profile/theme-profile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/theme-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it filter', async function (assert) {
    const self = this;

    // given
    const theme = EmberObject.create({
      name: 'theme_name',
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }, { selectedLevel: false }],
    });

    this.theme = theme;
    this.filter = true;

    // when
    const screen = await render(<template><ThemeProfile @theme={{self.theme}} @filter={{self.filter}} /></template>);

    // then
    assert.dom(screen.getByRole('heading', { level: 3, name: 'theme_name' })).exists();
    assert.strictEqual(screen.getAllByRole('checkbox').length, 2);
  });
});

import { render } from '@1024pix/ember-testing-library';
import Theme from 'pixeditor/components/form/theme';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | form/theme', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display theme name in french and in english', async function (assert) {
    const self = this;

    // given
    const theme = {
      name: 'themeName',
      nameEnUs: 'themeNameEnUs',
    };
    this.theme = theme;

    // when
    const screen = await render(<template><Theme @theme={{self.theme}} /></template>);
    // then

    const themeNameFr = screen.queryByRole('textbox', { name: 'Nom fr-fr :' });

    assert.dom(themeNameFr).exists();
    assert.dom(themeNameFr).hasValue('themeName');

    const themeNameEnUs = screen.queryByRole('textbox', { name: 'Nom en-us :' });

    assert.dom(themeNameEnUs).exists();
    assert.dom(themeNameEnUs).hasValue('themeNameEnUs');
  });
});

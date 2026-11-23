import { render } from '@ember/test-helpers';
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
    await render(<template><Theme @theme={{self.theme}} /></template>);
    // then

    assert.dom('[data-test-theme-name-field]').hasText('Nom :');
    assert.dom('[data-test-theme-name-field] input').hasValue('themeName');
  });
});

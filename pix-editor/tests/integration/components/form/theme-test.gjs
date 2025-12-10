import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Theme from 'pix-editor/components/form/theme';

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

    assert.dom('[data-test-theme-name-field]').hasText('Nom fr-fr :');
    assert.dom('[data-test-theme-name-field] input').hasValue('themeName');

    assert.dom('[data-test-theme-name-en-us-field]').hasText('Nom en-us :');
    assert.dom('[data-test-theme-name-en-us-field] input').hasValue('themeNameEnUs');
  });
});

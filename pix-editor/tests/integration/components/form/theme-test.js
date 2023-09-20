import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form/theme', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display theme name in french and in english', async function(assert) {
    // given
    const theme = {
      name: 'themeName',
      nameEnUs: 'themeNameEnUs'
    };
    this.set('theme', theme);

    // when
    await render(hbs`<Form::Theme @theme={{this.theme}}/>`);
    // then

    assert.dom('[data-test-theme-name-field]').hasText('Nom fr-fr :');
    assert.dom('[data-test-theme-name-field] input').hasValue('themeName');

    assert.dom('[data-test-theme-name-en-us-field]').hasText('Nom en-us :');
    assert.dom('[data-test-theme-name-en-us-field] input').hasValue('themeNameEnUs');
  });
});

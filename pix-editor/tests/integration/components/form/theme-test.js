import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form/theme', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display theme name', async function(assert) {
    // given
    const theme = {
      name: 'themeName'
    };
    this.set('theme', theme);

    // when
    await render(hbs`<Form::Theme @theme={{this.theme}}/>`);
    // then

    assert.dom('[data-test-theme-name-field]').hasText('Nom :');
    assert.dom('[data-test-theme-name-field] input').hasValue('themeName');
  });
});

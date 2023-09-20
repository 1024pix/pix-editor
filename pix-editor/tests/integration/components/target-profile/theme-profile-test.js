import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';


module('Integration | Component | target-profile/theme-profile', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it filter', async function(assert) {
    // given
    const theme = EmberObject.create({
      name: 'theme_name',
      productionTubes: [{ selectedLevel: 5 }, { selectedLevel: 5 }, { selectedLevel: false }]
    });

    this.set('theme', theme);
    this.set('filter', true);

    // when
    await render(hbs`<TargetProfile::ThemeProfile @theme={{this.theme}} @filter={{this.filter}}/>`);

    // then
    assert.dom('.theme-name').hasText('theme_name');
    assert.dom('[data-test-tube-profile]').exists({ count: 2 });
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | flagByLanguage', function(hooks) {
  setupRenderingTest(hooks);

  test('it should return `fr` if language is `Francophone`', async function(assert) {
    // given
    this.set('language', 'Francophone');

    // when

    await render(hbs`{{flag-by-language language}}`);

    // then

    assert.equal(this.element.textContent.trim(), 'fr');
  });

  test('it should return `fr fr-fr` if language is `Franco Français`', async function(assert) {
    // given
    this.set('language', 'Franco Français');

    // when

    await render(hbs`{{flag-by-language language}}`);

    // then

    assert.equal(this.element.textContent.trim(), 'fr fr-fr');
  });
});

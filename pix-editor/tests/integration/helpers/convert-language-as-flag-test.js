import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | convert-language-as-flag', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it should return `fr` if language is `Francophone`', async function(assert) {
    // given
    this.set('language', 'Francophone');

    // when

    await render(hbs`{{convert-language-as-flag language}}`);

    // then

    assert.equal(this.element.textContent.trim(), 'fr');
  });

  test('it should return `fr fr-fr` if language is `Franco Français`', async function(assert) {
    // given
    this.set('language', 'Franco Français');

    // when

    await render(hbs`{{convert-language-as-flag language}}`);

    // then

    assert.equal(this.element.textContent.trim(), 'fr fr-fr');
  });
});

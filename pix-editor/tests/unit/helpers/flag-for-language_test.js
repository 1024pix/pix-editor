import { flagForLanguage } from 'pix-editor/helpers/flag-for-language';
import { module, test } from 'qunit';

module('Unit | Helpers | flag for language', function () {
  test('it should return the expected flag emoji for language "fr"', function (assert) {
    // when
    const result = flagForLanguage(['fr']);

    // then
    assert.strictEqual(result, '🇫🇷');
  });

  test('it should return the expected flag emoji for language "fr-fr"', function (assert) {
    // when
    const result = flagForLanguage(['fr-fr']);

    // then
    assert.strictEqual(result, '🇫🇷');
  });

  test('it should return the expected flag emoji for language "es"', function (assert) {
    // when
    const result = flagForLanguage(['es']);

    // then
    assert.strictEqual(result, '🇪🇸');
  });

  test('it should return the expected flag emoji for language "es-419"', function (assert) {
    // when
    const result = flagForLanguage(['es-419']);

    // then
    assert.strictEqual(result, '🌎');
  });

  test('it should return the expected flag emoji for language "nl"', function (assert) {
    // when
    const result = flagForLanguage(['nl']);

    // then
    assert.strictEqual(result, '🇳🇱');
  });
});

import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | target-profiles-pdf-export', function (hooks) {
  setupTest(hooks);
  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:target-profiles-pdf-export');
  });

  module('#_getTranslatedField', function (hooks) {
    let model, keys;

    hooks.beforeEach(function () {
      model = {
        id: 'modelId',
        titleEnUs: 'English name',
        titleFrFr: 'French name',
      };
      keys = {
        en: 'titleEnUs',
        fr: 'titleFrFr',
      };
    });

    test('it should get the english field if language is `en`', async function (assert) {
      // given
      const language = 'en';

      // when
      const result = service._getTranslatedField(keys, language, model);

      // then
      assert.strictEqual(result, 'English name');
    });

    test('it should get the french field if language is `fr`', async function (assert) {
      // given
      const language = 'fr';

      // when
      const result = service._getTranslatedField(keys, language, model);

      // then
      assert.strictEqual(result, 'French name');
    });
  });

  module('#_getAreaStyle', function () {
    test('it should return the style matching the area color', async function (assert) {
      // when
      const style = service._getAreaStyle({ code: '1', color: 'cerulean' });

      // then
      assert.deepEqual(style.color, [18, 163, 255]);
      assert.strictEqual(typeof style.gradient, 'string');
    });

    test('it should return the same style for areas with the same color, whatever their code', async function (assert) {
      // when
      const style1 = service._getAreaStyle({ code: '1', color: 'emerald' });
      const style2 = service._getAreaStyle({ code: '7', color: 'emerald' });

      // then
      assert.strictEqual(style1, style2);
    });

    test('it should return the default style when the area has no known color', async function (assert) {
      // when
      const styleWithoutColor = service._getAreaStyle({ code: '1', color: '' });
      const styleWithUnknownColor = service._getAreaStyle({ code: '1', color: 'unknown' });

      // then
      assert.deepEqual(styleWithoutColor.color, [56, 138, 255]);
      assert.strictEqual(styleWithUnknownColor, styleWithoutColor);
    });
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | target-profile/pdf-export', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:target-profile/pdf-export');
  });

  module('#_getTranslatedField', function(hooks) {
    let model, keys;

    hooks.beforeEach(function () {
      model = {
        id: 'modelId',
        titleEnUs: 'English name',
        titleFrFr: 'French name',
      };
      keys = {
        en: 'titleEnUs',
        fr: 'titleFrFr'
      };
    });

    test('it should get the english field if language is `en`', async function(assert) {
      // given
      const language = 'en';

      // when
      const result = component._getTranslatedField(keys, language, model);

      // then
      assert.equal(result, 'English name');
    });

    test('it should get the french field if language is `fr`', async function(assert) {
      // given
      const language = 'fr';

      // when
      const result = component._getTranslatedField(keys, language, model);

      // then
      assert.equal(result, 'French name');
    });
  });
});

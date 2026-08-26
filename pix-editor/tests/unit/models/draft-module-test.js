import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | draft-module', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#displayedValidationErrors', function () {
    test('it filters out schema-shape errors, already detected live by Monaco Editor', function (assert) {
      // given
      const draftModule = store.createRecord('draft-module', {
        validationErrors: [
          { message: 'Le slug est mal formatté', isSchemaError: true },
          { message: "Problème de duplications d'Ids", isSchemaError: false },
        ],
      });

      // when
      const displayedValidationErrors = draftModule.displayedValidationErrors;

      // then
      assert.deepEqual(displayedValidationErrors, [
        { message: "Problème de duplications d'Ids", isSchemaError: false },
      ]);
    });

    test('it returns an empty array when there are no validation errors', function (assert) {
      // given
      const draftModule = store.createRecord('draft-module', { validationErrors: null });

      // when
      const displayedValidationErrors = draftModule.displayedValidationErrors;

      // then
      assert.deepEqual(displayedValidationErrors, []);
    });
  });
});

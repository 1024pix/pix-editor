import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | draft-module', function (hooks) {
  setupTest(hooks);

  module('#displayedValidationErrors', function () {
    test('it filters out schema-shape errors, already detected live by Monaco Editor', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
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

    module('when there are no validation errors', function () {
      test('it returns an empty array', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftModule = store.createRecord('draft-module', { validationErrors: null });

        // when
        const displayedValidationErrors = draftModule.displayedValidationErrors;

        // then
        assert.deepEqual(displayedValidationErrors, []);
      });
    });
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | tube-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display appropriate fields', async function(assert) {
    // given
    const tube = EmberObject.create({});
    this.set('tube', tube);

    // when
    await render(hbs`<Form::Tube @tube={{this.tube}}/>`);

    // then
    assert.dom('[data-test-practical-title-fr-field]').exists();
    assert.dom('[data-test-practical-description-fr-field]').exists();
    assert.dom('[data-test-practical-title-en-field]').exists();
    assert.dom('[data-test-practical-description-en-field]').exists();
  });

  module('#not edition', function(hooks) {
    hooks.beforeEach(async function () {
      const tube = EmberObject.create({});
      this.set('tube', tube);
      this.set('edition', false);

      await render(hbs`<Form::Tube @tube={{this.tube}}
                                   @edition={{this.edition}}/>`);
    });

    test('it should display `pixId` field', function(assert) {
      // then
      assert.dom('[data-test-pix-id-field]').exists();
    });

    test('it should not display `tube.name` field', function(assert) {
      // then
      assert.dom('[data-test-name-field]').doesNotExist();
    });
  });

  module('#edition', function(hooks) {
    hooks.beforeEach(async function () {
      const tube = EmberObject.create({});
      this.set('tube', tube);
      this.set('edition', true);

      await render(hbs`<Form::Tube @tube={{this.tube}}
                                   @edition={{this.edition}}/>`);
    });

    test('it should not display `pixId` field', function(assert) {
      // then
      assert.dom('[data-test-pix-id-field]').doesNotExist();
    });

    test('it should display `tube.name` field', function(assert) {
      // then
      assert.dom('[data-test-name-field]').exists();
    });
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | id-generator', function(hooks) {
  setupTest(hooks);

  test('it generates an id', function (assert) {
    const idGenerator = this.owner.lookup('service:id-generator');
    assert.ok(idGenerator.newId().match(/^rec[a-zA-Z0-9]+$/));
  });

  test('it generates an id with a defined prefix', function (assert) {
    const idGenerator = this.owner.lookup('service:id-generator');
    assert.ok(idGenerator.newId('skill').match(/^skill[a-zA-Z0-9]+$/));
  });
});

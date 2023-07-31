import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | changelog-entry', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it should return an elementType', function(assert) {
    assert.expect(2);
    //given
    const keys = ['skill', 'challenge'];
    const expectedResults = ['acquis', 'épreuve'];

    //when
    const service = this.owner.lookup('service:changelog-entry');

    //then
    keys.forEach((key,index) => {
      assert.strictEqual(service[key], expectedResults[index]);
    });
  });
});

import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | module-schema', function (hooks) {
  setupTest(hooks);

  module('load', function () {
    test('it fetches the module JSON schema', async function (assert) {
      // given
      const moduleSchemaService = this.owner.lookup('service:module-schema');
      const schema = { type: 'object', properties: { slug: { type: 'string' } } };
      const fetchStub = sinon.stub().resolves({ json: () => Promise.resolve(schema) });

      // when
      const result = await moduleSchemaService.load(fetchStub);

      // then
      assert.deepEqual(result, schema);
      sinon.assert.calledWithExactly(fetchStub, '/api/module-schema/module-json-schema.json');
    });
  });
});

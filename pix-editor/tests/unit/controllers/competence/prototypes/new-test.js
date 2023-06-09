import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../setup-intl-rendering';

module('Unit | Controller | competence/prototypes/new', function(hooks) {
  setupIntlRenderingTest(hooks);

  module('#_setVersion', function(hooks) {
    let controller,
      messageStub,
      prototype1_1,
      savePrototypeStub,
      newPrototype1_2,
      skill;

    hooks.beforeEach(function() {
      controller = this.owner.lookup('controller:authenticated.competence/prototypes/new');
      messageStub = sinon.stub();
      controller._message = messageStub;

      const store = this.owner.lookup('service:store');

      prototype1_1 = store.createRecord('challenge', {
        id: 'rec_proto1_1',
        pixId: 'pix_proto1_1',
        genealogy: 'Prototype 1',
        version: 1,
      });

      newPrototype1_2 = store.createRecord('challenge',{
        id: 'rec_proto1_2',
        pixId: 'pix_proto1_1',
        genealogy: 'Prototype 1',
      });
      savePrototypeStub = sinon.stub().resolves(newPrototype1_2);
      newPrototype1_2.save = savePrototypeStub;

      skill = store.createRecord('skill',{
        id: 'rec_proto1_2',
        pixId: 'pix_proto1_1',
        genealogy: 'Prototype 1',
        challenges:[prototype1_1, newPrototype1_2],
      });
    });

    test('it should set proper version of a prototype', async function(assert) {
      // when
      await controller._setVersion(newPrototype1_2);

      // then
      assert.equal(newPrototype1_2.version, 2);
      assert.ok(messageStub.calledOnce);
      assert.ok(messageStub.calledWith('Nouvelle version : 2', true));
      assert.ok(savePrototypeStub.calledOnce);
    });

    test('it should not set version if is workbench prototype', async function(assert) {
      // given
      skill.name = '@workbench';

      // when
      await controller._setVersion(newPrototype1_2);

      // then
      assert.equal(newPrototype1_2.version, undefined);
      assert.notOk(messageStub.calledOnce);
      assert.notOk(savePrototypeStub.calledOnce);
    });
  });
});

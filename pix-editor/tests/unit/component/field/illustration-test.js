import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('unit | Component | field/illustration', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:field/illustration');
  });

  test('it should remove old illustration before add new illustration', async function(assert) {
    // given
    const removeIllustrationStub = sinon.stub().resolves();
    component.args.removeIllustration = removeIllustrationStub;

    const addIllustrationStub = sinon.stub();
    component.args.addIllustration = addIllustrationStub;

    const file =  {
      name: 'file_name',
      size: 123,
      type: 'image/png',
    };

    // when
    await component.add(file);

    // then
    assert.ok(removeIllustrationStub.calledOnce);
    assert.ok(addIllustrationStub.calledWith(file));
  });
});

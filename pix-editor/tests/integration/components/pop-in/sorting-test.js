import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { drag } from 'ember-sortable/test-support';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | pop-in/sorting', function(hooks) {
  setupRenderingTest(hooks);
  let modelToSort1, modelToSort2, modelToSort3, approveActionStub, denyActionStub;

  hooks.beforeEach(function () {
    // given
    modelToSort1 = EmberObject.create({
      name: 'model_1',
      index: 0
    });
    modelToSort2 = EmberObject.create({
      name: 'model_2',
      index: 1
    });
    modelToSort3 = EmberObject.create({
      name: 'model_3',
      index: 2
    });
    approveActionStub = sinon.stub();
    denyActionStub = sinon.stub();
    this.set('sortingModel', [modelToSort1, modelToSort2, modelToSort3]);
    this.set('title', 'My title');
    this.set('approveAction', approveActionStub);
    this.set('denyAction', denyActionStub);
  });

  test('it display a list of models', async function(assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.sortingModel}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    // then
    assert.dom('[data-test-sorting-pop-in-title] h1').hasText('My title');
    assert.dom('[data-test-sorting-pop-in-content] li').exists({ count: 3 });
  });

  test('it should reorder models', async function (assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.sortingModel}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    const draggableItem = findAll('[data-test-sorting-pop-in-content] .sortable-item')[1];
    await drag('mouse', draggableItem, () => { return { dy: draggableItem.offsetHeight * 2 + 1, dx: undefined };});

    // then
    assert.strictEqual(modelToSort2.index, 2);
    assert.strictEqual(modelToSort3.index, 1);
  });

  test('it should trigger approve action', async function (assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.sortingModel}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    await click('[data-test-sorting-pop-in-approve]');

    // then
    assert.deepEqual(approveActionStub.getCall(0).args[0], [modelToSort1, modelToSort2, modelToSort3]);
  });

  test('it should trigger deny action', async function (assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.sortingModel}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    await click('[data-test-sorting-pop-in-deny]');

    // then
    assert.deepEqual(denyActionStub.getCall(0).args[0], [modelToSort1, modelToSort2, modelToSort3]);
  });
});

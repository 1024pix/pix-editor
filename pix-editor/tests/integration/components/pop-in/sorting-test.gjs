import { render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import { drag } from 'ember-sortable/test-support';
import Sorting from 'pixeditor/components/pop-in/sorting';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in/sorting', function (hooks) {
  setupIntlRenderingTest(hooks);
  let modelToSort1,
    modelToSort2,
    modelToSort3,
    approveActionStub,
    denyActionStub,
    sortingModel,
    title,
    approveAction,
    denyAction;

  hooks.beforeEach(function () {
    // given
    modelToSort1 = EmberObject.create({
      name: 'model_1',
      index: 0,
    });
    modelToSort2 = EmberObject.create({
      name: 'model_2',
      index: 1,
    });
    modelToSort3 = EmberObject.create({
      name: 'model_3',
      index: 2,
    });
    approveActionStub = sinon.stub();
    denyActionStub = sinon.stub();
    sortingModel = [modelToSort1, modelToSort2, modelToSort3];
    title = 'My title';
    approveAction = approveActionStub;
    denyAction = denyActionStub;
  });

  test('it display a list of models', async function (assert) {
    // when
    const screen = await render(
      <template>
        <Sorting
          @title={{title}}
          @model={{sortingModel}}
          @onDeny={{denyAction}}
          @onApprove={{approveAction}}
          @showModal={{true}}
        />
      </template>,
    );

    // then
    const dialog = screen.getByRole('dialog', { name: 'My title' });
    assert.dom(dialog).exists();
    assert.dom(within(dialog).getByRole('button', { name: 'model_1' })).exists();
    assert.dom(within(dialog).getByRole('button', { name: 'model_2' })).exists();
    assert.dom(within(dialog).getByRole('button', { name: 'model_3' })).exists();
  });

  test('it should reorder models', async function (assert) {
    // when
    const screen = await render(
      <template>
        <Sorting
          @title={{title}}
          @model={{sortingModel}}
          @onDeny={{denyAction}}
          @onApprove={{approveAction}}
          @showModal={{true}}
        />
      </template>,
    );

    const draggableItem = screen.getByRole('button', { name: 'model_2' });
    await drag('mouse', draggableItem, () => {
      return { dy: draggableItem.offsetHeight * 2 + 1, dx: undefined };
    });

    // then
    assert.strictEqual(modelToSort2.index, 2);
    assert.strictEqual(modelToSort3.index, 1);
  });

  test('it should trigger approve action', async function (assert) {
    // when
    const screen = await render(
      <template>
        <Sorting
          @title={{title}}
          @model={{sortingModel}}
          @onDeny={{denyAction}}
          @onApprove={{approveAction}}
          @showModal={{true}}
        />
      </template>,
    );

    await click(screen.getByRole('button', { name: 'Ok' }));

    // then
    assert.deepEqual(approveActionStub.getCall(0).args[0], [modelToSort1, modelToSort2, modelToSort3]);
  });

  test('it should trigger deny action', async function (assert) {
    // when
    const screen = await render(
      <template>
        <Sorting
          @title={{title}}
          @model={{sortingModel}}
          @onDeny={{denyAction}}
          @onApprove={{approveAction}}
          @showModal={{true}}
        />
      </template>,
    );

    await click(screen.getByRole('button', { name: 'Annuler' }));

    // then
    assert.deepEqual(denyActionStub.getCall(0).args[0], [modelToSort1, modelToSort2, modelToSort3]);
  });
});

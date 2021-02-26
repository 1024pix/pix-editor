import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, findAll } from '@ember/test-helpers';
import { drag }  from 'ember-sortable/test-support/helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | pop-in/sorting', function(hooks) {
  setupRenderingTest(hooks);
  let theme1, theme2, theme3, approveActionStub, denyActionStub;

  hooks.beforeEach(async function () {
    // given
    theme1 = EmberObject.create({
      name: 'theme_1',
      index: 0
    });
    theme2 = EmberObject.create({
      name: 'theme_2',
      index: 1
    });
    theme3 = EmberObject.create({
      name: 'theme_3',
      index: 2
    });
    approveActionStub = sinon.stub();
    denyActionStub = sinon.stub();
    this.set('themes', [theme1, theme2, theme3]);
    this.set('title', 'My title');
    this.set('approveAction', approveActionStub);
    this.set('denyAction', denyActionStub);

    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.themes}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);
  });

  test('it display a list of models', function(assert) {

    // then
    assert.dom('[data-test-sorting-pop-in-title]').hasText('My title');
    assert.dom('[data-test-sorting-pop-in-content] li').exists({ count: 3 });
  });

  test('it should reorder themes', async function (assert) {
    // when
    const draggableItem = findAll('[data-test-sorting-pop-in-content] .sortable-item')[1];
    await drag('mouse', draggableItem, () => { return { dy: draggableItem.offsetHeight * 2 + 1, dx: undefined };});

    // then
    assert.ok(theme2.index === 2);
    assert.ok(theme3.index === 1);
  });

  test('it should trigger approve action', async function (assert) {
    // when
    await click('[data-test-sorting-pop-in-approve]');

    // then
    assert.deepEqual(approveActionStub.getCall(0).args[0], [theme1, theme2, theme3]);
  });

  test('it should trigger deny action', async function (assert) {
    // when
    await click('[data-test-sorting-pop-in-deny]');

    // then
    assert.deepEqual(denyActionStub.getCall(0).args[0], [theme1, theme2, theme3]);
  });
});

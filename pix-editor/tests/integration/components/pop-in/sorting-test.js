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

  hooks.beforeEach(function () {
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
  });

  test('it display a list of models', async function(assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.themes}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    // then
    assert.dom('[data-test-sorting-pop-in-title]').hasText('My title');
    assert.dom('[data-test-sorting-pop-in-content] li').exists({ count: 3 });
  });

  test('it should reorder themes', async function (assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.themes}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    const draggableItem = findAll('[data-test-sorting-pop-in-content] .sortable-item')[1];
    await drag('mouse', draggableItem, () => { return { dy: draggableItem.offsetHeight * 2 + 1, dx: undefined };});

    // then
    assert.ok(theme2.index === 2);
    assert.ok(theme3.index === 1);
  });

  test('it should trigger approve action', async function (assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.themes}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    await click('[data-test-sorting-pop-in-approve]');

    // then
    assert.deepEqual(approveActionStub.getCall(0).args[0], [theme1, theme2, theme3]);
  });

  test('it should trigger deny action', async function (assert) {
    // when
    await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.themes}}
                                     @onDeny={{this.denyAction}}
                                     @onApprove={{this.approveAction}} />`);

    await click('[data-test-sorting-pop-in-deny]');

    // then
    assert.deepEqual(denyActionStub.getCall(0).args[0], [theme1, theme2, theme3]);
  });

  module('#isTubesSorting', function (hooks) {
    let tube1_1, tube1_2, tube1_3;

    hooks.beforeEach(async function () {
      tube1_1 = EmberObject.create({
        name: 'Tube_1',
        index: 0
      });

      tube1_2 = EmberObject.create({
        name: 'Tube_2',
        index: 1
      });

      tube1_3 = EmberObject.create({
        name: 'Tube_3',
        index: 2
      });

      theme1.tubes = [tube1_1, tube1_2, tube1_3];

      this.set('sortingName', 'tube');

      // when
      await render(hbs`<PopIn::Sorting @title={{this.title}}
                                     @model={{this.themes}}
                                     @onDeny={{this.denyAction}}
                                     @sortingName={{this.sortingName}}
                                     @onApprove={{this.approveAction}} />`);
    });

    test('it should display a select of themes', async function (assert) {
      // given
      const expectedOptionTexts = ['theme_1', 'theme_2', 'theme_3'];

      // when
      await click('[data-test-select-theme] .ember-basic-dropdown-trigger');
      const selectOptions = findAll('.ember-power-select-options li');

      // then
      selectOptions.forEach((selectOption, index)=>{
        assert.dom(selectOption).hasText(expectedOptionTexts[index]);
      });
    });

    test('it should display a list of tubes', async function (assert) {
      // given
      const expectedTubesList = ['Tube_1', 'Tube_2', 'Tube_3'];

      // when
      await click('[data-test-select-theme] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options li')[0]);

      const tubesList = findAll('[data-test-sorting-pop-in-content] .sortable-item');

      // then
      tubesList.forEach((tube, index)=>{
        assert.dom(tube).hasText(expectedTubesList[index]);
      });
    });
  });
});

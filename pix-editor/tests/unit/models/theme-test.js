import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | theme', function(hooks) {
  setupTest(hooks);
  let store;
  let tube_1, tube_2, tube_3, tube_4;
  let theme;

  hooks.beforeEach (function() {
    store = this.owner.lookup('service:store');

    const activeSkill_1 = store.createRecord('skill', {
      status: 'actif',
      challenges: [ store.createRecord('challenge', {
        genealogy: 'Prototype 1',
        status: 'validé'
      })]
    });
    const activeSkill_2 = store.createRecord('skill', {
      status: 'actif',
      challenges: [ store.createRecord('challenge', {
        genealogy: 'Prototype 1',
        status: 'validé'
      })]
    });

    const deadSkill = store.createRecord('skill', {
      status: 'périmé'
    });

    tube_1 = store.createRecord('tube', {
      name: '@workbench'
    });

    tube_2 = store.createRecord('tube', {
      name: '@tube_2',
      selectedLevel: 2,
      index: 0,
      rawSkills: [activeSkill_1]
    });

    tube_3 = store.createRecord('tube', {
      name: '@tube_3',
      index: 1,
      rawSkills: [deadSkill]
    });

    tube_4 = store.createRecord('tube', {
      name: '@tube_4',
      index: 2,
      rawSkills: [activeSkill_2]
    });

    theme = run(() => store.createRecord('theme', {
      name: 'themeName',
      rawTubes: [
        tube_4,
        tube_1,
        tube_2,
        tube_3
      ]
    }));
  });

  test('it should not return workbench tubes', function(assert) {
    assert.expect(3);
    // when
    const tubes = theme.tubes;

    // then
    tubes.forEach((tube) => {
      assert.ok(['@tube_2', '@tube_3', '@tube_4'].includes(tube.name));
    });
  });

  test('it should return sorted production tubes', function(assert) {
    assert.expect(2);
    // when
    const tubes = theme.productionTubes;
    const expectedSortedTube = ['@tube_2', '@tube_4'];

    // then
    tubes.forEach((tube, index) => {
      assert.equal(tube.name, expectedSortedTube[index]);
    });
  });

  test('it should return number of  selected tubes', function(assert) {
    // when
    const selectedProductionTubeLength = theme.selectedProductionTubeLength;

    // then
    assert.equal(selectedProductionTubeLength, 1);
  });

  module('#hasSelectedProductionTube', function () {
    test('it should be true if has selected tube', function(assert) {
      // when
      const hasSelectedProductionTube = theme.hasSelectedProductionTube;

      // then
      assert.ok(hasSelectedProductionTube);

    });

    test('it should be false if has no selected tube', function(assert) {
      // given
      theme = run(() => store.createRecord('theme', {
        name: 'themeName',
        rawTubes: [
          tube_1,
          tube_3
        ]
      }));

      // when
      const hasSelectedProductionTube = theme.hasSelectedProductionTube;

      // then
      assert.notOk(hasSelectedProductionTube);

    });
  });


});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | target-profile', function (hooks) {
  setupTest(hooks);
  let tube, skill1, skill2, skill5, skill6, controller;
  hooks.beforeEach(function () {
    // given
    skill1 = {
      id: 'rec321654',
      pixId: 'rec321654',
      name: 'skill1',
      level: 1
    };
    skill2 = {
      id: 'rec321655',
      pixId: 'rec321655',
      name: 'skill2',
      level: 2
    };
    skill5 = {
      id: 'rec321656',
      pixId: 'rec321656',
      name: 'skill5',
      level: 5
    };
    skill6 = {
      id: 'rec321657',
      pixId: 'rec321657',
      name: 'skill6',
      level: 6
    };
    tube = {
      id: 'rec123456',
      name: 'tube1',
      selectedLevel: 5,
      selectedSkills: [skill1.id, skill2.id, skill5.id],
      selectedThematicResultLevel: 2,
      selectedThematicResultSkills: [skill1.id, skill2.id],
      productionSkills: [skill1, skill2, skill5, skill6]
    };
    controller = this.owner.lookup('controller:target-profile');
  });

  test('it should set tube-level arguments for production tube', function (assert) {
    // when
    controller.displayTube(tube);

    const expectedResult = [
      tube,
      tube.productionSkills,
      tube.selectedLevel,
      tube.selectedSkills,
      controller.setProfileTube,
      controller.unsetProfileTube,
      true
    ];

    // then
    const tubeLevelArguments = [controller.selectedTube,
      controller.tubeSkills,
      controller.selectedTubeLevel,
      controller.selectedTubeSkills,
      controller.setTubeAction,
      controller.clearTubeAction,
      controller.displayTubeLevel];

    tubeLevelArguments.forEach((value, i) => {
      assert.equal(value, expectedResult[i]);
    });
  });
  test('it should set a profile tube, with a level and a list of production skill id under this level ', function (assert) {
    // when
    controller.setProfileTube(tube, 2, [skill1.id, skill2.id]);

    // then
    assert.deepEqual([tube.selectedLevel, tube.selectedSkills], [2, [skill1.id, skill2.id]]);
  });

  test('it should set a profile tube, with a levelMax if have no level parameter', function (assert) {
    // when
    controller.setProfileTube(tube);

    // then
    assert.deepEqual([tube.selectedLevel, tube.selectedSkills], [6, [skill1.id, skill2.id, skill5.id, skill6.id]]);
  });

  test('it should reset a profile tube', function (assert) {
    // when
    controller.unsetProfileTube(tube);

    // then
    assert.deepEqual([tube.selectedLevel, tube.selectedSkills], [false, []]);
  });
  test('it should set tube-level arguments for thematic result tube', function (assert) {
    // when
    controller.displayThematicResultTube(tube);

    const expectedResult = [
      tube,
      [skill1, skill2, skill5],
      tube.selectedThematicResultLevel,
      tube.selectedThematicResultSkills,
      controller.setThematicResultTube,
      controller.unsetThematicResultTube,
      true
    ];

    // then
    const tubeLevelArguments = [controller.selectedTube,
      controller.tubeSkills,
      controller.selectedTubeLevel,
      controller.selectedTubeSkills,
      controller.setTubeAction,
      controller.clearTubeAction,
      controller.displayTubeLevel];

    tubeLevelArguments.forEach((value, i) => {
      assert.deepEqual(value, expectedResult[i]);
    });
  });
  test('it should set a thematic result tube, with a level and a list of production skill id under this level ', function (assert) {
    // when
    controller.setThematicResultTube(tube, 1, [skill1.id]);

    // then
    assert.deepEqual([tube.selectedThematicResultLevel, tube.selectedThematicResultSkills], [1, [skill1.id]]);
  });

  test('it should reset a thematic result tube', function (assert) {
    // when
    controller.unsetThematicResultTube(tube);

    // then
    assert.deepEqual([tube.selectedThematicResultLevel, tube.selectedThematicResultSkills], [false, []]);
  });
});

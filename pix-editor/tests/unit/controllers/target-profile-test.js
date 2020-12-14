import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | target-profile', function (hooks) {
  setupTest(hooks);
  let tube1, skill1, skill2, skill5, skill6, skill7, skill8, skill9, tube2, areas, controller;
  hooks.beforeEach(function () {
    // given
    skill1 = {
      id: 'rec321654',
      pixId: 'pix321654',
      name: 'skill1',
      level: 1
    };
    skill2 = {
      id: 'rec321655',
      pixId: 'pix321655',
      name: 'skill2',
      level: 2
    };
    skill5 = {
      id: 'rec321656',
      pixId: 'pix321656',
      name: 'skill5',
      level: 5
    };
    skill6 = {
      id: 'rec321657',
      pixId: 'pix321657',
      name: 'skill6',
      level: 6
    };
    tube1 = {
      id: 'rec123456',
      name: 'tube1',
      selectedLevel: 5,
      selectedSkills: [skill1.pixId, skill2.pixId, skill5.pixId],
      selectedThematicResultLevel: 2,
      selectedThematicResultSkills: [skill1.pixId, skill2.pixId],
      productionSkills: [skill1, skill2, skill5, skill6]
    };
    skill7 = {
      id: 'recSkill2_1_1',
      pixId: 'pixSkill2_1_1',
      name: 'skill2_1_1',
      level: 1
    };
    skill8 = {
      id: 'recSkill2_1_2',
      pixId: 'pixSkill2_1_2',
      name: 'skill2_1_2',
      level: 2
    };
    skill9 = {
      id: 'recSkill2_1_4',
      pixId: 'pixSkill2_1_4',
      name: 'skill2_1_4',
      level: 4
    };
    tube2 =  {
      id: 'rec123456',
      name: 'tube1',
      selectedLevel: 4,
      selectedSkills: [skill7.pixId, skill8.pixId, skill9.pixId],
      selectedThematicResultLevel: 1,
      selectedThematicResultSkills: [skill7.pixId],
      productionSkills: [skill7, skill8, skill9]
    };

    areas = [
      {
        id: 'recArea1',
        competences: [
          {
            id: 'recCompetence1_1',
            tubes: [tube1]
          }
        ]
      }, {
        id: 'recArea2',
        competences: [
          {
            id: 'recCompetence2_1',
            tubes: [tube2]
          }
        ]
      },
    ];
    controller = this.owner.lookup('controller:target-profile');
  });

  test('it should set tube-level arguments for production tube', function (assert) {
    // when
    controller.displayTube(tube1);

    const expectedResult = [
      tube1,
      tube1.productionSkills,
      tube1.selectedLevel,
      tube1.selectedSkills,
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
    controller.setProfileTube(tube1, 2, [skill1.pixId, skill2.pixId]);

    // then
    assert.deepEqual([tube1.selectedLevel, tube1.selectedSkills], [2, [skill1.pixId, skill2.pixId]]);
  });

  test('it should set a profile tube, with a levelMax if have no level parameter', function (assert) {
    // when
    controller.setProfileTube(tube1);

    // then
    assert.deepEqual([tube1.selectedLevel, tube1.selectedSkills], [6, [skill1.pixId, skill2.pixId, skill5.pixId, skill6.pixId]]);
  });

  test('it should reset a profile tube', function (assert) {
    // when
    controller.unsetProfileTube(tube1);

    // then
    assert.deepEqual([tube1.selectedLevel, tube1.selectedSkills], [false, []]);
  });
  test('it should set tube-level arguments for thematic result tube', function (assert) {
    // when
    controller.displayThematicResultTube(tube1);

    const expectedResult = [
      tube1,
      [skill1, skill2, skill5],
      tube1.selectedThematicResultLevel,
      tube1.selectedThematicResultSkills,
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
    controller.setThematicResultTube(tube1, 1, [skill1.pixId]);

    // then
    assert.deepEqual([tube1.selectedThematicResultLevel, tube1.selectedThematicResultSkills], [1, [skill1.pixId]]);
  });

  test('it should reset a thematic result tube', function (assert) {
    // when
    controller.unsetThematicResultTube(tube1);

    // then
    assert.deepEqual([tube1.selectedThematicResultLevel, tube1.selectedThematicResultSkills], [false, []]);
  });

  test('it generate a file with a list of profile skills ids', function (assert) {
    // given
    const fileSaverStub = sinon.stub();
    controller.fileSaver.saveAs = fileSaverStub;

    controller.model = [{ ...areas[0], source: areas[0] }, { ...areas[1], source: areas[1] }];
    controller._selectedSources = areas;

    // when
    controller.generate('title');
    const expectedResult = `${skill1.pixId},${skill2.pixId},${skill5.pixId},${skill7.pixId},${skill8.pixId},${skill9.pixId}`;

    // then
    assert.deepEqual(controller.fileSaver.saveAs.getCall(0).args[0], expectedResult);
  });

  test('it generate a file with a list of thematic result skills ids', function (assert) {
    // given
    const fileSaverStub = sinon.stub();
    controller.fileSaver.saveAs = fileSaverStub;

    controller.model = [{ ...areas[0], source: areas[0] }, { ...areas[1], source: areas[1] }];
    controller._selectedSources = areas;

    // when
    controller.generateThematicResult('title');
    const expectedResult = `${skill1.pixId},${skill2.pixId},${skill7.pixId}`;

    // then
    assert.deepEqual(controller.fileSaver.saveAs.getCall(0).args[0], expectedResult);
  });

});

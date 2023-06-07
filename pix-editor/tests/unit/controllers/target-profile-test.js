import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | target-profile', function (hooks) {
  setupTest(hooks);
  let tube1, skill1, skill2, skill5, skill6, skill7, skill8, skill9, tube2, areas, framework, controller;
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
      pixId: 'pix123456',
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
    tube2 = {
      id: 'rec123457',
      pixId: 'pix123457',
      name: 'tube1',
      selectedLevel: 4,
      selectedSkills: [skill7.pixId, skill8.pixId, skill9.pixId],
      selectedThematicResultLevel: 1,
      selectedThematicResultSkills: [skill7.pixId],
      productionSkills: [skill7, skill8, skill9]
    };

    const area1 = {
      id: 'recArea1',
      competences: [
        {
          id: 'recCompetence1_1',
          tubes: [tube1]
        }
      ]
    };
    const area2 = {
      id: 'recArea2',
      competences: [
        {
          id: 'recCompetence2_1',
          tubes: [tube2]
        }
      ]
    };
    areas = [area1, area2];
    framework = {
      name: 'Pix',
      areas
    };
    area1.framework = framework;
    area2.framework = framework;
    controller = this.owner.lookup('controller:authenticated.target-profile');
  });

  test('it should set tube-level arguments for production tube', function (assert) {
    assert.expect(7);
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
    assert.expect(7);
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
    controller._selectedFrameworks = [{ data: framework }];

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
    controller._selectedFrameworks = [{ data: framework }];

    // when
    controller.generateThematicResult('title');
    const expectedResult = `${skill1.pixId},${skill2.pixId},${skill7.pixId}`;

    // then
    assert.deepEqual(controller.fileSaver.saveAs.getCall(0).args[0], expectedResult);
  });

  test('it should save profile state', function (assert) {
    // given
    const fileSaverStub = sinon.stub();
    controller.fileSaver.saveAs = fileSaverStub;
    controller._selectedFrameworks = [{ data: framework }];

    const expectedResult = JSON.stringify([
      {
        id: 'pix123456',
        level: 5,
        skills: ['pix321654', 'pix321655', 'pix321656']
      }, {
        id: 'pix123457',
        level: 4,
        skills: ['pixSkill2_1_1', 'pixSkill2_1_2', 'pixSkill2_1_4']
      }]);

    // when
    controller.save();

    // then
    assert.deepEqual(fileSaverStub.getCall(0).args[0], expectedResult);
  });

  module('_determineFileType', function () {
    test('should return orga when the file is an array of strings', function(assert) {
      // given
      const data = ['1', '2'];

      // when
      const result = controller._determineFileType(data);

      // then
      assert.equal(result, 'orga');
    });

    test('should return editor when the file is an array of objects', function(assert) {
      // given
      const data = [{ id: '1' }, { id: '2' }];

      // when
      const result = controller._determineFileType(data);

      // then
      assert.equal(result, 'editor');
    });
  });

  module('_buildTargetProfileFromFile', function (hooks) {
    let skill10, skill11, skill12, tube3, area3, framework2;

    hooks.beforeEach(function () {
      skill10 = {
        id: 'recSkill3_1_1',
        pixId: 'pixSkill3_1_1',
        name: 'skill3_1_1',
        level: 1
      };
      skill11 = {
        id: 'recSkill3_1_2',
        pixId: 'pixSkill3_1_2',
        name: 'skill3_1_2',
        level: 2
      };
      skill12 = {
        id: 'recSkill3_1_6',
        pixId: 'pixSkill3_1_6',
        name: 'skill3_1_6',
        level: 6
      };
      tube3 = {
        id: 'rec666457',
        pixId: 'pix666457',
        name: 'tube3',
        productionSkills: [skill10, skill11, skill12]
      };
      area3 = {
        id: 'recArea3',
        competences: [{
          id: 'recCompetence3_1',
          tubes: [tube3]
        }]
      };
      framework2 = {
        name: 'Pix+',
        areas: [area3]
      };
      area3.framework = framework2;

      this.owner.register('service:currentData', class MockService extends Service {

        getAreas() {
          return [area3, ...areas];
        }

        getFrameworks() {
          return [framework, framework2];
        }
      });
    });

    test('it should build a profile state from pix-editor json file', async function(assert) {
      // given
      const fileContent = [
        {
          id: 'pix123456',
          level: 'max',
        }, {
          id: 'pix666457',
          level: 2,
          skills: ['pixSkill3_1_1', 'pixSkill3_1_2']
        }
      ];

      const expectedTube1 = {
        id: 'rec123456',
        pixId: 'pix123456',
        name: 'tube1',
        selectedLevel: 6,
        selectedSkills: [skill1.pixId, skill2.pixId, skill5.pixId, skill6.pixId],
        selectedThematicResultLevel: 2,
        selectedThematicResultSkills: [skill1.pixId, skill2.pixId],
        productionSkills: [skill1, skill2, skill5, skill6]
      };

      const expectedTube2 = {
        id: 'rec123457',
        pixId: 'pix123457',
        name: 'tube1',
        selectedLevel: false,
        selectedSkills: [],
        selectedThematicResultLevel: 1,
        selectedThematicResultSkills: [skill7.pixId],
        productionSkills: [skill7, skill8, skill9]
      };

      const expectedTube3 = {
        id: 'rec666457',
        pixId: 'pix666457',
        name: 'tube3',
        selectedLevel: 2,
        selectedSkills: [skill10.pixId, skill11.pixId],
        productionSkills: [skill10, skill11, skill12]
      };

      const explectedSelectedFrameworks = [
        { data: framework, label: 'Pix' },
        { data: framework2, label: 'Pix+' },
      ];

      // when
      await controller._buildTargetProfileFromFile(fileContent);

      // then
      assert.deepEqual(tube1, expectedTube1);
      assert.deepEqual(tube2, expectedTube2);
      assert.deepEqual(tube3, expectedTube3);
      assert.deepEqual(controller._selectedFrameworks, explectedSelectedFrameworks);
    });

    test('it should build a profile state from orga json file', async function(assert) {
      // given
      const fileContent = ['pix123456', 'pix666457'];
      const expectedTube1 = {
        id: 'rec123456',
        pixId: 'pix123456',
        name: 'tube1',
        selectedLevel: 6,
        selectedSkills: [skill1.pixId, skill2.pixId, skill5.pixId, skill6.pixId],
        selectedThematicResultLevel: 2,
        selectedThematicResultSkills: [skill1.pixId, skill2.pixId],
        productionSkills: [skill1, skill2, skill5, skill6]
      };

      const expectedTube2 = {
        id: 'rec123457',
        pixId: 'pix123457',
        name: 'tube1',
        selectedLevel: false,
        selectedSkills: [],
        selectedThematicResultLevel: 1,
        selectedThematicResultSkills: [skill7.pixId],
        productionSkills: [skill7, skill8, skill9]
      };

      const expectedTube3 = {
        id: 'rec666457',
        pixId: 'pix666457',
        name: 'tube3',
        selectedLevel: 6,
        selectedSkills: [skill10.pixId, skill11.pixId, skill12.pixId],
        productionSkills: [skill10, skill11, skill12]
      };

      const explectedSelectedFrameworks = [
        { data: framework, label: 'Pix' },
        { data: framework2, label: 'Pix+' },
      ];

      // when
      await controller._buildTargetProfileFromFile(fileContent);

      // then
      assert.deepEqual(tube1, expectedTube1);
      assert.deepEqual(tube2, expectedTube2);
      assert.deepEqual(tube3, expectedTube3);
      assert.deepEqual(controller._selectedFrameworks, explectedSelectedFrameworks);
    });
  });
});

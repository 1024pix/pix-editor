import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('unit | Component | sidebar/export', function(hooks) {
  setupTest(hooks);
  let component, areas;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:sidebar/export');

    const productionSkill_1_1 = [
      {
        name: 'skill1_1', level: 1
      }, {
        name: 'skill1_3', level: 3
      }, {
        name: 'skill1_6', level: 6
      }
    ];

    const productionSkill_1_2 = [
      {
        name: 'skill2_2', level: 2
      }, {
        name: 'skill2_3', level: 3
      }, {
        name: 'skill2_4', level: 4
      }
    ];

    const productionSkill_2_1 = [
      {
        name: 'skill3_1', level: 1
      }, {
        name: 'skill3_5', level: 5
      }, {
        name: 'skill3_6', level: 6
      }
    ];

    const productionTubes_1_1 = {
      name: 'tube1',
      title: 'title_tube1',
      description: 'description_tube1',
      practicalTitleFr: 'practicalTitleFr_tube1',
      practicalDescriptionFr: 'practicalDescriptionFr_tube1',
      productionSkills: productionSkill_1_1,
      rawSkills: productionSkill_1_1,
    };

    const productionTubes_1_2 = {
      name: 'tube2',
      title: 'title_tube2',
      description: 'description_tube2',
      practicalTitleFr: 'practicalTitleFr_tube2',
      practicalDescriptionFr: 'practicalDescriptionFr_tube2',
      productionSkills: productionSkill_1_2,
      rawSkills: productionSkill_1_2,
    };

    const productionTubes_2_1 = {
      name: 'tube3',
      title: 'title_tube3',
      description: 'description_tube3',
      practicalTitleFr: 'practicalTitleFr_tube3',
      practicalDescriptionFr: 'practicalDescriptionFr_tube3',
      productionSkills: productionSkill_2_1,
      rawSkills: productionSkill_2_1,
    };

    const theme1 = {
      name: 'theme1',
      productionTubes: [productionTubes_1_1, productionTubes_1_2],
      rawTubes: [productionTubes_1_1, productionTubes_1_2],
    };

    const theme2 = {
      name: 'theme2',
      productionTubes: [productionTubes_2_1],
      rawTubes: [productionTubes_2_1],
    };

    const competence1 = {
      name: 'competence1',
      sortedThemes: [theme1],
      rawThemes: [theme1],
    };

    const competence2 = {
      name: 'competence2',
      sortedThemes: [theme2],
      rawThemes: [theme2],
    };

    areas = [{
      name: 'area',
      sortedCompetences: [competence1, competence2],
      competences: [competence1, competence2],
    }];
  });

  test('it should return formatted cvs content', function(assert) {
    // given
    const expectedCsvContent = `"Domaine","Compétence","Thématique","Tube","Titre","Description","Titre pratique","Description pratique","Liste des acquis"
"area","competence1","theme1","tube1","title_tube1","description_tube1","practicalTitleFr_tube1","practicalDescriptionFr_tube1","skill1_1,░,skill1_3,░,░,skill1_6,░,░"
"area","competence1","theme1","tube2","title_tube2","description_tube2","practicalTitleFr_tube2","practicalDescriptionFr_tube2","░,skill2_2,skill2_3,skill2_4,░,░,░,░"
"area","competence2","theme2","tube3","title_tube3","description_tube3","practicalTitleFr_tube3","practicalDescriptionFr_tube3","skill3_1,░,░,░,skill3_5,skill3_6,░,░"`;

    // when
    const csvContent = component._buildCSVContent(areas);

    // then
    assert.equal(csvContent, expectedCsvContent);
  });

  test('it should format CSV string', function(assert) {
    // given
    const string = 'hello';
    const expectedResult = '"hello"';

    // when
    const result = component._formatCSVString(string);

    // then
    assert.equal(result, expectedResult);
  });

  module('#export', function(hooks) {
    let notifyMessageStub, notifyErrorStub, loaderStartStub, loaderStopStub, buildCSVContentStub;

    hooks.beforeEach(function () {
      notifyMessageStub = sinon.stub();
      notifyErrorStub = sinon.stub();

      component.notify = {
        message: notifyMessageStub,
        error: notifyErrorStub,
      };

      loaderStartStub = sinon.stub();
      loaderStopStub = sinon.stub();

      component.loader = {
        start: loaderStartStub,
        stop: loaderStopStub,
      };

      buildCSVContentStub = sinon.stub().returns('content');
      component._buildCSVContent = buildCSVContentStub;
      component.args.areas = areas;
    });

    test('it should export subjects', async function(assert) {
      // given
      const saveAsStub = sinon.stub();
      component.fileSaver = {
        saveAs: saveAsStub,
      };
      // when
      await component.shareAreas();

      // then
      assert.ok(loaderStartStub.calledWith('Récupération des sujets'));
      assert.ok(buildCSVContentStub.calledWith(areas));
      assert.equal(saveAsStub.getCall(0).args[0], 'content');
      assert.ok(notifyMessageStub.calledWith('Sujets exportés'));
      assert.ok(loaderStopStub.calledOnce);
    });

    test('it should catch an error if export subject failed', async function(assert) {
      // given
      const saveAsStub = sinon.stub().throws();
      component.fileSaver = {
        saveAs: saveAsStub,
      };

      // when
      await component.shareAreas();

      // then
      assert.ok(loaderStartStub.calledWith('Récupération des sujets'));
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.calledWith('Erreur lors de l\'exportation des sujets'));
    });
  });
});

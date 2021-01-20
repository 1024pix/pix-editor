import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | popin-select-location', function (hooks) {
  setupRenderingTest(hooks);
  let source1, source2,
    area1_1, area1_2,
    competence1_1_1, competence1_2_1, competence1_2_2,
    tube1_1_1_1, tube1_2_1_1, tube1_2_1_2, tube1_2_2_1,
    skill1_1_1_1_1, skill1_1_1_1_2,
    skill1_2_1_1_1, skill1_2_1_1_2, skill1_2_1_1_3,
    skill1_2_1_2_1, skill1_2_1_2_2,
    skill1_2_2_1_1, skill1_2_2_1_2;

  const stubRelationship = sinon.stub().resolves();

  hooks.beforeEach(function () {
    // given
    skill1_1_1_1_1 = {
      id: 'skill1_1_1_1_1',
      pixId: 'pixIdSkill1_1_1_1_1',
      name: 'skill1_1_1_1_1',
      level: 2,
      status: 'actif'
    };
    skill1_1_1_1_2 = {
      id: 'skill1_1_1_1_2',
      pixId: 'pixIdSkill1_1_1_1_2',
      name: 'skill1_1_1_1_2',
      level: 5,
      status: 'actif'
    };
    skill1_2_1_1_1 = {
      id: 'skill1_2_1_1_1',
      pixId: 'pixIdSkill1_2_1_1_1',
      name: 'skill1_2_1_1_1',
      level: 1,
      status: 'actif'
    };
    skill1_2_1_1_2 = {
      id: 'skill1_2_1_1_2',
      pixId: 'pixIdSkill1_2_1_1_2',
      name: 'skill1_2_1_1_2',
      level: 6,
      status: 'actif'
    };
    skill1_2_1_1_3 = {
      id: 'skill1_2_1_1_3',
      pixId: 'pixIdSkill1_2_1_1_3',
      name: 'skill1_2_1_1_3',
      level: 6,
      status: 'en construction'
    };
    skill1_2_1_2_1 = {
      id: 'skill1_2_1_2_1',
      pixId: 'pixIdSkill1_2_1_2_1',
      name: 'skill1_2_1_2_1',
      level: 3,
      status: 'actif'
    };
    skill1_2_1_2_2 = {
      id: 'skill1_2_1_2_2',
      pixId: 'pixIdSkill1_2_1_2_2',
      name: 'skill1_2_1_2_2',
      level: 4,
      status: 'actif'
    };
    skill1_2_2_1_1 = {
      id: 'skill1_2_2_1_1',
      pixId: 'pixIdSkill1_2_2_1_1',
      name: 'skill1_2_2_1_1',
      level: 2,
      status: 'actif'
    };
    skill1_2_2_1_2 = {
      id: 'skill1_2_2_1_2',
      pixId: 'pixIdSkill1_2_2_1_2',
      name: 'skill1_2_2_1_2',
      level: 3,
      status: 'actif'
    };
    tube1_1_1_1 = {
      name: 'tube1_1_1_1',
      rawSkills: stubRelationship(),
      filledLiveSkills: [false, [skill1_1_1_1_1], false, false, [skill1_1_1_1_2], false, false]
    };
    tube1_2_1_1 = {
      name: 'tube1_2_1_1',
      rawSkills: stubRelationship(),
      filledLiveSkills: [[skill1_2_1_1_1], false, false, false, false, [skill1_2_1_1_2, skill1_2_1_1_3], false]

    };
    tube1_2_1_2 = {
      name: 'tube1_2_1_2',
      rawSkills: stubRelationship(),
      filledLiveSkills: [false, false, [skill1_2_1_2_1], [skill1_2_1_2_2], false, false, false]
    };
    tube1_2_2_1 = {
      name: 'tube1_2_2_1',
      rawSkills: stubRelationship(),
      filledLiveSkills: [false, [skill1_2_2_1_1], [skill1_2_2_1_2], false, false, false, false]
    };
    competence1_1_1 = {
      name: 'competence1_1_1',
      rawTubes: stubRelationship(),
      sortedTubes: [tube1_1_1_1]
    };
    competence1_2_1 = {
      name: 'competence1_2_1',
      rawTubes: stubRelationship(),
      sortedTubes: [tube1_2_1_1, tube1_2_1_2]
    };
    competence1_2_2 = {
      name: 'competence1_2_2',
      rawTubes: stubRelationship(),
      sortedTubes: [tube1_2_2_1]
    };
    source1 = 'pix';
    source2 = 'pix +';
    area1_1 = {
      source: source1,
      sortedCompetences: [competence1_1_1],
    };
    area1_2 = {
      source: source1,
      sortedCompetences: [competence1_2_1, competence1_2_2],
    };

    this.owner.register('service:currentData', class MockService extends Service {
      getCompetence() {
        return competence1_2_1;
      }

      getAreas() {
        return [area1_1, area1_2];
      }

      getSources() {
        return [source1, source2];
      }

      getSource() {
        return source1;
      }
    });
  });
  module('if `isPrototypeLocation`', async function (hooks) {
    hooks.beforeEach(async function () {
      // when
      this.setSkills = sinon.stub();
      this.closeMovePrototype = () => {
      };
      tube1_2_1_1.content = tube1_2_1_1;
      this.tube = tube1_2_1_1;
      this.challenge = {
        name: 'challenge1',
        firstSkill: skill1_2_1_1_2,
        skills: [skill1_2_1_1_2]
      };

      await render(hbs`<PopIn::SelectLocation
                        @onChange={{this.setSkills}}
                        @title="Acquis du prototype"
                        @selectTubeLevel={{true}}
                        @isPrototypeLocation={{true}}
                        @tube={{this.tube}}
                        @skill={{this.challenge.firstSkill}}
                        @multipleLevel={{true}}
                        @close={{this.closeMovePrototype}} />`);
    });

    test('it should display location fields of challenge', function (assert) {
      // given
      const expectedResult = ['pix', 'competence1_2_1', 'tube1_2_1_1', 'pixIdSkill1_2_1_1_2'];

      // then
      const fields = findAll('.field .ember-power-select-selected-item');
      fields.forEach((field, i) => {
        assert.equal(field.textContent.trim(), expectedResult[i]);
      });
    });

    test('it should display a list of skills on click', async function (assert) {
      // given
      const expectedGroupResult = ['Niveau 1', 'Niveau 6'];
      const expectedOptionsResult = [ 'pixIdSkill1_2_1_1_1', 'pixIdSkill1_2_1_1_2', 'pixIdSkill1_2_1_1_3'];

      // when
      await click('[data-test-skill-list] .ember-basic-dropdown-trigger');

      // then
      const groupOptions = findAll('.ember-basic-dropdown-content>.ember-power-select-options>li');
      const options = findAll('.ember-power-select-options ul>li');

      groupOptions.forEach((groupOption, i)=>{
        assert.ok(groupOption.textContent.trim().indexOf(expectedGroupResult[i]) !== -1);
      });

      options.forEach((option, i)=>{
        assert.equal(option.textContent.trim(), expectedOptionsResult[i]);
      });
    });

    test('it should load a list of skill of selected location', async function (assert) {
      //given
      const expectedOptionsResult = [ 'pixIdSkill1_1_1_1_1', 'pixIdSkill1_1_1_1_2'];

      // when
      await click(findAll('.ember-basic-dropdown-trigger')[1]);
      await click(findAll('.ember-power-select-options li')[0]);
      await click(findAll('.ember-basic-dropdown-trigger')[2]);
      await click(findAll('.ember-power-select-options li')[0]);
      await click('[data-test-skill-list] .ember-basic-dropdown-trigger');

      // then
      const options = findAll('.ember-power-select-options ul>li');
      options.forEach((option, i)=>{
        assert.equal(option.textContent.trim(), expectedOptionsResult[i]);
      });
    });

    test('move button is disabled if no location is selected', async function (assert) {
      // when
      await click(findAll('.ember-basic-dropdown-trigger')[2]);
      await click(findAll('.ember-power-select-options li')[1]);

      // then
      assert.ok(find('[data-test-move-action]').classList.contains('disabled'));
    });

    test('it should invoke `setSkills` on click with new skill location argument', async function (assert) {
      // when
      await click(findAll('.ember-basic-dropdown-trigger')[2]);
      await click(findAll('.ember-power-select-options li')[1]);
      await click('[data-test-skill-list] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options ul>li')[0]);
      await click('[data-test-move-action]');

      // then
      assert.deepEqual(this.setSkills.getCall(0).args[0], [{
        id: 'skill1_2_1_2_1',
        pixId: 'pixIdSkill1_2_1_2_1',
        name: 'skill1_2_1_2_1',
        level: 3,
        status: 'actif'
      }]);
    });
  });
  module('if `isSkillLocation`', async function (hooks) {
    hooks.beforeEach(async function () {
      // when
      this.copyToNewLocation = sinon.stub();
      this.closeSelectLocation = () => {
      };
      tube1_2_1_1.content = tube1_2_1_1;
      this.tube = tube1_2_1_1;
      this.skill = skill1_2_1_1_2;

      await render(hbs`<PopIn::SelectLocation
                        @onChange={{this.copyToNewLocation}}
                        @title="title"
                        @selectTubeLevel={{true}}
                        @tube={{this.tube}}
                        @level={{this.skill.level}}
                        @selectEmptyLevels={{true}}
                        @isSkillLocation={{true}}
                        @close={{this.closeSelectLocation}} />`);
    });
    test('it should display a list of all skill levels', async function (assert) {
      // given
      const expectedOptionsResult = [1,2,3,4,5,6,7,8];

      // when
      await click(findAll('.ember-basic-dropdown-trigger')[3]);
      const options = findAll('.ember-power-select-options li');

      // then
      assert.equal(options.length, 8);
      options.forEach((option, i) => {
        assert.equal(option.textContent.trim(),expectedOptionsResult[i]);
      });
    });
  });
});

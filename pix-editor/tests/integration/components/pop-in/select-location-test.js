import Service from '@ember/service';
import { click, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-select-location', function(hooks) {
  setupIntlRenderingTest(hooks);
  let framework1, framework2,
    area1_1, area1_2,
    competence1_1_1, competence1_2_1, competence1_2_2,
    theme1_1_1_1, theme1_1_1_2, theme1_2_1_1,
    tube1_1_1_1, tube1_2_1_1, tube1_2_1_2, tube1_2_2_1,
    skill1_1_1_1_1, skill1_1_1_1_2,
    skill1_2_1_1_1, skill1_2_1_1_2, skill1_2_1_1_3,
    skill1_2_1_2_1, skill1_2_1_2_2,
    skill1_2_2_1_1, skill1_2_2_1_2;

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    // given
    skill1_1_1_1_1 = store.createRecord('skill', {
      id: 'skill1_1_1_1_1',
      pixId: 'pixIdSkill1_1_1_1_1',
      name: 'skill1_1_1_1_1',
      level: 2,
      version: 1,
      status: 'actif',
    });
    skill1_1_1_1_2 = store.createRecord('skill', {
      id: 'skill1_1_1_1_2',
      pixId: 'pixIdSkill1_1_1_1_2',
      name: 'skill1_1_1_1_2',
      level: 5,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_1_1 = store.createRecord('skill', {
      id: 'skill1_2_1_1_1',
      pixId: 'pixIdSkill1_2_1_1_1',
      name: 'skill1_2_1_1_1',
      level: 1,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_1_2 = store.createRecord('skill', {
      id: 'skill1_2_1_1_2',
      pixId: 'pixIdSkill1_2_1_1_2',
      name: 'skill1_2_1_1_2',
      level: 6,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_1_3 = store.createRecord('skill', {
      id: 'skill1_2_1_1_3',
      pixId: 'pixIdSkill1_2_1_1_3',
      name: 'skill1_2_1_1_3',
      level: 6,
      version: 2,
      status: 'en construction',
    });
    skill1_2_1_2_1 = store.createRecord('skill', {
      id: 'skill1_2_1_2_1',
      pixId: 'pixIdSkill1_2_1_2_1',
      name: 'skill1_2_1_2_1',
      level: 3,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_2_2 = store.createRecord('skill', {
      id: 'skill1_2_1_2_2',
      pixId: 'pixIdSkill1_2_1_2_2',
      name: 'skill1_2_1_2_2',
      level: 4,
      version: 1,
      status: 'actif',
    });
    skill1_2_2_1_1 = store.createRecord('skill', {
      id: 'skill1_2_2_1_1',
      pixId: 'pixIdSkill1_2_2_1_1',
      name: 'skill1_2_2_1_1',
      level: 2,
      version: 1,
      status: 'actif',
    });
    skill1_2_2_1_2 = store.createRecord('skill', {
      id: 'skill1_2_2_1_2',
      pixId: 'pixIdSkill1_2_2_1_2',
      name: 'skill1_2_2_1_2',
      level: 3,
      version: 1,
      status: 'actif',
    });
    tube1_1_1_1 = store.createRecord('tube', {
      name: 'tube1_1_1_1',
      rawSkills: [skill1_1_1_1_1, skill1_1_1_1_2],
    });
    tube1_2_1_1 = store.createRecord('tube', {
      name: 'tube1_2_1_1',
      rawSkills: [skill1_2_1_1_1, skill1_2_1_1_2, skill1_2_1_1_3],

    });
    tube1_2_1_2 = store.createRecord('tube', {
      name: 'tube1_2_1_2',
      rawSkills: [skill1_2_1_2_1, skill1_2_1_2_2],
    });
    tube1_2_2_1 = store.createRecord('tube', {
      name: 'tube1_2_2_1',
      rawSkills: [skill1_2_2_1_1, skill1_2_2_1_2],
    });
    theme1_1_1_1 = store.createRecord('theme', {
      name: 'theme1_1_1_1',
    });
    theme1_1_1_2 = store.createRecord('theme', {
      name: 'theme1_1_1_2',
    });
    theme1_2_1_1 = store.createRecord('theme', {
      name: 'theme1_2_1_1',
    });
    competence1_1_1 = store.createRecord('competence', {
      title: 'competence1_1_1',
      code: '1.1',
      rawTubes: [tube1_1_1_1],
      rawThemes: [theme1_1_1_1, theme1_1_1_2],
    });
    competence1_2_1 = store.createRecord('competence', {
      title: 'competence1_2_1',
      code: '2.1',
      rawTubes: [tube1_2_1_1, tube1_2_1_2],
      rawThemes: [theme1_2_1_1],
    });
    competence1_2_2 = store.createRecord('competence', {
      title: 'competence1_2_2',
      code: '2.2',
      rawTubes: [tube1_2_2_1],
      rawThemes: [],
    });
    area1_1 = store.createRecord('area', {
      competences: [competence1_1_1],
    });
    area1_2 = store.createRecord('area', {
      competences: [competence1_2_1, competence1_2_2],
    });
    framework1 = store.createRecord('framework', {
      name: 'pix',
      areas: [area1_1, area1_2],
    });
    framework2 = store.createRecord('framework', {
      name: 'pix+',
      areas: [],
    });

    this.owner.register('service:currentData', class MockService extends Service {
      getCompetence() {
        return competence1_2_1;
      }

      getAreas() {
        return [area1_1, area1_2];
      }

      getFrameworks() {
        return [framework1, framework2];
      }

      getFramework() {
        return framework1;
      }
    });
  });
  module('if `isPrototypeLocation`', function(hooks) {
    hooks.beforeEach(async function() {
      // when
      this.setSkill = sinon.stub();
      this.closeMovePrototype = () => {
      };
      tube1_2_1_1.content = tube1_2_1_1;
      this.tube = tube1_2_1_1;
      this.challenge = {
        name: 'challenge1',
        skill: skill1_2_1_1_2,
      };

      await render(hbs`<PopIn::SelectLocation
                        @onChange={{this.setSkill}}
                        @title="Acquis du prototype"
                        @selectTubeLevel={{true}}
                        @isPrototypeLocation={{true}}
                        @tube={{this.tube}}
                        @skill={{this.challenge.skill}}
                        @multipleLevel={{true}}
                        @close={{this.closeMovePrototype}} />`);
    });

    test('it should display location fields of challenge', function(assert) {
      // given
      const expectedResult = ['pix', '2.1 competence1_2_1', 'tube1_2_1_1', 'skill1_2_1_1_2 (v.1)'];

      // then
      const fields = findAll('.field .ember-power-select-selected-item');
      fields.forEach((field, i) => {
        assert.dom(field).hasText(expectedResult[i]);
      });
    });

    test('it should display a list of skills on click', async function(assert) {
      assert.expect(5);
      // given
      const expectedGroupResult = ['Niveau 1', 'Niveau 6'];
      const expectedOptionsResult = [ 'skill1_2_1_1_1 (v.1)', 'skill1_2_1_1_2 (v.1)', 'skill1_2_1_1_3 (v.2)'];

      // when
      await click('[data-test-skill-list] .ember-basic-dropdown-trigger');

      // then
      const groupOptions = findAll('.ember-basic-dropdown-content>.ember-power-select-options>li');
      const options = findAll('.ember-power-select-options ul>li');

      groupOptions.forEach((groupOption, i)=>{
        assert.notStrictEqual(groupOption.textContent.trim().indexOf(expectedGroupResult[i]), -1);
      });

      options.forEach((option, i)=>{
        assert.dom(option).hasText(expectedOptionsResult[i]);
      });
    });

    test('it should load a list of skill of selected location', async function(assert) {
      //given
      const expectedOptionsResult = [ 'skill1_1_1_1_1 (v.1)', 'skill1_1_1_1_2 (v.1)'];

      // when
      await click(findAll('.ember-basic-dropdown-trigger')[1]);
      await click(findAll('.ember-power-select-options li')[0]);
      await click(findAll('.ember-basic-dropdown-trigger')[2]);
      await click(findAll('.ember-power-select-options li')[0]);
      await click('[data-test-skill-list] .ember-basic-dropdown-trigger');

      // then
      const options = findAll('.ember-power-select-options ul>li');
      options.forEach((option, i)=>{
        assert.dom(option).hasText(expectedOptionsResult[i]);
      });
    });

    test('move button is disabled if no location is selected', async function(assert) {
      // when
      await click(findAll('.ember-basic-dropdown-trigger')[2]);
      await click(findAll('.ember-power-select-options li')[1]);

      // then
      assert.dom('[data-test-move-action]').hasAttribute('disabled');
    });

    test('it should invoke `setSkill` on click with new skill location argument', async function(assert) {
      // when
      await click(findAll('.ember-basic-dropdown-trigger')[2]);
      await click(findAll('.ember-power-select-options li')[1]);
      await click('[data-test-skill-list] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options ul>li')[0]);
      await click('[data-test-move-action]');

      // then
      assert.deepEqual(this.setSkill.getCall(0).args[0], skill1_2_1_2_1);
    });
  });
  module('if `isSkillLocation`', function(hooks) {
    hooks.beforeEach(async function() {
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
    test('it should display a list of all skill levels', async function(assert) {
      // given
      const expectedOptionsResult = [1, 2, 3, 4, 5, 6, 7, 8];

      // when
      await click(findAll('.ember-basic-dropdown-trigger')[3]);
      const options = findAll('.ember-power-select-options li');

      // then
      assert.strictEqual(options.length, 8);
      options.forEach((option, i) => {
        assert.dom(option).hasText(`${expectedOptionsResult[i]}`);
      });
    });
  });
  module('if `isTubeLocation`', function(hooks) {
    let setCompetenceStub;
    hooks.beforeEach(async function() {
      // given
      setCompetenceStub = sinon.stub();
      this.setCompetence = setCompetenceStub;
      this.name = tube1_2_1_1.name;
      theme1_2_1_1.content = theme1_2_1_1;
      this.theme = theme1_2_1_1;
      this.close = ()=>{};

      // when
      await render(hbs`<PopIn::SelectLocation @onChange={{this.setCompetence}}
                                              @name={{this.name}}
                                              @theme={{this.theme}}
                                              @isTubeLocation={{true}}
                                              @close={{this.close}} />`);
    });

    test('it should display appropriate fields', async function(assert) {
      // then
      assert.dom('[data-test-select-source]').hasText('Référentiel pix');
      assert.dom('[data-test-select-competence]').hasText('Compétence 2.1 competence1_2_1');
      assert.dom('[data-test-select-theme]').hasText('Thématique* theme1_2_1_1');
    });

    test('it should display a list of competence theme', async function(assert) {
      // given
      const expectedThemeOptions = ['theme1_1_1_1', 'theme1_1_1_2'];

      // when
      await click('[data-test-select-competence] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options li')[0]);
      await click('[data-test-select-theme] .ember-basic-dropdown-trigger');

      // then
      const themeOptions = findAll('.ember-power-select-options li');
      themeOptions.forEach((themeOption, index) => {
        assert.dom(themeOption).hasText(expectedThemeOptions[index]);
      });
    });

    test('it should disable button action if have no selected theme', async function(assert) {
      // when
      await click('[data-test-select-competence] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options li')[0]);

      // then
      assert.dom('[data-test-move-action]').hasAttribute('disabled');
    });

    test('it should call setCompetence with a competence and a theme', async function(assert) {
      // when
      await click('[data-test-select-competence] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options li')[0]);
      await click('[data-test-select-theme] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-power-select-options li')[0]);
      await click('[data-test-move-action]');

      // then
      assert.deepEqual(setCompetenceStub.getCall(0).args, [competence1_1_1, theme1_1_1_1]);
    });
  });
});

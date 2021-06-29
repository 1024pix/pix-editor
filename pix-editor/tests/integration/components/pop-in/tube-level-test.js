import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';


module('Integration | Component | popin-tube-level', function (hooks) {
  setupRenderingTest(hooks);
  let tube, skill1, skill2, skill5, skill6;

  hooks.beforeEach(async function () {
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
      selectedTubeLevel: 2,
      selectedTubeSkills: [skill1.id, skill2.id]
    };

    // when
    this.setTubeAction = sinon.stub();
    this.clearTubeAction = sinon.stub();
    this.selectedTube = tube;
    this.tubeSkills = [skill1, skill2, skill5, skill6];
    this.selectedTubeLevel = tube.selectedTubeLevel;
    this.selectedTubeSkills = tube.selectedTubeSkills;
    this.isThematicResultMode = true;
    this.closeTubeLevel = ()=>{};


    await render(hbs`<PopIn::TubeLevel  @setTubeLevel={{this.setTubeAction}}
                                        @clearTube={{this.clearTubeAction}}
                                        @skills= {{this.tubeSkills}}
                                        @level={{this.selectedTubeLevel}}
                                        @selectedSkills={{this.selectedTubeSkills}}
                                        @tube={{this.selectedTube}}
                                        @isThematicResultMode={{this.isThematicResultMode}}
                                        @close={{this.closeTubeLevel}}/>`);
  });

  test('it should display a list of an ordered list of skills level', function (assert) {
    assert.expect(8);
    // when
    const expectedResult = ['1', '2', '', '', '5', '6', '', ''];

    // then
    const skillsList = this.element.querySelectorAll('.levels .level');
    skillsList.forEach((node, i) => {
      assert.equal(node.textContent.trim(), expectedResult[i]);
    });
  });

  test('it should display selected skill level', function (assert) {
    assert.expect(3);
    // when
    const expectedResult = ['1', '2'];

    // then
    const skillsList = this.element.querySelectorAll('.levels .level.selected');
    assert.equal(skillsList.length, expectedResult.length);
    skillsList.forEach((node, i) => {
      assert.equal(node.textContent.trim(), expectedResult[i]);
    });
  });

  test('it should invoke `clearTubeAction` on click on erase button', async function (assert) {
    // when
    await click('[data-test-erase-button]');

    // then
    assert.deepEqual(this.clearTubeAction.getCall(0).args, [tube]);
  });

  test('it should invoke `setTubeAction` on click on skill cell', async function (assert) {
    // when
    const expectedResult = [tube, 5, [skill1.pixId, skill2.pixId, skill5.pixId]];
    await click(findAll('.levels .level')[4]);

    // then
    assert.deepEqual(this.setTubeAction.getCall(0).args, expectedResult);
  });
});

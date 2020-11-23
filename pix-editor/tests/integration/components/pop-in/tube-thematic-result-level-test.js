import { module, test }  from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | popin-tube-level', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    //given
    const skill1 = {
      id: 'rec321654',
      name: 'skill1',
      level: 1
    };
    const skill2 = {
      id: 'rec321655',
      name: 'skill2',
      level: 2
    };
    const skill5 = {
      id: 'rec321656',
      name: 'skill5',
      level: 5
    };
    const skill6 = {
      id: 'rec321657',
      name: 'skill6',
      level: 6
    };
    const tube = {
      id: 'rec123456',
      name: 'tube1',
      selectedLevel: 5,
      selectedThematicResultLevel: 2,
      productionSkills: [skill1, skill2, skill5, skill6]
    };

    //when
    this.selectedTube = tube;
    this.closeThematicResultTube = () => {};

    await render(hbs`<PopIn::TubeThematicResultLevel @tube={{this.selectedTube}} @close={{this.closeThematicResultTube}}/>`);
  });

  test('it should renders an ordered list of skills level inferior or equal to `tube.selectedLevel`', async function (assert) {
    //when
    const expectedResult = ['1', '2', '', '', '5', '', '', ''];

    //then
    const skillsList = this.element.querySelectorAll('.levels .level');
    skillsList.forEach((node, i) => {
      assert.ok(node.textContent.trim() === expectedResult[i]);
    });
  });

  test('it should display selected skills level inferior or equal to `tube.selectedThematicResultLevel`', async function (assert) {
    //when
    const expectedResult = ['1', '2'];

    //then
    const skillsList = this.element.querySelectorAll('.levels .level.selected');
    assert.ok(skillsList.length === expectedResult.length);
    skillsList.forEach((node, i) => {
      assert.ok(node.textContent.trim() === expectedResult[i]);
    });
  });
  test('it should set `tube.selectedThematicResultLevel` on click', async function (assert) {
    //when
    const skillsList = this.element.querySelectorAll('.levels .level');
    await click(skillsList[4]);

    //then
    assert.ok(`${this.selectedTube.selectedThematicResultLevel}` === skillsList[4].textContent.trim());
  });
});

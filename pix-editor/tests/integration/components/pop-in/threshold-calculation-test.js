import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pop-in/threshold-calculation', function (hooks) {
  setupRenderingTest(hooks);
  test('it display a list of selected skills count by level', async function (assert) {
    //given
    const tube1SelectedSkills = [
      {
        id: 'rec123456',
        name: 'tube1SelectedSkill1',
        isActive: true,
        level: 1
      }, {
        id: 'rec123457',
        name: 'tube1SelectedSkill2',
        isActive: true,
        level: 2
      }, {
        id: 'rec123458',
        name: 'tube1SelectedSkill3',
        isActive: true,
        level: 3
      }
    ];
    const tube2SelectedSkills = [
      {
        id: 'rec223456',
        name: 'tube2SelectedSkill4',
        isActive: true,
        level: 4
      }, {
        id: 'rec223457',
        name: 'tube2SelectedSkill5',
        isActive: true,
        level: 5
      }, {
        id: 'rec223458',
        name: 'tube2SelectedSkill6',
        isActive: true,
        level: 6
      }
    ];
    const tube3SelectedSkills = [
      {
        id: 'rec323456',
        name: 'tube2SelectedSkill7',
        isActive: true,
        level: 7
      }, {
        id: 'rec323457',
        name: 'tube2SelectedSkill8',
        isActive: true,
        level: 8
      }
    ];
    const tube4SelectedSkills = [
      {
        id: 'rec423451',
        name: 'tube2SelectedSkill1',
        isActive: true,
        level: 1
      },
      {
        id: 'rec423456',
        name: 'tube2SelectedSkill7',
        isActive: true,
        level: 7
      },
      {
        id: 'rec423457',
        name: 'tube2SelectedSkill8',
        isActive: true,
        level: 8
      }
    ];
    const areas = [{
      name: 'area1',
      sortedCompetences: [
        {
          name: 'competence1',
          productionTubes: [
            {
              name: 'tube1',
              selectedLevel: 3,
              liveSkills: tube1SelectedSkills
            }, {
              name: 'tube2',
              selectedLevel: 6,
              liveSkills: tube2SelectedSkills
            }
          ]
        }, {
          name: 'competence2',
          productionTubes: [
            {
              name: 'tube3',
              selectedLevel: 8,
              liveSkills: tube3SelectedSkills
            }
          ]
        }
      ]
    }, {
      name: 'area2',
      sortedCompetences: [
        {
          name: 'competence3',
          productionTubes: [
            {
              name: 'tube4',
              selectedLevel: 8,
              liveSkills: tube4SelectedSkills
            }
          ]
        }
      ]
    }
    ];
    const selectedSkillsCount = tube1SelectedSkills.length + tube2SelectedSkills.length + tube3SelectedSkills.length + tube4SelectedSkills.length;
    this.closeAction = function () {};
    this.areas = areas;

    //when
    await render(hbs`<PopIn::ThresholdCalculation @title="Paliers indicatifs" @close={{this.closeAction}} @model={{this.areas}}/>`);

    //then
    assert.strictEqual(this.element.querySelectorAll('tr').length, 10);
    assert.dom(this.element.querySelector('[data-test-selectedSkillsCount]')).hasText(`${selectedSkillsCount}`);
  });
});


import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | target-profile/threshold-row', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render a row with a total skill count by level and a threshold', async function(assert) {
    //given
    const selectedSkillsLevel1 = [
      {
        id: 'rec123456',
        name: 'tube1SelectedSkill1',
        isActive: true,
        level: 1
      }, {
        id: 'rec223457',
        name: 'tube2SelectedSkill1',
        isActive: true,
        level: 1
      }, {
        id: 'rec423451',
        name: 'tube2SelectedSkill1',
        isActive: true,
        level: 1
      }
    ];
    const selectedSkillsOtherLevel = [
      {
        id: 'rec123457',
        name: 'tube1SelectedSkill2',
        isActive: true,
        level: 2
      }, {
        id: 'rec123458',
        name: 'tube1SelectedSkill3',
        isActive: true,
        level: 3
      }, {
        id: 'rec223456',
        name: 'tube2SelectedSkill4',
        isActive: true,
        level: 4
      }, {
        id: 'rec223458',
        name: 'tube2SelectedSkill6',
        isActive: true,
        level: 6
      }, {
        id: 'rec323456',
        name: 'tube2SelectedSkill7',
        isActive: true,
        level: 7
      }, {
        id: 'rec323457',
        name: 'tube2SelectedSkill8',
        isActive: true,
        level: 8
      }, {
        id: 'rec423456',
        name: 'tube2SelectedSkill7',
        isActive: true,
        level: 7
      }, {
        id: 'rec423457',
        name: 'tube2SelectedSkill8',
        isActive: true,
        level: 8
      }
    ];

    const expectedCountResult = '3';
    const expectedThresholdResult = '27%';

    this.selectedSkills = [...selectedSkillsLevel1, ...selectedSkillsOtherLevel];
    this.level = 1;

    //when
    await render(hbs`<TargetProfile::ThresholdRow @level={{this.level}} @selectedSkills={{this.selectedSkills}}/>`);

    //then
    assert.dom(this.element.querySelector('[data-test-skill-count]')).hasText(expectedCountResult);
    assert.dom(this.element.querySelector('[data-test-threshold]')).hasText(expectedThresholdResult);
  });
});

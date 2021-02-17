import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | target-profile/competence-thematic-result', function (hooks) {
  setupRenderingTest(hooks);
  let tube;
  hooks.beforeEach(async function () {
    //given
    tube = {
      id: 'rec123456',
      name: '@tube1',
      practicalDescriptionFr: 'practicalDescriptionFr',
      practicalTitleFr: 'practicalTitleFr',
    };

    this.tube = tube;
    this.clickOnTube = () => {
    };
  });

  test('it should be selected if tube have a `selectedSkillLevel` if `showTubeDetails` is `false`', async function (assert) {
    //given
    this.selectedLevel = 6;
    this.showTubeDetails = false;

    //when
    await render(hbs`<TargetProfile::TubeProfile @tube={{this.tube}}
                                                 @clickAction={{this.clickOnTube}}
                                                 @selectedSkillLevel={{this.selectedLevel}}
                                                 @showTubeDetails={{this.showTubeDetails}}/>`);

    //then
    assert.dom(this.element.querySelector('[data-test-tube-profile]')).hasClass('active');
    assert.dom(this.element.querySelector('.square.icon')).hasClass('active');
    assert.dom(this.element.querySelector('.square.icon')).hasClass('check');
  });

  test('it should display a `selectedSkillLevel` if `showTubeDetails` is `true`', async function (assert) {
    //given
    this.showTubeDetails = true;
    this.selectedLevel = 6;

    //when
    await render(hbs`<TargetProfile::TubeProfile @tube={{this.tube}}
                                                 @clickAction={{this.clickOnTube}}
                                                 @selectedSkillLevel={{this.selectedLevel}}
                                                 @showTubeDetails={{this.showTubeDetails}}/>`);

    //then
    assert.dom('.max-skill-level').hasText('6');
  });
});

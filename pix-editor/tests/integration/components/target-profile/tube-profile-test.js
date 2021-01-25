import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | target-profile/competence-thematic-result', function (hooks) {
  setupRenderingTest(hooks);
  let tube, showTubeDetails;
  hooks.beforeEach(async function () {
    //given
    tube = {
      id: 'rec123456',
      name: 'tube1',
      practicalDescriptionFr: 'practicalDescriptionFr',
      practicalTitleFr: 'practicalTitleFr',
    };

    //when
    this.tube = tube;
    this.clickOnTube = () => {
    };
  });
  module('if `showTubeDetails` is false', function (hooks) {
    hooks.beforeEach(async function () {
      //given
      showTubeDetails = false;

      //when
      this.showTubeDetails = showTubeDetails;
    });
    test('it should display a `tube.practicalTitleFr` and a `tube.practicalDescriptionFr`', async function (assert) {
      //when
      const expectedTubePracticalTitleFr = tube.practicalTitleFr;
      const expectedDescription = tube.practicalDescriptionFr;
      await render(hbs`<TargetProfile::TubeProfile @tube={{this.tube}}
                                                   @clickAction={{this.clickOnTube}}
                                                   @showTubeDetails={{this.showTubeDetails}}/>`);
      //then
      assert.ok(this.element.querySelector('.practicalTitle-profile').textContent.trim() === expectedTubePracticalTitleFr);
      assert.ok(this.element.querySelector('.practicalDescription-profile').textContent.trim() === expectedDescription);
    });
    test('it should be selected if tube have a `selectedSkillLevel`', async function (assert) {
      //given
      const selectedLevel = 6;

      //when
      this.selectedLevel = selectedLevel;
      await render(hbs`<TargetProfile::TubeProfile @tube={{this.tube}}
                                                   @clickAction={{this.clickOnTube}}
                                                   @selectedSkillLevel={{this.selectedLevel}}
                                                   @showTubeDetails={{this.showTubeDetails}}/>`);
      //then
      assert.dom(this.element.querySelector('[data-test-tube-profile]')).hasClass('active');
      assert.dom(this.element.querySelector('.square.icon')).hasClass('active');
      assert.dom(this.element.querySelector('.square.icon')).hasClass('check');
    });
  });
  module('if `showTubeDetails` is true', function (hooks) {
    hooks.beforeEach(async function () {
      //given
      showTubeDetails = true;

      //when
      this.showTubeDetails = showTubeDetails;
    });
    test('it should display a `tube.name`', async function (assert) {
      //when
      const expectedTubePracticalTitleFr = tube.name;
      await render(hbs`<TargetProfile::TubeProfile @tube={{this.tube}}
                                                   @clickAction={{this.clickOnTube}}
                                                   @showTubeDetails={{this.showTubeDetails}}/>`);
      //then
      assert.ok(this.element.querySelector('.practicalTitle-profile').textContent.trim() === expectedTubePracticalTitleFr);
    });
    test('it should display a `selectedSkillLevel`', async function (assert) {
      //given
      const selectedLevel = 6;

      //when
      this.selectedLevel = selectedLevel;
      await render(hbs`<TargetProfile::TubeProfile @tube={{this.tube}}
                                                   @clickAction={{this.clickOnTube}}
                                                   @selectedSkillLevel={{this.selectedLevel}}
                                                   @showTubeDetails={{this.showTubeDetails}}/>`);
      //then
      assert.ok(this.element.querySelector('.max-skill-level').textContent.trim() === `${selectedLevel}`);
    });
  });
});

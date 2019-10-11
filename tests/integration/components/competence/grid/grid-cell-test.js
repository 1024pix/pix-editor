import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | competence-grid-cell', function (hooks) {
  setupRenderingTest(hooks);

  test('should display skill with `productionTemplate` at "true" when `view` is "challenges" and `hasProductionStatus` is "true"', async function (assert) {
    // given
    const skill = EmberObject.create({
      name: 'skill_name',
      productionTemplate: true
    });
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="challenges" hasStatusProduction=true skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 1);
  });

  test('should display an empty cell with skill with `productionTemplate` at "false" when `view` is "challenges" and `hasProductionStatus` is "true"', async function (assert) {
    // given
    const skill = EmberObject.create({
      name: 'skill_name',
      productionTemplate: false
    });
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="challenges" hasStatusProduction=true skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell__empty').length, 1);
  });

  test('should display skill when `view` is "challenges" and `hasProductionStatus` is "false"', async function (assert) {
    // given
    const skill = EmberObject.create({
      name: 'skill_name',
      productionTemplate: false
    });
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="challenges" hasStatusProduction=false skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 1);

  });

  test('should display skill when `view` is "skills"', async function (assert) {
    // given
    const skill = EmberObject.create({
      name: 'skill_name',
      productionTemplate: false
    });
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="skills" skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 1);

  });

  test('should display skill with `productionTemplate` at "true" when `view` is "quality"', async function (assert) {
    // given
    const skill = EmberObject.create({
      name: 'skill_name',
      productionTemplate: true
    });
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="quality" skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 1);
  });

  test('should display an empty cell with skill with `productionTemplate` at "false" when `view` is "quality"', async function (assert) {
    // given
    const skill = EmberObject.create({
      name: 'skill_name',
      productionTemplate: false
    });
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="quality" skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell__empty').length, 1);
  });

  test('should display a link to create skill when `mayAddSkill` is "true" and skill doesn\'t exist and `view` is "skills"', async function (assert) {

    // given
    const skill = false;
    this.set('skill', skill);

    // when
    await render(hbs`{{competence-grid-cell view="skills" mayAddSkill=true skill=skill}}`);

    // then
    assert.equal(this.element.querySelectorAll('.add-skill').length, 1);
  })
});

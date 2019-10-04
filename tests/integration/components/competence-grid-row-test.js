import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

module.only('Integration | Component | competence-grid-row', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const tube = EmberObject.create({ name: 'tube_name' });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row tube=tube}}`);

    // then
    assert.equal(this.element.querySelector('.tube-name').textContent.trim(), 'tube_name');
  });

  test('should display a link to describe the tube on tbe name when `view` is "skills"', async function(assert) {
    // given
    const tube = EmberObject.create({ name: 'tube_name' });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row view="skills" tube=tube}}`);

    // then
    assert.equal(this.element.querySelector('.tube-name a').textContent.trim(), 'tube_name');
  });

  test('should display as many cell as tube\'s filled skills', async function(assert) {
    // given
    const skill2 = EmberObject.create({name:'modèleEco2'});
    const skill3 = EmberObject.create({name:'modèleEco3'});
    const skill4 = EmberObject.create({name:'modèleEco4'});

    const skillArray = A([skill2, skill3, skill4, false]);

    const promiseArray = new Promise(resolve =>{
      resolve(skillArray)
    });

    const tube = EmberObject.create({
      name: 'tube_name',
      filledSkills: promiseArray
    });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row tube=tube}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 4);
  });

  test('should display only skills with `productionTemplate` at "true" when `view` is "challenges" and `hasProductionStatus` is "true" and skill exist or an empty cell', async function(assert) {
    // given
    const skill2 = EmberObject.create({name:'modèleEco2', productionTemplate: true});
    const skill3 = EmberObject.create({name:'modèleEco3', productionTemplate: false});
    const skill4 = EmberObject.create({name:'modèleEco4', productionTemplate: true});
    const tube = EmberObject.create({
      name: 'tube_name',
      filledSkills: A([skill2, skill3, skill4, false])
    });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row view="challenges" hasStatusProduction=true tube=tube}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 4);
    assert.equal(this.element.querySelectorAll('.skill-cell__empty').length, 2);
  });

  test('should display all skills when `view` is "challenges" and `hasProductionStatus` is "false" and skill exist or an empty cell', async function(assert) {
    // given
    const skill2 = EmberObject.create({name:'modèleEco2', productionTemplate: true});
    const skill3 = EmberObject.create({name:'modèleEco3', productionTemplate: false});
    const skill4 = EmberObject.create({name:'modèleEco4', productionTemplate: true});
    const tube = EmberObject.create({
      name: 'tube_name',
      filledSkills: A([skill2, skill3, skill4, false])
    });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row view="challenges" hasStatusProduction=false tube=tube}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 4);
    assert.equal(this.element.querySelectorAll('.skill-cell__empty').length, 1);
  });

  test('should display all skills when `view` is "skills" and skill exist or an empty cell', async function(assert) {
    // given
    const skill2 = EmberObject.create({name:'modèleEco2', productionTemplate: true});
    const skill3 = EmberObject.create({name:'modèleEco3', productionTemplate: false});
    const skill4 = EmberObject.create({name:'modèleEco4', productionTemplate: true});
    const tube = EmberObject.create({
      name: 'tube_name',
      filledSkills: A([skill2, skill3, skill4, false])
    });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row view="skills" tube=tube}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 4);
    assert.equal(this.element.querySelectorAll('.skill-cell__empty').length, 1);
  });

  test('should display skills with `productionTemplate` at "true" when `view` is "quality" and skill exist or an empty cell', async function(assert) {
    // given
    const skill2 = EmberObject.create({name:'modèleEco2', productionTemplate: true});
    const skill3 = EmberObject.create({name:'modèleEco3', productionTemplate: false});
    const skill4 = EmberObject.create({name:'modèleEco4', productionTemplate: true});
    const tube = EmberObject.create({
      name: 'tube_name',
      filledSkills: A([skill2, skill3, skill4, false])
    });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row view="quality" tube=tube}}`);

    // then
    assert.equal(this.element.querySelectorAll('.skill-cell').length, 4);
    assert.equal(this.element.querySelectorAll('.skill-cell__empty').length, 2);
  });

  test('should display a link to create skill when `mayAddSkill` is "true" and skill doesn\'t exist and `view` is "skills"', async function(assert) {
    // given
    const skill2 = EmberObject.create({name:'modèleEco2', productionTemplate: true});
    const skill3 = EmberObject.create({name:'modèleEco3', productionTemplate: false});
    const skill4 = EmberObject.create({name:'modèleEco4', productionTemplate: true});
    const tube = EmberObject.create({
      name: 'tube_name',
      filledSkills: A([skill2, skill3, skill4, false])
    });
    this.set('tube', tube);

    // when
    await render(hbs`{{competence-grid-row view="skills" mayAddSkill=true tube=tube}}`);

    // then
    assert.equal(this.element.querySelectorAll('.add-skill').length, 1);
  });

});

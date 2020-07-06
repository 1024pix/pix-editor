import Model, { attr, hasMany } from '@ember-data/model';

export default class CompetenceModel extends Model {

  needsRefresh = false;

  @attr('string', { readOnly: true }) name;
  @attr title;
  @attr code;
  @attr description;
  @attr pixId;
  @attr source;

  @hasMany('tube') rawTubes;

  get tubes() {
    return this.rawTubes.filter(tube => tube.name !== '@workbench');
  }

  get productionTubes() {
    let allTubes = this.rawTubes;
    allTubes = allTubes.filter(tube => tube.hasProductionChallenge);
    return allTubes.sortBy('name');
  }

  get sortedTubes() {
    return this.tubes.sortBy('name');
  }

  get tubeCount() {
    return this.tubes.length;
  }

  get productionTubeCount() {
    return this.productionTubes.length;
  }

  get selectedProductionTubeCount() {
    return this.productionTubes.filter(tube => tube.selectedLevel).length;
  }

  get skillCount() {
    return this.tubes.map(tube => tube.skillCount).reduce((count, value)=> {
      return count + value;
    },0);
  }

  get productionSkillCount() {
    return this.tubes.map(tube => tube.productionSkillCount).reduce((count, value)=> {
      return count + value;
    },0);
  }

  get workbenchSkill() {
    const workbenchTube = this.rawTubes.find(tube => tube.name === '@workbench');
    if (workbenchTube) {
      return workbenchTube.rawSkills.firstObject;
    }
    return null;
  }

  get workbenchTemplates() {
    const workbenchSkill = this.workbenchSkill;
    if (workbenchSkill) {
      return workbenchSkill.templates.filter(template => !template.get('isArchived'));
    }
    return [];
  }
}

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CompetenceModel extends Model {

  needsRefresh = false;

  @attr title;
  @attr titleEn;
  @attr description;
  @attr descriptionEn;
  @attr code;
  @attr pixId;
  @attr source;

  @belongsTo('area') area;

  @hasMany('tube') rawTubes;
  @hasMany('theme') rawThemes;

  get name() {
    return `${this.code} ${this.title}`;
  }

  get tubes() {
    return this.rawTubes.filter(tube => tube.name !== '@workbench');
  }

  get themes() {
    return this.rawThemes.filter(theme => theme.name.indexOf('workbench') === -1);
  }

  get sortedThemes() {
    return this.themes.sortBy('name').sortBy('index');
  }

  get productionTubes() {
    const allTubes = this.rawTubes.filter(tube => tube.hasProductionSkills);
    return allTubes.sortBy('index');
  }

  get sortedTubes() {
    return this.tubes.sortBy('index');
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

  get selectedThematicResultTubeCount() {
    return this.productionTubes.filter(tube => tube.selectedThematicResultLevel).length;
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

  get workbenchPrototypes() {
    const workbenchSkill = this.workbenchSkill;
    if (workbenchSkill) {
      return workbenchSkill.prototypes.filter(prototype => !prototype.get('isArchived'));
    }
    return [];
  }
}

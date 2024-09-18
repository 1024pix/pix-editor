import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CompetenceModel extends Model {

  @attr title;
  @attr titleEn;
  @attr description;
  @attr descriptionEn;
  @attr code;
  @attr pixId;
  @attr source;

  @belongsTo('area', { async: true, inverse: 'competences' }) area;

  @hasMany('tube', { async: true, inverse: 'competence' }) rawTubes;
  @hasMany('theme', { async: true, inverse: 'competence' }) rawThemes;

  get name() {
    return `${this.code} ${this.title}`;
  }

  get tubes() {
    const rawTubes = this.hasMany('rawTubes').value();

    if (rawTubes === null) return [];

    return rawTubes.filter((tube) => tube.name !== '@workbench');
  }

  get themes() {
    const rawThemes = this.hasMany('rawThemes').value();

    if (rawThemes === null) return [];

    return rawThemes.filter((theme) => theme.name.indexOf('workbench') === -1);
  }

  get sortedThemes() {
    return this.themes.sortBy('name').sortBy('index');
  }

  get productionTubes() {
    const rawTubes = this.hasMany('rawTubes').value();

    if (rawTubes === null) return [];

    return rawTubes
      .filter((tube) => tube.hasProductionSkills)
      .sortBy('index');
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
    return this.productionTubes.filter((tube) => tube.selectedLevel).length;
  }

  get selectedThematicResultTubeCount() {
    return this.productionTubes.filter((tube) => tube.selectedThematicResultLevel).length;
  }

  get skillCount() {
    return this.tubes.map((tube) => tube.skillCount).reduce((count, value) => {
      return count + value;
    }, 0);
  }

  get productionSkillCount() {
    return this.tubes.map((tube) => tube.productionSkillCount).reduce((count, value) => {
      return count + value;
    }, 0);
  }

  get workbenchSkill() {
    const rawTubes = this.hasMany('rawTubes').value() ?? [];
    const workbenchTube = rawTubes.find((tube) => tube.name === '@workbench');
    if (workbenchTube) {
      const rawSkills = workbenchTube.hasMany('rawSkills').value() ?? [];
      return rawSkills[0] ;
    }
    return null;
  }

  get workbenchPrototypes() {
    const workbenchSkill = this.workbenchSkill;
    if (workbenchSkill) {
      return workbenchSkill.prototypes.filter((prototype) => !prototype.get('isArchived'));
    }
    return [];
  }
}

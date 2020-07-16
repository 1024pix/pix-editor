import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class TubeModel extends Model {

  selectedSkills = [];

  @attr name;
  @attr title;
  @attr description;
  @attr practicalTitle;
  @attr practicalTitleEn;
  @attr practicalDescription;
  @attr practicalDescriptionEn;
  @attr pixId;

  @belongsTo('competence') competence;
  @hasMany('skill') rawSkills;

  @tracked selectedLevel = false;

  get liveSkills() {
    return this.rawSkills.filter(skill => !(skill.isArchived || skill.isExpired));
  }

  get skillCount() {
    return this.liveSkills.length;
  }

  get productionSkills() {
    return this.sortedSkills.filter(skill => skill.productionTemplate != null);
  }

  get productionSkillCount() {
    return this.liveSkills.map(skill => skill.productionTemplate).filter(challenge => challenge != null).length;
  }

  get sortedSkills() {
    return this.liveSkills.sortBy('level');
  }

  get filledSkills() {
    return this.sortedSkills.reduce((grid, skill) => {
      grid[skill.level - 1] = skill;
      return grid;
    },[false, false, false, false, false, false, false]);
  }

  get hasProductionChallenge() {
    return this.productionSkillCount > 0;
  }

}

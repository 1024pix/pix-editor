import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import {tracked} from '@glimmer/tracking';
export default class TubeModel extends Model {

  selectedSkills = [];

  @attr name;
  @attr title;
  @attr description;
  @attr practicalTitle;
  @attr practicalDescription;
  @attr pixId;

  @belongsTo('competence') competence;
  @hasMany('skill') rawSkills;

  @tracked selectedLevel = false;

  get skills() {
    return this.rawSkills.filter(skill => skill.status !== 'archivé');
  }

  get skillCount() {
    return this.skills.length;
  }

  get productionSkills() {
    return this.sortedSkills.filter(skill => skill.productionTemplate != null);
  }

  get productionSkillCount() {
    return this.skills.map(skill => skill.productionTemplate).filter(challenge => challenge != null).length;
  }

  get sortedSkills() {
    return this.skills.sortBy('level');
  }

  get filledSkills() {
    return this.sortedSkills.reduce((grid, skill) => {
        grid[skill.level-1] = skill;
        return grid;
      },[false, false, false, false, false, false, false]);
  }

  get hasProductionChallenge() {
    return this.productionSkillCount > 0;
  }

}

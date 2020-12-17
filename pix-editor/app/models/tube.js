import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class TubeModel extends Model {

  selectedSkills = [];
  selectedThematicResultSkills = [];

  @attr name;
  @attr title;
  @attr description;
  @attr practicalTitleFr;
  @attr practicalTitleEn;
  @attr practicalDescriptionFr;
  @attr practicalDescriptionEn;
  @attr pixId;

  @belongsTo('competence') competence;
  @hasMany('skill') rawSkills;

  @tracked selectedLevel = false;
  @tracked selectedThematicResultLevel = false;

  get liveSkills() {
    return this.rawSkills.filter(skill => skill.isLive);
  }

  get deadSkills() {
    return this.rawSkills.filter(skill => !skill.isLive);
  }

  get skillCount() {
    return this.liveSkills.length;
  }

  get productionSkills() {
    return this.sortedSkills.filter(skill => skill.productionPrototype != null);
  }

  get productionSkillCount() {
    return this.productionSkills.length;
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

  get filledDeadSkills() {
    return this.deadSkills.reduce((grid, skill) => {
      if (grid[skill.level - 1]) {
        grid[skill.level - 1].push(skill);
      } else {
        grid[skill.level - 1] = [skill];
      }
      return grid;
    },[false, false, false, false, false, false, false]);
  }

  get hasProductionChallenge() {
    return this.productionSkillCount > 0;
  }

}

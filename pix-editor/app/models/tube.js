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
      if (grid[skill.level - 1] && skill.isDraft) {
        return grid;
      }
      grid[skill.level - 1] = skill;
      return grid;
    },[false, false, false, false, false, false, false]);
  }

  get filledLiveSkills() {
    const filledSkills =  this._filledAllVersionSkills(this.liveSkills);
    return filledSkills.map(filledSkill => {
      if (filledSkill && filledSkill.length > 1) {
        return filledSkill.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return filledSkill;
    });
  }

  get filledDeadSkills() {
    return this._filledAllVersionSkills(this.deadSkills);
  }

  _filledAllVersionSkills(skills) {
    return skills.reduce((grid, skill) => {
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

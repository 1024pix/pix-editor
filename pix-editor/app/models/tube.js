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
  @attr index;
  @attr pixId;

  @belongsTo('competence') competence;
  @belongsTo('theme') theme;
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
    return this.sortedSkills.filter(skill => skill.status === 'actif');
  }

  get productionSkillCount() {
    return this.productionSkills.length;
  }

  get sortedSkills() {
    return this.liveSkills.sortBy('level');
  }

  get filledSkills() {
    return this._getFilledOrderedVersions(this.rawSkills);
  }

  get filledProductionSkills() {
    return this._getFilledOrderedVersions(this.productionSkills).flat();
  }

  get filledLiveSkills() {
    return this._getFilledOrderedVersions(this.liveSkills);
  }

  get filledDeadSkills() {
    return this._getFilledOrderedVersions(this.deadSkills);
  }

  getNextSkillVersion(level) {
    const skills = this.filledSkills[level - 1];
    return skills.length;
  }

  _getFilledOrderedVersions(skills) {
    const filledSkills = this._getFilledSkillGroupByLevel(skills);
    return filledSkills.map(filledSkill => {
      if (filledSkill && filledSkill.length > 1) {
        return filledSkill.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return filledSkill;
    });
  }

  _getFilledSkillGroupByLevel(skills) {
    return skills.reduce((grid, skill) => {
      if (grid[skill.level - 1]) {
        grid[skill.level - 1].push(skill);
      } else {
        grid[skill.level - 1] = [skill];
      }
      return grid;
    }, [false, false, false, false, false, false, false]);
  }

  get hasProductionSkills() {
    return this.productionSkillCount > 0;
  }
}

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class TubeModel extends Model {

  selectedSkills = [];
  selectedThematicResultSkills = [];

  @attr name;
  @attr practicalTitleFr;
  @attr practicalTitleEn;
  @attr practicalDescriptionFr;
  @attr practicalDescriptionEn;
  @attr index;
  @attr pixId;

  @belongsTo('competence', { async: true, inverse: 'rawTubes' }) competence;
  @belongsTo('theme', { async: true, inverse: 'rawTubes' }) theme;
  @hasMany('skill', { async: true, inverse: 'tube' }) rawSkills;

  @tracked selectedLevel = false;
  @tracked selectedThematicResultLevel = false;

  get rawSkillsArray() {
    return this.hasMany('rawSkills').value() || [];
  }

  get liveSkills() {
    return this.rawSkillsArray.filter((skill) => skill.isLive);
  }

  get draftSkills() {
    return this.rawSkillsArray.filter((skill) => skill.isDraft);
  }

  get deadSkills() {
    return this.rawSkillsArray.filter((skill) => !skill.isLive);
  }

  get skillCount() {
    return this.liveSkills.length;
  }

  get productionSkills() {
    return this.sortedSkills.filter((skill) => skill.status === 'actif');
  }

  get workbenchSkill() {
    return this.rawSkillsArray.find((skill) => skill.name === '@workbench');
  }

  get productionSkillCount() {
    return this.productionSkills.length;
  }

  get sortedSkills() {
    return _.sortBy(this.liveSkills, 'level');
  }

  get filledSkills() {
    return this._getFilledOrderedVersions(this.rawSkillsArray);
  }

  get filledProductionSkills() {
    return this._getFilledOrderedVersions(this.productionSkills).flat();
  }

  get filledLiveSkills() {
    return this._getFilledOrderedVersions(this.liveSkills);
  }

  get filledDraftSkills() {
    return this._getFilledOrderedVersions(this.draftSkills);
  }

  get filledLastDraftSkills() {
    return this.filledDraftSkills.map((draftSkills) => {
      if (draftSkills) {
        return draftSkills[draftSkills.length - 1];
      }
      return draftSkills;
    });
  }

  get filledDeadSkills() {
    return this._getFilledOrderedVersions(this.deadSkills);
  }

  get hasProductionSkills() {
    return this.productionSkillCount > 0;
  }

  getNextSkillVersion(level) {
    const skills = this.filledSkills[level - 1];
    return skills.length;
  }

  _getFilledOrderedVersions(skills) {
    const filledSkills = this._getFilledSkillGroupByLevel(skills);
    return filledSkills.map((filledSkill) => {
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
}
